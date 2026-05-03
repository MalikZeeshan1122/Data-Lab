"use client";

import * as React from "react";
import Link from "next/link";
import { Atom, Github, KeyRound, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface HeaderProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  model: string;
  onModelChange: (model: string) => void;
}

const MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (default)" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B (fastest)" },
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B" },
];

export function Header({ apiKey, onApiKeyChange, model, onModelChange }: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(apiKey);

  const openDialog = () => {
    setDraft(apiKey);
    setOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_24px_-4px_rgba(167,139,250,0.6)]">
            <Atom className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="font-semibold tracking-tight text-white">Data Lab</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              hypothesis · evidence · insight
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={openDialog}
            className={cn(
              "btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm",
              apiKey && "ring-1 ring-violet-400/40",
            )}
          >
            <KeyRound className="h-3.5 w-3.5" />
            {apiKey ? "API key set" : "Set API key"}
            {apiKey && <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />}
          </button>
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:inline-flex chip hover:border-white/20"
          >
            <Sparkles className="h-3 w-3" /> Get a Groq key
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20"
            aria-label="Source"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-violet-300" />
                <h3 className="font-semibold">Settings</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-white/60 hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="block text-xs uppercase tracking-wider text-white/50">
              Groq API key
            </label>
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="gsk_..."
              autoComplete="off"
              spellCheck={false}
              className="mt-1 w-full px-3 py-2 text-sm font-mono"
            />
            <p className="mt-1.5 text-xs text-white/45">
              Stored only in your browser (localStorage). Sent per-request via{" "}
              <code className="font-mono text-white/60">x-groq-api-key</code> header.
            </p>

            <label className="mt-4 block text-xs uppercase tracking-wider text-white/50">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="mt-1 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-violet-400/60"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-black">
                  {m.label}
                </option>
              ))}
            </select>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setDraft("");
                  onApiKeyChange("");
                }}
                className="btn-secondary px-3 py-2 text-sm"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  onApiKeyChange(draft.trim());
                  setOpen(false);
                }}
                className="btn-primary px-4 py-2 text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
