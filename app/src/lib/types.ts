export type ColumnType = "number" | "string" | "boolean" | "date";

export interface ColumnSummary {
  name: string;
  type: ColumnType;
  count: number;
  missing: number;
  unique: number;
  // Numeric stats
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stddev?: number;
  // Categorical/string stats
  topValues?: { value: string; count: number }[];
  // Date stats
  earliest?: string;
  latest?: string;
}

export interface DatasetSummary {
  rowCount: number;
  columnCount: number;
  columns: ColumnSummary[];
  sampleRows: Record<string, unknown>[];
}

export type ChartKind = "bar" | "line" | "area" | "scatter" | "pie" | "histogram";

export interface ChartSpec {
  kind: ChartKind;
  title: string;
  description?: string;
  // Field references — refer to columns in the data, or "__count__" for histogram bin counts.
  x: string;
  y?: string;
  // Optional series field for grouping
  series?: string;
  // Histogram-only
  bins?: number;
  // Optional already-aggregated data the LLM/server prepared.
  // If present, we render this directly instead of computing from raw rows.
  data?: Record<string, string | number>[];
}

export interface AnalysisStep {
  title: string;
  body: string;
}

export interface AnalysisResult {
  question: string;
  domain?: string;
  hypothesis: string;
  approach: string;
  keyFindings: string[];
  insights: AnalysisStep[];
  charts: ChartSpec[];
  conclusion: string;
  nextExperiments: string[];
  caveats?: string[];
  confidence?: "low" | "medium" | "high";
}

export interface AnalyzeRequest {
  question: string;
  // Tabular data (rows of objects). Optional — many questions are conceptual.
  rows?: Record<string, unknown>[];
  // Or raw text/notes the user pasted (papers, observations, etc.)
  notes?: string;
  // Optional dataset name shown in the report
  datasetName?: string;
}

export interface AnalyzeResponse {
  result: AnalysisResult;
  summary?: DatasetSummary;
  model: string;
  elapsedMs: number;
  source: "live" | "demo";
}
