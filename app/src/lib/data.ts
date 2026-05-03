import Papa from "papaparse";
import type { ColumnSummary, ColumnType, DatasetSummary } from "./types";

export function parseCsv(text: string): Record<string, unknown>[] {
  const result = Papa.parse<Record<string, unknown>>(text.trim(), {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return (result.data || []).filter(
    (row) => row && typeof row === "object" && Object.keys(row).length > 0,
  );
}

export function tryParseJsonRows(text: string): Record<string, unknown>[] | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((r) => r && typeof r === "object");
    }
    if (parsed && typeof parsed === "object") {
      // {col: [vals]} -> rows
      const keys = Object.keys(parsed);
      if (keys.length && keys.every((k) => Array.isArray((parsed as Record<string, unknown>)[k]))) {
        const cols = parsed as Record<string, unknown[]>;
        const len = Math.max(...keys.map((k) => cols[k].length));
        const rows: Record<string, unknown>[] = [];
        for (let i = 0; i < len; i++) {
          const row: Record<string, unknown> = {};
          for (const k of keys) row[k] = cols[k][i];
          rows.push(row);
        }
        return rows;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function autoParseRows(text: string): Record<string, unknown>[] {
  const json = tryParseJsonRows(text);
  if (json && json.length) return json;
  return parseCsv(text);
}

function inferType(values: unknown[]): ColumnType {
  let nums = 0;
  let bools = 0;
  let dates = 0;
  let total = 0;
  for (const v of values) {
    if (v === null || v === undefined || v === "") continue;
    total++;
    if (typeof v === "number" && Number.isFinite(v)) {
      nums++;
      continue;
    }
    if (typeof v === "boolean") {
      bools++;
      continue;
    }
    if (typeof v === "string") {
      if (v === "true" || v === "false") {
        bools++;
        continue;
      }
      const asNum = Number(v);
      if (!Number.isNaN(asNum) && v.trim() !== "") {
        nums++;
        continue;
      }
      const ts = Date.parse(v);
      if (!Number.isNaN(ts) && /\d{4}|\d{1,2}[\/\-]\d{1,2}/.test(v)) {
        dates++;
        continue;
      }
    }
  }
  if (total === 0) return "string";
  const ratio = (n: number) => n / total;
  if (ratio(nums) >= 0.85) return "number";
  if (ratio(bools) >= 0.85) return "boolean";
  if (ratio(dates) >= 0.7) return "date";
  return "string";
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function summarizeColumn(name: string, values: unknown[]): ColumnSummary {
  const type = inferType(values);
  const nonMissing = values.filter((v) => v !== null && v !== undefined && v !== "");
  const missing = values.length - nonMissing.length;
  const uniqueSet = new Set(nonMissing.map((v) => String(v)));

  const base: ColumnSummary = {
    name,
    type,
    count: nonMissing.length,
    missing,
    unique: uniqueSet.size,
  };

  if (type === "number") {
    const nums = nonMissing
      .map(toNumber)
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);
    if (nums.length) {
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const variance =
        nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / nums.length;
      base.min = nums[0];
      base.max = nums[nums.length - 1];
      base.mean = mean;
      base.median = nums[Math.floor(nums.length / 2)];
      base.stddev = Math.sqrt(variance);
    }
  } else if (type === "date") {
    const ts = nonMissing
      .map((v) => (typeof v === "string" ? Date.parse(v) : NaN))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    if (ts.length) {
      base.earliest = new Date(ts[0]).toISOString();
      base.latest = new Date(ts[ts.length - 1]).toISOString();
    }
  } else {
    const counts = new Map<string, number>();
    for (const v of nonMissing) {
      const key = String(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    base.topValues = [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  return base;
}

export function summarizeDataset(rows: Record<string, unknown>[]): DatasetSummary {
  if (!rows.length) {
    return { rowCount: 0, columnCount: 0, columns: [], sampleRows: [] };
  }
  const columnNames = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );
  const columns = columnNames.map((name) =>
    summarizeColumn(
      name,
      rows.map((r) => r[name]),
    ),
  );
  const sampleRows = rows.slice(0, 8);
  return {
    rowCount: rows.length,
    columnCount: columnNames.length,
    columns,
    sampleRows,
  };
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export function formatNumber(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "—";
  if (Number.isInteger(n) && Math.abs(n) < 1e6) return n.toLocaleString();
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}

/**
 * Build a histogram for numeric data over a column.
 */
export function histogram(
  rows: Record<string, unknown>[],
  field: string,
  bins = 12,
): { bin: string; count: number }[] {
  const nums = rows
    .map((r) => toNumber(r[field]))
    .filter((n): n is number => n !== null);
  if (!nums.length) return [];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (min === max) {
    return [{ bin: formatNumber(min), count: nums.length }];
  }
  const width = (max - min) / bins;
  const counts = new Array(bins).fill(0);
  for (const n of nums) {
    const idx = Math.min(bins - 1, Math.floor((n - min) / width));
    counts[idx]++;
  }
  return counts.map((c, i) => {
    const lo = min + i * width;
    const hi = lo + width;
    return { bin: `${formatNumber(lo)}–${formatNumber(hi)}`, count: c };
  });
}
