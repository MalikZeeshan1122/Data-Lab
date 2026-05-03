import Groq from "groq-sdk";
import type { AnalysisResult, DatasetSummary } from "./types";

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are AI Scientist, an autonomous research partner.

Given a user's question and (optionally) a tabular dataset summary, you must reason like a careful scientist and produce a rigorous, structured analysis.

You will ALWAYS respond with a single valid JSON object that matches this TypeScript type EXACTLY — no markdown fences, no commentary outside JSON:

interface AnalysisResult {
  question: string;          // Restated, sharpened version of the user's question
  domain?: string;           // e.g. "marketing analytics", "biology", "education"
  hypothesis: string;        // 1-2 sentences. A falsifiable prediction.
  approach: string;          // 2-4 sentences. Method you used (stats, comparisons).
  keyFindings: string[];     // 3-6 short bullets. Each is a concrete, evidence-backed claim.
  insights: { title: string; body: string }[]; // 2-4 deeper insight blocks (1-3 sentences each).
  charts: ChartSpec[];       // 1-3 chart specs (see below)
  conclusion: string;        // 2-4 sentences. Direct answer to the question.
  nextExperiments: string[]; // 2-4 concrete follow-up experiments / data to collect.
  caveats?: string[];        // 1-3 honest limitations.
  confidence?: "low" | "medium" | "high";
}

type ChartKind = "bar" | "line" | "area" | "scatter" | "pie" | "histogram";
interface ChartSpec {
  kind: ChartKind;
  title: string;
  description?: string;
  x: string;        // column name in the data
  y?: string;       // column name in the data (omit for histogram & pie count-of)
  series?: string;  // optional grouping column
  bins?: number;    // for histogram only (default 12)
  // OPTIONAL: pre-aggregated rows the renderer will plot directly.
  // Use this when the raw rows would be too granular (e.g. you want yearly averages).
  data?: Record<string, string | number>[];
}

Hard rules:
- Respond with JSON ONLY. No prose before or after.
- All field names in charts (x, y, series) MUST exactly match a column in the dataset summary, OR be a key inside the chart's own "data" array if you supply one.
- If no dataset is provided, omit charts (empty array []) and answer conceptually.
- Be quantitative when data is present: cite numbers (means, deltas, percentages).
- Never invent data points outside the supplied dataset summary.
- Keep all strings concise and skimmable. No filler. No emojis.
- "keyFindings" and "nextExperiments" should be flat strings, not nested objects.
`;

export interface BuildPromptInput {
  question: string;
  notes?: string;
  datasetName?: string;
  summary?: DatasetSummary;
  sampleCsv?: string;
}

export function buildUserPrompt(input: BuildPromptInput): string {
  const parts: string[] = [];
  parts.push(`# Research question\n${input.question.trim()}`);

  if (input.notes && input.notes.trim()) {
    parts.push(`# User notes / context\n${input.notes.trim()}`);
  }

  if (input.summary && input.summary.rowCount > 0) {
    const s = input.summary;
    parts.push(
      `# Dataset summary${input.datasetName ? `: ${input.datasetName}` : ""}\nRows: ${s.rowCount}. Columns: ${s.columnCount}.`,
    );
    const colsLines = s.columns.map((c) => {
      const bits: string[] = [`- ${c.name} (${c.type}, ${c.count} non-null, ${c.unique} unique)`];
      if (c.type === "number") {
        bits.push(
          `  min=${num(c.min)}, max=${num(c.max)}, mean=${num(c.mean)}, median=${num(c.median)}, std=${num(c.stddev)}`,
        );
      } else if (c.type === "date") {
        bits.push(`  range: ${c.earliest} → ${c.latest}`);
      } else if (c.topValues?.length) {
        bits.push(
          `  top: ${c.topValues.map((t) => `${t.value}(${t.count})`).join(", ")}`,
        );
      }
      return bits.join("\n");
    });
    parts.push(`## Columns\n${colsLines.join("\n")}`);

    if (input.sampleCsv) {
      parts.push(`## First rows (CSV)\n\`\`\`\n${input.sampleCsv}\n\`\`\``);
    }
  } else {
    parts.push(
      `# Dataset\n(none provided — answer conceptually using domain reasoning)`,
    );
  }

  parts.push(
    `# Output\nRespond with a single AnalysisResult JSON object. Do not include any text outside the JSON.`,
  );

  return parts.join("\n\n");
}

function num(n: number | undefined): string {
  if (n === undefined || n === null || Number.isNaN(n)) return "n/a";
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}

export interface RunGroqOptions {
  apiKey: string;
  model?: string;
  question: string;
  notes?: string;
  datasetName?: string;
  summary?: DatasetSummary;
  sampleCsv?: string;
}

export async function runGroqAnalysis(
  opts: RunGroqOptions,
): Promise<{ result: AnalysisResult; model: string }> {
  const model = opts.model || DEFAULT_MODEL;
  const client = new Groq({ apiKey: opts.apiKey });

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.4,
    max_tokens: 2400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt({
          question: opts.question,
          notes: opts.notes,
          datasetName: opts.datasetName,
          summary: opts.summary,
          sampleCsv: opts.sampleCsv,
        }),
      },
    ],
  });

  const text = completion.choices?.[0]?.message?.content?.trim() || "";
  if (!text) throw new Error("Empty response from Groq");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Attempt to find first {...} object
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON");
    parsed = JSON.parse(match[0]);
  }

  const result = sanitizeResult(parsed, opts.question);
  return { result, model };
}

function sanitizeResult(raw: unknown, question: string): AnalysisResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  const insights = Array.isArray(r.insights)
    ? r.insights
        .filter((i) => i && typeof i === "object")
        .map((i) => {
          const obj = i as Record<string, unknown>;
          return {
            title: typeof obj.title === "string" ? obj.title : "Insight",
            body: typeof obj.body === "string" ? obj.body : "",
          };
        })
    : [];
  const charts = Array.isArray(r.charts)
    ? r.charts
        .filter((c) => c && typeof c === "object")
        .map((c) => {
          const obj = c as Record<string, unknown>;
          return {
            kind: (typeof obj.kind === "string" ? obj.kind : "bar") as
              | "bar"
              | "line"
              | "area"
              | "scatter"
              | "pie"
              | "histogram",
            title: typeof obj.title === "string" ? obj.title : "Chart",
            description:
              typeof obj.description === "string" ? obj.description : undefined,
            x: typeof obj.x === "string" ? obj.x : "",
            y: typeof obj.y === "string" ? obj.y : undefined,
            series: typeof obj.series === "string" ? obj.series : undefined,
            bins: typeof obj.bins === "number" ? obj.bins : undefined,
            data: Array.isArray(obj.data)
              ? (obj.data as Record<string, string | number>[])
              : undefined,
          };
        })
    : [];

  return {
    question:
      typeof r.question === "string" && r.question.trim() ? r.question : question,
    domain: typeof r.domain === "string" ? r.domain : undefined,
    hypothesis: typeof r.hypothesis === "string" ? r.hypothesis : "",
    approach: typeof r.approach === "string" ? r.approach : "",
    keyFindings: arr(r.keyFindings),
    insights,
    charts,
    conclusion: typeof r.conclusion === "string" ? r.conclusion : "",
    nextExperiments: arr(r.nextExperiments),
    caveats: arr(r.caveats),
    confidence:
      r.confidence === "low" || r.confidence === "medium" || r.confidence === "high"
        ? r.confidence
        : undefined,
  };
}
