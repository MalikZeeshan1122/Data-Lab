import * as React from "react";

/**
 * Tiny safe markdown renderer for short LLM outputs.
 * Supports:
 *  - **bold**, *italic*, `code`
 *  - Auto-paragraphs
 *  - Inline only (no headings/lists — we render those structurally elsewhere)
 *
 * Returns a React.ReactNode. Never injects HTML.
 */
export function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Tokenize: split by `code`, **bold**, *italic*. Keep order.
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic text-white/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function Prose({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={
            i === 0
              ? "text-[15px] leading-7 text-white/85"
              : "mt-3 text-[15px] leading-7 text-white/85"
          }
        >
          {renderInline(p.replace(/\n/g, " "))}
        </p>
      ))}
    </div>
  );
}
