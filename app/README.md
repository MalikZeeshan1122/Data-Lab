# AI Scientist

> Your research partner that goes from question to insight in seconds. Built for a 24-hour hackathon.

Drop a CSV, ask a research question, and AI Scientist forms a hypothesis, runs a real analysis (deterministic statistics + Groq-powered reasoning), generates charts, and writes up a defensible report — like a senior data scientist on a coffee break.

## Project details

**Purpose.** AI Scientist is a small research workbench for tabular data (and optional free-text notes). It turns a natural-language question plus a dataset into a structured “lab notebook” report: hypothesis, method, findings, visuals, conclusion, follow-up experiments, and explicit caveats—so you get something you can read, share, or paste into a doc—not just a vague chat reply.

**What makes the numbers trustworthy.** Before any LLM runs, the server builds a **deterministic dataset summary**: column types (number, string, boolean, date), counts, missing values, uniques, and type-appropriate stats (for example means/medians/stddev for numeric columns, top values for categoricals, date ranges for dates). Those figures are computed in code and passed to the model as JSON. Charts in the UI are driven by **structured chart specs** (kind, axes, optional pre-aggregated `data`), so the presentation stays aligned with the analysis.

**Features.**

- **Data in:** Paste CSV/JSON, drag-and-drop upload, or load one of four sample datasets.
- **Question-first:** Optional long-form **notes** (e.g. paper snippets) can accompany the question; the API accepts `question`, optional `rows`, optional `notes`, and optional `datasetName`.
- **Two modes:** With a Groq API key, the app uses **JSON-only** LLM output validated against the shared `AnalysisResult` shape. Without a key, **demo mode** still returns a full report from the computed summary—useful for workshops and offline demos.
- **Reporting UI:** Animated results panel, markdown-style rendering for narrative sections, up to six chart kinds (bar, line, area, scatter, pie, histogram), and copy-as-markdown for the report.
- **Developer ergonomics:** Zod-validated `POST /api/analyze`, TypeScript end-to-end, Next.js App Router.

**Limits (API request).** These are enforced server-side: up to **5,000** rows per request; question length **3–2,000** characters; notes up to **20,000** characters; optional `model` override string on the request for Groq.

**Default model.** When using Groq, the app defaults to **`llama-3.3-70b-versatile`** unless you pass another model in the request or your integration changes it.

**API key resolution.** The server uses, in order: the **`x-groq-api-key`** header (what the in-app Settings dialog sends), then the **`GROQ_API_KEY`** environment variable.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript, Tailwind v4)
- **Groq SDK** — sub-second LLM inference (Llama 3.3 70B / GPT-OSS 120B / etc.)
- **recharts** — six chart types (bar, line, area, scatter, pie, histogram)
- **papaparse** — CSV parsing in the browser
- **react-dropzone** — drag-and-drop file uploads
- **zod** — request validation on the API route

## How it works

1. The user pastes/uploads a CSV (or picks a sample dataset) and types a question.
2. The browser POSTs `{ question, rows?, notes?, datasetName?, model? }` to `/api/analyze`.
3. The server **deterministically** computes per-column statistics (means, std, top values, missing counts, distributions) — these are real numbers, not LLM hallucinations.
4. The server prompts Groq with the dataset summary in JSON-only mode and gets back a structured `AnalysisResult` (hypothesis, approach, key findings, charts, conclusion, next experiments, caveats, confidence).
5. The UI renders the report as a "lab notebook" with animated reveal, charts powered by recharts, and a one-click copy-as-markdown button.

If no API key is set, the app falls back to a **deterministic demo mode** that still produces a respectable analysis from the computed stats — so the demo never breaks.

## Getting started

```bash
cd app
npm install
# Optional: create .env.local in this folder with GROQ_API_KEY=your_key
npm run dev
```

On Windows PowerShell, you can create `app\.env.local` in your editor, or: `Set-Content -Path .env.local -Value "GROQ_API_KEY=your_key_here"`.

Open http://localhost:3000.

You can also paste your Groq API key directly into the **Settings** dialog in the header — it's stored in `localStorage` and sent per-request via the `x-groq-api-key` header. No need for `.env.local` if you don't want one.

Get a free Groq API key at: https://console.groq.com/keys

## Try it instantly

The Question panel ships with four sample experiments — one click loads the dataset and a starter question:

- 💰 **E-commerce sales** — revenue & marketing-spend ROI
- 🌸 **Iris flowers** — feature separation across species
- 🎓 **Student performance** — predictors of exam scores
- 📉 **SaaS churn** — strongest predictors of churn

## Project layout

```
app/
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts   # zod-validated API; Groq + demo fallback
│   │   ├── globals.css            # design system
│   │   ├── layout.tsx             # SEO + Geist font
│   │   └── page.tsx               # main workbench
│   ├── components/
│   │   ├── ChartView.tsx          # 6 chart kinds, recharts
│   │   ├── DataPanel.tsx          # paste/drop CSV/JSON
│   │   ├── Header.tsx             # brand + settings dialog
│   │   ├── QuestionPanel.tsx      # question + sample picker + run button
│   │   └── ResultsPanel.tsx       # animated lab notebook
│   └── lib/
│       ├── cn.ts                  # tailwind class merge
│       ├── data.ts                # parsing + stats + histogram
│       ├── demo.ts                # deterministic offline analysis
│       ├── groq.ts                # Groq client + system prompt
│       ├── md.tsx                 # tiny markdown renderer
│       ├── samples.ts             # 4 baked-in datasets
│       └── types.ts               # shared types
└── package.json
```

## Keyboard shortcut

`⌘/Ctrl + Enter` runs the analysis from anywhere.

## License

MIT — built for the hackathon. Have fun.
