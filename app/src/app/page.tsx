"use client";

import * as React from "react";
import { Atom, Sparkles, Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { DataPanel } from "@/components/DataPanel";
import { QuestionPanel } from "@/components/QuestionPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { autoParseRows } from "@/lib/data";
import { SAMPLE_DATASETS } from "@/lib/samples";
import type { AnalysisResult, AnalyzeResponse, DatasetSummary } from "@/lib/types";
import { useLocalStorage } from "@/lib/useLocalStorage";

const LEGACY_STORAGE_API_KEY = "ai-scientist:groq-key";
const LEGACY_STORAGE_MODEL = "ai-scientist:model";
const STORAGE_API_KEY = "data-lab:groq-key";
const STORAGE_MODEL = "data-lab:model";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export default function Home() {
  const [apiKey, setApiKey] = useLocalStorage(STORAGE_API_KEY, "");
  const [model, setModel] = useLocalStorage(STORAGE_MODEL, DEFAULT_MODEL);

  React.useEffect(() => {
    try {
      const curKey = window.localStorage.getItem(STORAGE_API_KEY);
      const legKey = window.localStorage.getItem(LEGACY_STORAGE_API_KEY);
      if (!curKey && legKey) {
        setApiKey(legKey);
        window.localStorage.removeItem(LEGACY_STORAGE_API_KEY);
      }
      const curModel = window.localStorage.getItem(STORAGE_MODEL);
      const legModel = window.localStorage.getItem(LEGACY_STORAGE_MODEL);
      if (!curModel && legModel) {
        setModel(legModel);
        window.localStorage.removeItem(LEGACY_STORAGE_MODEL);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, [setApiKey, setModel]);

  const [dataText, setDataText] = React.useState("");
  const [datasetName, setDatasetName] = React.useState<string | undefined>(undefined);
  const [question, setQuestion] = React.useState("");

  const [isRunning, setIsRunning] = React.useState(false);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [summary, setSummary] = React.useState<DatasetSummary | undefined>(undefined);
  const [resultRows, setResultRows] = React.useState<Record<string, unknown>[]>([]);
  const [source, setSource] = React.useState<"live" | "demo" | null>(null);
  const [usedModel, setUsedModel] = React.useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const { rows, parseError } = React.useMemo(() => parseLive(dataText), [dataText]);

  const onLoadSample = (id: string) => {
    const s = SAMPLE_DATASETS.find((x) => x.id === id);
    if (!s) return;
    setDataText(s.csv);
    setDatasetName(s.name);
    setQuestion(s.question);
    // scroll to top of inputs gracefully
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const run = React.useCallback(async () => {
    if (!question.trim()) return;
    setIsRunning(true);
    setError(null);
    setResult(null);
    setSource(null);
    setUsedModel(null);
    setElapsedMs(null);

    try {
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (apiKey) headers["x-groq-api-key"] = apiKey;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: question.trim(),
          rows: rows.length ? rows : undefined,
          datasetName: rows.length ? datasetName : undefined,
          model,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server error ${res.status}: ${txt || res.statusText}`);
      }

      const json = (await res.json()) as AnalyzeResponse & { error?: string };
      setResult(json.result);
      setSummary(json.summary);
      setResultRows(rows);
      setSource(json.source);
      setUsedModel(json.model);
      setElapsedMs(json.elapsedMs);
      if (json.error) setError(json.error);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setIsRunning(false);
    }
  }, [apiKey, datasetName, model, question, rows]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning && question.trim()) run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, question, run]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        model={model}
        onModelChange={setModel}
      />

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-5 pb-24">
        {/* Hero */}
        <section className="relative pt-14 pb-8">
          <div className="bg-grid pointer-events-none absolute inset-0 -z-10" />
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/55">
            <Atom className="h-3.5 w-3.5 text-violet-300" />
            Data Lab · v1
          </div>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Your research partner that goes from{" "}
            <span className="gradient-text">question</span> to{" "}
            <span className="gradient-text">insight</span> in seconds.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            Drop a dataset, ask a question. Data Lab forms a hypothesis, runs
            the analysis, generates charts and writes up a defensible report — like
            a senior data scientist on a coffee break.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="chip">
              <Zap className="h-3 w-3 text-cyan-300" />
              Powered by Groq · sub-second LLM
            </span>
            <span className="chip">
              <Sparkles className="h-3 w-3 text-violet-300" />
              Scientific method, end-to-end
            </span>
            <span className="chip">No data leaves your browser without your key</span>
          </div>
        </section>

        {/* Workbench */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <DataPanel
              text={dataText}
              onChange={(t) => {
                setDataText(t);
                if (!t) setDatasetName(undefined);
              }}
              rowCount={rows.length || (dataText ? 0 : null)}
              columnCount={rows[0] ? Object.keys(rows[0]).length : dataText ? 0 : null}
              parseError={parseError}
            />
            <QuestionPanel
              question={question}
              onQuestionChange={setQuestion}
              onLoadSample={onLoadSample}
              onRun={run}
              isRunning={isRunning}
              canRun={!!question.trim()}
            />
            {!apiKey && source !== "live" && (
              <div className="card flex items-start gap-3 p-3 text-xs text-white/65">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
                <div>
                  {source === "demo" ? (
                    <>
                      Last run was in <span className="text-white">demo mode</span>.
                      Add a Groq API key in the header to unlock the full LLM
                      analysis.
                    </>
                  ) : (
                    <>
                      Tip: add a Groq API key in the header (or set{" "}
                      <code className="font-mono text-white/80">GROQ_API_KEY</code>{" "}
                      in <code className="font-mono text-white/80">.env.local</code>)
                      to unlock the full LLM-powered analysis.
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <ResultsPanel
              result={result}
              summary={summary}
              rows={resultRows}
              source={source}
              model={usedModel}
              elapsedMs={elapsedMs}
              isRunning={isRunning}
              error={error}
            />
          </div>
        </section>

        <footer className="mt-16 flex flex-col items-center justify-between gap-2 border-t border-white/5 pt-6 text-xs text-white/40 sm:flex-row">
          <span>Data Lab · built for the 24-hour hackathon</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ready
          </span>
        </footer>
      </main>
    </div>
  );
}

function parseLive(text: string): {
  rows: Record<string, unknown>[];
  parseError: string | null;
} {
  if (!text.trim()) return { rows: [], parseError: null };
  try {
    const rows = autoParseRows(text);
    if (!rows.length) {
      return { rows: [], parseError: "Couldn't parse any rows. Make sure the first line has column headers." };
    }
    return { rows, parseError: null };
  } catch (err) {
    return {
      rows: [],
      parseError: err instanceof Error ? err.message : "Could not parse data.",
    };
  }
}
