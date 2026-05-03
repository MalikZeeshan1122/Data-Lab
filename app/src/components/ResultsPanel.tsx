"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  FileText,
  Lightbulb,
  ListChecks,
  Microscope,
  Sparkles,
  TestTubeDiagonal,
  Trophy,
} from "lucide-react";
import { ChartView } from "./ChartView";
import { Prose } from "@/lib/md";
import type { AnalysisResult, ColumnSummary, DatasetSummary } from "@/lib/types";
import { formatNumber } from "@/lib/data";
import { cn } from "@/lib/cn";

interface ResultsPanelProps {
  result: AnalysisResult | null;
  summary: DatasetSummary | undefined;
  rows: Record<string, unknown>[];
  source: "live" | "demo" | null;
  model: string | null;
  elapsedMs: number | null;
  isRunning: boolean;
  error: string | null;
}

const STAGES = [
  { label: "Reading data", icon: FileText },
  { label: "Forming hypothesis", icon: Lightbulb },
  { label: "Designing experiment", icon: TestTubeDiagonal },
  { label: "Computing results", icon: Microscope },
  { label: "Drafting conclusions", icon: Sparkles },
];

export function ResultsPanel({
  result,
  summary,
  rows,
  source,
  model,
  elapsedMs,
  isRunning,
  error,
}: ResultsPanelProps) {
  return (
    <div className="card flex min-h-[320px] flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Microscope className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-semibold tracking-tight">Lab notebook</h3>
          {result?.confidence && (
            <span
              className={cn(
                "chip",
                result.confidence === "high" && "border-emerald-400/30 text-emerald-200",
                result.confidence === "medium" && "border-amber-400/30 text-amber-200",
                result.confidence === "low" && "border-rose-400/30 text-rose-200",
              )}
            >
              <CheckCircle2 className="h-3 w-3" />
              {result.confidence} confidence
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/55">
          {model && (
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              {model}
            </span>
          )}
          {elapsedMs !== null && <span className="chip">{(elapsedMs / 1000).toFixed(2)}s</span>}
          {source === "demo" && <span className="chip text-amber-200 border-amber-400/30">demo mode</span>}
        </div>
      </div>

      {!result && !isRunning && (
        <EmptyState />
      )}

      {isRunning && <RunningState />}

      {error && !isRunning && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <div>
            <div className="font-medium">Live analysis fell back to demo mode</div>
            <div className="text-amber-200/80">{error}</div>
          </div>
        </div>
      )}

      {result && !isRunning && (
        <ResultBody result={result} rows={rows} summary={summary} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 ring-1 ring-white/10">
        <Microscope className="h-6 w-6 text-violet-300" />
      </div>
      <h4 className="text-base font-semibold">Awaiting your experiment</h4>
      <p className="mt-1 max-w-sm text-sm text-white/55">
        Drop a CSV, ask a question, and the AI Scientist will form a hypothesis, run
        the math, and report findings — usually in under 5 seconds.
      </p>
      <div className="mt-4 grid w-full max-w-md grid-cols-5 gap-2">
        {STAGES.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] p-2"
            >
              <Icon className="h-3.5 w-3.5 text-white/45" />
              <span className="text-[10px] leading-tight text-white/40">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RunningState() {
  const [stage, setStage] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => (s + 1) % STAGES.length);
    }, 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-5 flex flex-1 flex-col items-center justify-center">
      <div className="grid w-full max-w-md grid-cols-5 gap-2">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const active = i <= stage;
          return (
            <div
              key={s.label}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 transition",
                active
                  ? "border-violet-400/40 bg-violet-400/10"
                  : "border-white/5 bg-white/[0.02]",
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 transition",
                  active ? "text-violet-200" : "text-white/35",
                )}
              />
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  active ? "text-violet-100" : "text-white/35",
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 w-full max-w-lg space-y-2">
        <div className="shimmer h-3 w-2/3 rounded" />
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-5/6 rounded" />
        <div className="mt-4 shimmer h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}

function ResultBody({
  result,
  rows,
  summary,
}: {
  result: AnalysisResult;
  rows: Record<string, unknown>[];
  summary?: DatasetSummary;
}) {
  return (
    <div className="mt-4 space-y-5">
      {/* Question + Domain */}
      <section className="reveal">
        <div className="text-xs uppercase tracking-wider text-white/45">Question</div>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-snug text-white">
            {result.question}
          </h2>
          <CopyButton text={resultToMarkdown(result)} />
        </div>
        {result.domain && (
          <div className="mt-1 chip border-violet-400/30 text-violet-100">
            {result.domain}
          </div>
        )}
      </section>

      {/* Hypothesis + Approach */}
      <section className="reveal grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-violet-200">
            <Lightbulb className="h-3.5 w-3.5" /> Hypothesis
          </div>
          <Prose text={result.hypothesis} />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-200">
            <TestTubeDiagonal className="h-3.5 w-3.5" /> Approach
          </div>
          <Prose text={result.approach} />
        </div>
      </section>

      {/* Computed stats from local data — deterministic */}
      {summary && summary.rowCount > 0 && (
        <section className="reveal">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-white/55">
            <Microscope className="h-3.5 w-3.5" />
            Computed evidence
            <span className="chip">deterministic</span>
          </div>
          <ColumnGrid columns={summary.columns} />
        </section>
      )}

      {/* Key findings */}
      {result.keyFindings.length > 0 && (
        <section className="reveal">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-white/55">
            <ListChecks className="h-3.5 w-3.5" /> Key findings
          </div>
          <ul className="space-y-2">
            {result.keyFindings.map((f, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-gradient-to-br from-violet-500 to-cyan-400 font-mono text-[11px] font-semibold text-white shadow">
                  {i + 1}
                </span>
                <div className="text-sm leading-6 text-white/85">{f}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Charts */}
      {result.charts.length > 0 && (
        <section className="reveal space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/55">
            <Sparkles className="h-3.5 w-3.5" /> Visualizations
          </div>
          <div className="grid gap-3 md:grid-cols-1">
            {result.charts.map((c, i) => (
              <ChartView key={i} spec={c} rows={rows} />
            ))}
          </div>
        </section>
      )}

      {/* Insights */}
      {result.insights.length > 0 && (
        <section className="reveal space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/55">
            <Lightbulb className="h-3.5 w-3.5" /> Deeper insights
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {result.insights.map((ins, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="text-sm font-semibold text-white">{ins.title}</div>
                <Prose text={ins.body} className="mt-1" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Conclusion */}
      <section className="reveal rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500/10 to-cyan-400/5 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-violet-100">
          <Trophy className="h-3.5 w-3.5" /> Conclusion
        </div>
        <Prose text={result.conclusion} className="text-white" />
      </section>

      {/* Next experiments + caveats */}
      <section className="reveal grid gap-3 md:grid-cols-2">
        {result.nextExperiments.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-200">
              <TestTubeDiagonal className="h-3.5 w-3.5" /> Next experiments
            </div>
            <ul className="space-y-1.5 text-sm text-white/85">
              {result.nextExperiments.map((n, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-cyan-300" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.caveats && result.caveats.length > 0 && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" /> Caveats
            </div>
            <ul className="space-y-1.5 text-sm text-amber-100/85">
              {result.caveats.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-300" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function ColumnGrid({ columns }: { columns: ColumnSummary[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {columns.map((c) => (
        <div
          key={c.name}
          className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-medium text-white">{c.name}</div>
            <span className="chip">{c.type}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-white/60">
            <span>n = {c.count.toLocaleString()}</span>
            <span>missing = {c.missing}</span>
            <span>unique = {c.unique}</span>
            {c.type === "number" && (
              <>
                <span>mean = {formatNumber(c.mean)}</span>
                <span>std = {formatNumber(c.stddev)}</span>
                <span>min = {formatNumber(c.min)}</span>
                <span>max = {formatNumber(c.max)}</span>
              </>
            )}
            {c.type === "string" && c.topValues?.[0] && (
              <span className="col-span-2 truncate">
                top: {c.topValues[0].value} ({c.topValues[0].count})
              </span>
            )}
            {c.type === "date" && c.earliest && c.latest && (
              <span className="col-span-2 truncate">
                {fmtDate(c.earliest)} → {fmtDate(c.latest)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          // ignore
        }
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/70 hover:text-white hover:border-white/20"
    >
      <ClipboardCopy className="h-3 w-3" />
      {copied ? "Copied" : "Copy report"}
    </button>
  );
}

function resultToMarkdown(r: AnalysisResult): string {
  const out: string[] = [];
  out.push(`# AI Scientist report`);
  out.push(``);
  out.push(`**Question:** ${r.question}`);
  if (r.domain) out.push(`**Domain:** ${r.domain}`);
  if (r.confidence) out.push(`**Confidence:** ${r.confidence}`);
  out.push(``);
  out.push(`## Hypothesis`);
  out.push(r.hypothesis);
  out.push(``);
  out.push(`## Approach`);
  out.push(r.approach);
  out.push(``);
  if (r.keyFindings.length) {
    out.push(`## Key findings`);
    r.keyFindings.forEach((f) => out.push(`- ${f}`));
    out.push(``);
  }
  if (r.insights.length) {
    out.push(`## Insights`);
    r.insights.forEach((i) => {
      out.push(`### ${i.title}`);
      out.push(i.body);
      out.push(``);
    });
  }
  out.push(`## Conclusion`);
  out.push(r.conclusion);
  out.push(``);
  if (r.nextExperiments.length) {
    out.push(`## Next experiments`);
    r.nextExperiments.forEach((n) => out.push(`- ${n}`));
    out.push(``);
  }
  if (r.caveats?.length) {
    out.push(`## Caveats`);
    r.caveats.forEach((c) => out.push(`- ${c}`));
  }
  return out.join("\n");
}
