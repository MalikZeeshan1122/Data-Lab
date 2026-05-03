"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { histogram } from "@/lib/data";
import type { ChartSpec } from "@/lib/types";

const PALETTE = [
  "#a78bfa", // violet
  "#22d3ee", // cyan
  "#f472b6", // pink
  "#34d399", // green
  "#fbbf24", // amber
  "#60a5fa", // blue
  "#f87171", // red
  "#c084fc", // purple
];

interface ChartViewProps {
  spec: ChartSpec;
  rows: Record<string, unknown>[];
}

const tooltipStyle = {
  background: "rgba(20, 12, 36, 0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: "8px 10px",
  fontSize: 12,
};

const tooltipItem = { color: "#f5f3ff" };
const tooltipLabel = { color: "#a99fc4", marginBottom: 4 };

export function ChartView({ spec, rows }: ChartViewProps) {
  const data = React.useMemo(() => prepareData(spec, rows), [spec, rows]);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/55">
        Not enough data to render <span className="text-white">{spec.title}</span>.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-2">
        <h4 className="text-sm font-semibold tracking-tight text-white">{spec.title}</h4>
        {spec.description && (
          <p className="mt-0.5 text-xs text-white/55">{spec.description}</p>
        )}
      </div>
      <div style={{ width: "100%", height: 288 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          {renderChart(spec, data)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function renderChart(spec: ChartSpec, data: Record<string, unknown>[]) {
  const xKey = spec.kind === "histogram" ? "bin" : spec.x;
  const yKey = spec.kind === "histogram" ? "count" : spec.y;

  switch (spec.kind) {
    case "line": {
      const seriesKeys = uniqueSeries(data, spec.series);
      return (
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItem}
            labelStyle={tooltipLabel}
            cursor={{ stroke: "rgba(255,255,255,0.08)" }}
          />
          {spec.series ? (
            seriesKeys.map((s, i) => (
              <Line
                key={s}
                type="monotone"
                dataKey={(d: Record<string, unknown>) =>
                  d[spec.series as string] === s ? Number(d[yKey as string] ?? 0) : null
                }
                name={s}
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 2.5, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                connectNulls
                isAnimationActive
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey={yKey ?? "value"}
              stroke={PALETTE[0]}
              strokeWidth={2}
              dot={{ r: 2.5, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              isAnimationActive
            />
          )}
          {spec.series && <Legend wrapperStyle={{ fontSize: 11 }} />}
        </LineChart>
      );
    }
    case "area": {
      return (
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PALETTE[0]} stopOpacity={0.5} />
              <stop offset="95%" stopColor={PALETTE[0]} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItem}
            labelStyle={tooltipLabel}
          />
          <Area
            type="monotone"
            dataKey={yKey ?? "value"}
            stroke={PALETTE[0]}
            strokeWidth={2}
            fill="url(#areaFill)"
            isAnimationActive
          />
        </AreaChart>
      );
    }
    case "bar": {
      const seriesKeys = uniqueSeries(data, spec.series);
      const aggregated = spec.series
        ? data
        : aggregateBar(data, spec.x, spec.y || "");
      return (
        <BarChart data={aggregated} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItem}
            labelStyle={tooltipLabel}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          {spec.series ? (
            seriesKeys.map((s, i) => (
              <Bar
                key={s}
                dataKey={(d: Record<string, unknown>) =>
                  d[spec.series as string] === s ? Number(d[yKey as string] ?? 0) : 0
                }
                name={s}
                stackId="series"
                fill={PALETTE[i % PALETTE.length]}
                radius={[6, 6, 0, 0]}
                isAnimationActive
              />
            ))
          ) : (
            <Bar
              dataKey={yKey ?? "value"}
              fill={PALETTE[0]}
              radius={[6, 6, 0, 0]}
              isAnimationActive
            />
          )}
          {spec.series && <Legend wrapperStyle={{ fontSize: 11 }} />}
        </BarChart>
      );
    }
    case "histogram": {
      return (
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="bin" tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItem}
            labelStyle={tooltipLabel}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="count" fill={PALETTE[1]} radius={[6, 6, 0, 0]} isAnimationActive />
        </BarChart>
      );
    }
    case "scatter": {
      const seriesKeys = uniqueSeries(data, spec.series);
      return (
        <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={spec.x} type="number" tickLine={false} axisLine={false} />
          <YAxis dataKey={spec.y} type="number" tickLine={false} axisLine={false} />
          <ZAxis range={[40, 40]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.15)" }}
            contentStyle={tooltipStyle}
            itemStyle={tooltipItem}
            labelStyle={tooltipLabel}
          />
          {spec.series ? (
            seriesKeys.map((s, i) => (
              <Scatter
                key={s}
                name={s}
                data={data.filter((d) => d[spec.series as string] === s)}
                fill={PALETTE[i % PALETTE.length]}
                isAnimationActive
              />
            ))
          ) : (
            <Scatter data={data} fill={PALETTE[0]} isAnimationActive />
          )}
          {spec.series && <Legend wrapperStyle={{ fontSize: 11 }} />}
        </ScatterChart>
      );
    }
    case "pie": {
      const aggregated = aggregatePie(data, spec.x, spec.y);
      return (
        <PieChart>
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={tooltipItem}
            labelStyle={tooltipLabel}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Pie
            data={aggregated}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={48}
            stroke="rgba(0,0,0,0.4)"
            isAnimationActive
          >
            {aggregated.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    }
    default:
      return <></>;
  }
}

function uniqueSeries(
  data: Record<string, unknown>[],
  seriesKey?: string,
): string[] {
  if (!seriesKey) return [];
  const set = new Set<string>();
  for (const d of data) {
    const v = d[seriesKey];
    if (v !== null && v !== undefined && v !== "") set.add(String(v));
  }
  return [...set];
}

function aggregateBar(
  data: Record<string, unknown>[],
  xKey: string,
  yKey: string,
): Record<string, unknown>[] {
  if (!yKey) return data;
  // If multiple rows share xKey, sum yKey.
  const map = new Map<string, number>();
  for (const d of data) {
    const x = String(d[xKey] ?? "");
    const y = Number(d[yKey] ?? 0);
    if (!Number.isFinite(y)) continue;
    map.set(x, (map.get(x) || 0) + y);
  }
  return [...map.entries()].map(([k, v]) => ({ [xKey]: k, [yKey]: v }));
}

function aggregatePie(
  data: Record<string, unknown>[],
  nameKey: string,
  valueKey: string | undefined,
): { name: string; value: number }[] {
  const map = new Map<string, number>();
  for (const d of data) {
    const name = String(d[nameKey] ?? "");
    if (valueKey) {
      const v = Number(d[valueKey] ?? 0);
      if (Number.isFinite(v)) map.set(name, (map.get(name) || 0) + v);
    } else {
      map.set(name, (map.get(name) || 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function prepareData(
  spec: ChartSpec,
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  // If the LLM provided pre-aggregated data, prefer it.
  if (spec.data && spec.data.length) return spec.data;

  if (spec.kind === "histogram") {
    if (!rows.length || !spec.x) return [];
    return histogram(rows, spec.x, spec.bins ?? 12);
  }
  return rows;
}
