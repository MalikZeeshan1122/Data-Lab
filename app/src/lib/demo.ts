import type { AnalysisResult, DatasetSummary } from "./types";

/**
 * A deterministic offline analysis used when no Groq API key is configured.
 * It produces a respectable, on-topic report so the demo always works.
 */
export function buildDemoAnalysis(opts: {
  question: string;
  summary?: DatasetSummary;
  datasetName?: string;
}): AnalysisResult {
  const { question, summary, datasetName } = opts;
  const ds = datasetName ? ` in the “${datasetName}” dataset` : "";

  if (!summary || summary.rowCount === 0) {
    return {
      question,
      domain: "general research",
      hypothesis:
        "Without a dataset attached, the AI Scientist falls back to first-principles reasoning. The strongest hypothesis is usually the one that yields the cheapest, fastest experiment.",
      approach:
        "1) Restate the question in measurable terms. 2) List candidate variables and their plausible effects. 3) Identify the smallest experiment that would falsify the leading hypothesis.",
      keyFindings: [
        "No data attached — switching to conceptual mode.",
        "Add a Groq API key in Settings (or paste a CSV) to unlock quantitative analysis.",
        "Strong research questions decompose into measurable, falsifiable sub-questions.",
      ],
      insights: [
        {
          title: "Make it measurable",
          body: "Translate the question into 1–3 metrics with explicit units and a target effect size you'd consider meaningful.",
        },
        {
          title: "Falsifiability first",
          body: "A useful hypothesis predicts something specific that, if observed differently, would change your mind. Vague hypotheses cannot lose.",
        },
      ],
      charts: [],
      conclusion:
        "Add data or a Groq API key to get a full quantitative analysis. The structure shown here is what every live analysis will follow.",
      nextExperiments: [
        "Collect 50–500 rows of representative data and re-run.",
        "Define the primary metric and a minimum-detectable effect.",
        "Pick the cheapest experiment that could disprove the leading hypothesis.",
      ],
      caveats: ["Demo mode — no LLM was called and no data was analyzed."],
      confidence: "low",
    };
  }

  const numCols = summary.columns.filter((c) => c.type === "number");
  const catCols = summary.columns.filter(
    (c) => c.type === "string" || c.type === "boolean",
  );
  const dateCols = summary.columns.filter((c) => c.type === "date");

  const primaryNum = numCols[numCols.length - 1] || numCols[0];
  const primaryCat = catCols[0];
  const primaryDate = dateCols[0];

  const charts: AnalysisResult["charts"] = [];

  if (primaryDate && primaryNum) {
    charts.push({
      kind: "line",
      title: `${primaryNum.name} over ${primaryDate.name}`,
      x: primaryDate.name,
      y: primaryNum.name,
      series: primaryCat?.name,
      description: "Trend over time, grouped by category if available.",
    });
  } else if (primaryCat && primaryNum) {
    charts.push({
      kind: "bar",
      title: `${primaryNum.name} by ${primaryCat.name}`,
      x: primaryCat.name,
      y: primaryNum.name,
      description: "Comparison across categories.",
    });
  } else if (primaryNum) {
    charts.push({
      kind: "histogram",
      title: `Distribution of ${primaryNum.name}`,
      x: primaryNum.name,
      bins: 10,
      description: "Shape of the distribution.",
    });
  }

  if (numCols.length >= 2) {
    charts.push({
      kind: "scatter",
      title: `${numCols[0].name} vs ${numCols[1].name}`,
      x: numCols[0].name,
      y: numCols[1].name,
      series: primaryCat?.name,
      description: "Pairwise relationship between two numeric features.",
    });
  }

  const findings: string[] = [];
  findings.push(
    `Dataset has ${summary.rowCount.toLocaleString()} rows × ${summary.columnCount} columns${ds}.`,
  );
  if (primaryNum?.mean !== undefined) {
    findings.push(
      `Average ${primaryNum.name} is ${fmt(primaryNum.mean)} (range ${fmt(primaryNum.min)}–${fmt(primaryNum.max)}).`,
    );
  }
  if (primaryCat?.topValues?.length) {
    const t = primaryCat.topValues[0];
    findings.push(
      `Most frequent ${primaryCat.name}: "${t.value}" (${t.count} of ${primaryCat.count}).`,
    );
  }
  const missingCols = summary.columns.filter((c) => c.missing > 0);
  if (missingCols.length) {
    findings.push(
      `${missingCols.length} column(s) have missing values — handle before modeling.`,
    );
  } else {
    findings.push("No missing values detected — good data quality baseline.");
  }

  return {
    question,
    domain: "data analysis",
    hypothesis: primaryNum
      ? `${primaryNum.name} is meaningfully driven by ${primaryCat?.name ?? "the other numeric features"} and shows a non-trivial structure rather than uniform noise.`
      : "The dataset contains learnable structure that can answer the question.",
    approach:
      "Computed per-column types, distributions, and missingness from the raw rows. Selected the most informative numeric column and pairs it against the strongest categorical/date axis to surface structure.",
    keyFindings: findings,
    insights: [
      {
        title: "Where to look first",
        body: primaryNum
          ? `${primaryNum.name} has a standard deviation of ${fmt(primaryNum.stddev)} around a mean of ${fmt(primaryNum.mean)}, so there is real spread to explain — not just noise.`
          : "Categorical structure is visible; consider encoding it for modeling.",
      },
      {
        title: "Likely confounder",
        body: primaryCat
          ? `${primaryCat.name} groups the data into ${primaryCat.unique} buckets. Any conclusion that ignores this grouping is at risk of Simpson's paradox.`
          : "With one dimension dominating, control for time or external trend before attributing causation.",
      },
    ],
    charts,
    conclusion: primaryNum
      ? `The most analytically useful axis here is ${primaryNum.name}${primaryCat ? `, and grouping by ${primaryCat.name} is the highest-signal split` : ""}. Add a Groq API key in Settings to unlock the full LLM-driven hypothesis test.`
      : "Structure is present — connect a Groq API key to run the full LLM analysis and produce a defensible conclusion.",
    nextExperiments: [
      "Add a Groq API key in Settings to run the full LLM-driven analysis.",
      primaryNum
        ? `Bin ${primaryNum.name} into quantiles and compare ${primaryCat?.name ?? "groups"} across them.`
        : "Engineer a numeric feature so we can quantify effects.",
      "Collect 2–5× more rows if any group has fewer than 30 samples.",
    ],
    caveats: [
      "Demo mode: this analysis was generated deterministically from summary statistics, not by an LLM.",
    ],
    confidence: "medium",
  };
}

function fmt(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "n/a";
  if (Math.abs(n) >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(n) >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}
