"use client";

import * as React from "react";
import { Beaker, FlaskConical } from "lucide-react";
import { SAMPLE_DATASETS } from "@/lib/samples";

interface QuestionPanelProps {
  question: string;
  onQuestionChange: (q: string) => void;
  onLoadSample: (id: string) => void;
  onRun: () => void;
  isRunning: boolean;
  canRun: boolean;
}

export function QuestionPanel({
  question,
  onQuestionChange,
  onLoadSample,
  onRun,
  isRunning,
  canRun,
}: QuestionPanelProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Beaker className="h-4 w-4 text-violet-300" />
          <h3 className="text-sm font-semibold tracking-tight">Research question</h3>
        </div>
        <span className="chip">{question.length}/2000</span>
      </div>

      <textarea
        value={question}
        onChange={(e) => onQuestionChange(e.target.value.slice(0, 2000))}
        placeholder="What's driving revenue growth, and is marketing spend producing diminishing returns?"
        className="mt-3 block h-28 w-full p-3 text-[14px] leading-6"
        spellCheck
      />

      <div className="mt-4">
        <div className="flex items-center gap-2 text-xs text-white/55">
          <FlaskConical className="h-3.5 w-3.5" />
          Try a sample experiment
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SAMPLE_DATASETS.map((s) => (
            <button
              key={s.id}
              onClick={() => onLoadSample(s.id)}
              disabled={isRunning}
              className="card card-hover group flex items-start gap-3 p-3 text-left transition disabled:opacity-50"
            >
              <span className="text-xl leading-none">{s.emoji}</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">{s.name}</span>
                <span className="mt-0.5 block truncate text-xs text-white/55">
                  {s.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={onRun}
          disabled={!canRun || isRunning}
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
        >
          {isRunning ? (
            <>
              <span className="h-2 w-2 rounded-full bg-white/90 pulse-dot" />
              Running experiment…
            </>
          ) : (
            <>
              Run analysis
              <kbd className="hidden md:inline-flex h-5 items-center rounded-md border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] text-white/80">
                ⌘ ↵
              </kbd>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
