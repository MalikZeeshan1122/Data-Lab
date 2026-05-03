import type { NextRequest } from "next/server";
import { z } from "zod";
import { rowsToCsv, summarizeDataset } from "@/lib/data";
import { DEFAULT_MODEL, runGroqAnalysis } from "@/lib/groq";
import { buildDemoAnalysis } from "@/lib/demo";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RowSchema = z.record(z.string(), z.unknown());

const BodySchema = z.object({
  question: z.string().min(3, "Question is too short").max(2000),
  rows: z.array(RowSchema).max(5000).optional(),
  notes: z.string().max(20_000).optional(),
  datasetName: z.string().max(120).optional(),
  model: z.string().max(120).optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { question, rows, notes, datasetName, model } = parsed.data;
  const started = Date.now();

  const summary =
    rows && rows.length > 0 ? summarizeDataset(rows as Record<string, unknown>[]) : undefined;

  // CSV preview: first 12 rows, max ~3KB.
  let sampleCsv: string | undefined;
  if (rows && rows.length > 0) {
    const preview = rows.slice(0, 12) as Record<string, unknown>[];
    const csv = rowsToCsv(preview);
    sampleCsv = csv.length > 3000 ? `${csv.slice(0, 3000)}\n...` : csv;
  }

  const headerKey = request.headers.get("x-groq-api-key")?.trim();
  const envKey = process.env.GROQ_API_KEY?.trim();
  const apiKey = headerKey || envKey;

  if (!apiKey) {
    const result = buildDemoAnalysis({ question, summary, datasetName });
    const body: AnalyzeResponse = {
      result,
      summary,
      model: "demo",
      elapsedMs: Date.now() - started,
      source: "demo",
    };
    return Response.json(body);
  }

  try {
    const { result, model: usedModel } = await runGroqAnalysis({
      apiKey,
      model: model || DEFAULT_MODEL,
      question,
      notes,
      datasetName,
      summary,
      sampleCsv,
    });
    const body: AnalyzeResponse = {
      result,
      summary,
      model: usedModel,
      elapsedMs: Date.now() - started,
      source: "live",
    };
    return Response.json(body);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error from analysis backend";
    // Soft fallback: still give the user a usable response.
    const result = buildDemoAnalysis({ question, summary, datasetName });
    const body: AnalyzeResponse & { error: string } = {
      result,
      summary,
      model: "demo",
      elapsedMs: Date.now() - started,
      source: "demo",
      error: message,
    };
    return Response.json(body, { status: 200 });
  }
}
