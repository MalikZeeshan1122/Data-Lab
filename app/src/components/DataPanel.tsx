"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/cn";

interface DataPanelProps {
  text: string;
  onChange: (text: string) => void;
  rowCount: number | null;
  columnCount: number | null;
  parseError: string | null;
}

export function DataPanel({ text, onChange, rowCount, columnCount, parseError }: DataPanelProps) {
  const onDrop = React.useCallback(
    (accepted: File[]) => {
      const f = accepted[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") onChange(result);
      };
      reader.readAsText(f);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "text/plain": [".txt"],
    },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-semibold tracking-tight">Data</h3>
          <span className="chip">CSV · JSON · paste or drop</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/55">
          {rowCount !== null && columnCount !== null ? (
            <span>
              <span className="text-white">{rowCount.toLocaleString()}</span> rows ·{" "}
              <span className="text-white">{columnCount}</span> cols
            </span>
          ) : (
            <span className="text-white/40">no data</span>
          )}
          {text && (
            <button
              onClick={() => onChange("")}
              className="rounded-md p-1 text-white/55 hover:bg-white/5 hover:text-white"
              aria-label="Clear data"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "relative mt-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] transition-colors",
          isDragActive && "border-violet-400/60 bg-violet-400/5",
        )}
      >
        <input {...getInputProps()} />
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"Paste CSV or JSON here…\n\nmonth,channel,revenue\nJan,Online,49600\nFeb,Online,56400"}
          spellCheck={false}
          className="block h-44 w-full resize-y border-0 bg-transparent p-3 font-mono text-[12.5px] leading-5 outline-none focus:border-0 focus:shadow-none"
        />
        {!text && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 text-xs text-white/40">
            <Upload className="h-3 w-3" /> drag & drop a .csv / .json file anywhere on this box
          </div>
        )}
      </div>

      {parseError && (
        <p className="mt-2 text-xs text-amber-300/80">{parseError}</p>
      )}
    </div>
  );
}
