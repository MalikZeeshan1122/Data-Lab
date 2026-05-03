# AI Scientist

Research workbench that turns **CSV data + a natural-language question** into a structured analysis report: hypothesis, methods, findings, charts, conclusions, and follow-up experiments—with **deterministic statistics** layered under **Groq**-powered reasoning (or a fully offline **demo mode** when no API key is set).

## Repository layout

| Path | Description |
|------|-------------|
| [`app/`](app/) | Next.js 16 application (source, API route, UI) |
| [`app/README.md`](app/README.md) | **Full documentation** — stack, project details, API limits, samples, layout |

## Quick start

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: create `app/.env.local` with `GROQ_API_KEY=your_key`, or set the key in the app **Settings** (stored in the browser; sent as `x-groq-api-key`). Free keys: [Groq Console](https://console.groq.com/keys).

## Highlights

- **Next.js 16** (App Router), React 19, TypeScript, Tailwind v4
- **`POST /api/analyze`** — Zod-validated; dataset summaries computed in code; LLM returns structured JSON for charts and narrative
- **Six chart types** (recharts): bar, line, area, scatter, pie, histogram
- **Sample datasets** baked in for one-click demos

For limits, default model, and file-by-file layout, see [`app/README.md`](app/README.md).

## License

MIT — see [`app/README.md`](app/README.md) for project notes.
