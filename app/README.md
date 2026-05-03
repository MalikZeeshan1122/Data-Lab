# AI Scientist

> Your research partner that goes from question to insight in seconds. Built for a 24-hour hackathon.

Drop a CSV, ask a research question, and AI Scientist forms a hypothesis, runs a real analysis (deterministic statistics + Groq-powered reasoning), generates charts, and writes up a defensible report — like a senior data scientist on a coffee break.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript, Tailwind v4)
- **Groq SDK** — sub-second LLM inference (Llama 3.3 70B / GPT-OSS 120B / etc.)
- **recharts** — six chart types (bar, line, area, scatter, pie, histogram)
- **papaparse** — CSV parsing in the browser
- **react-dropzone** — drag-and-drop file uploads
- **zod** — request validation on the API route

## How it works

1. The user pastes/uploads a CSV (or picks a sample dataset) and types a question.
2. The browser POSTs `{ question, rows }` to `/api/analyze`.
3. The server **deterministically** computes per-column statistics (means, std, top values, missing counts, distributions) — these are real numbers, not LLM hallucinations.
4. The server prompts Groq with the dataset summary in JSON-only mode and gets back a structured `AnalysisResult` (hypothesis, approach, key findings, charts, conclusion, next experiments, caveats, confidence).
5. The UI renders the report as a "lab notebook" with animated reveal, charts powered by recharts, and a one-click copy-as-markdown button.

If no API key is set, the app falls back to a **deterministic demo mode** that still produces a respectable analysis from the computed stats — so the demo never breaks.

## Getting started

```bash
cd app
npm install
cp .env.example .env.local   # optional — paste your GROQ_API_KEY
npm run dev
```

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
