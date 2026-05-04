# Framework Consensus Brainstorm

This note captures a possible Beacon feature: run multiple research frameworks against the same topic, compare their outputs, and combine them into a higher-confidence ranking or verdict.

## Core Idea

Today, a framework changes how Beacon plans and writes one report.
The next step is to treat frameworks like parallel analytical judges.

Instead of asking:
"What does JTBD think about this topic?"

Ask:
"What do JTBD, SWOT, RICE, Porter, and Market Map each conclude from the same evidence base, and where do they agree or disagree?"

That turns frameworks from prompt flavors into a real comparative reasoning system.

## Simple Mental Model

One topic.
One shared evidence pool.
Multiple framework-specific evaluators.
One meta-ranker or validator on top.

This means Beacon could say things like:
- Strong user pain under `JTBD`
- High prioritization score under `RICE`
- Weak defensibility under `Porter`
- Crowded category under `Market Map`

The final output becomes more useful than a single blended summary because disagreement itself becomes signal.

## Why This Is Valuable

Different frameworks answer different questions:

- `JTBD`: what user job is being hired for?
- `Problem-Solution Fit`: is the pain real enough to justify building?
- `RICE`: what should be prioritized?
- `SWOT`: what strengths, weaknesses, opportunities, and threats are visible?
- `Porter`: how attractive or hostile is the market structure?
- `Market Map`: who is in the space and where is whitespace?
- `Blue Ocean`: is there room to escape direct competition?

If Beacon compares these lenses instead of picking only one, it can produce a more decision-oriented result.

## Good Use Cases

### 1. Product Idea Validation

Run:
- `Problem-Solution Fit`
- `JTBD`
- `SWOT`

Goal:
Decide whether an idea is worth building now, worth refining, or not compelling enough.

### 2. Competitor Ranking

Run:
- `Market Map`
- `RICE`
- `Porter`

Goal:
Rank products or companies by attractiveness, urgency, and defensibility.

### 3. Investment-Style Screening

Run:
- `SWOT`
- `PESTLE`
- `Porter`

Goal:
Produce a structured opportunity/risk profile for a company, market, or trend.

### 4. Feature Prioritization

Run:
- `JTBD`
- `RICE`
- `Opportunity Solution Tree`

Goal:
Compare proposed features by user pain, expected impact, and strategic leverage.

### 5. Hackathon or Startup Idea Judging

Run:
- `Problem-Solution Fit`
- `Blue Ocean`
- `RICE`

Goal:
Score submissions and generate a leaderboard with explanation, not just a raw score.

## Best Execution Model

There are two broad ways to implement this.

### Option A: Full Report Per Framework, Then Meta-Synthesis

Flow:
1. Gather evidence once.
2. Run each framework as a full synthesis pass.
3. Ask a final validator to compare them and produce a merged verdict.

Pros:
- Rich output
- Human-readable
- Easy to demo

Cons:
- Expensive
- Harder to compare long prose cleanly
- More likely to become repetitive

### Option B: Shared Evidence, Structured Scorecards Per Framework

Flow:
1. Gather evidence once.
2. Run each framework against the same compressed evidence.
3. Force each framework to return structured JSON.
4. Feed all scorecards into a meta-ranker.

Pros:
- Easier to compare
- Better for ranking
- Easier to normalize and visualize
- More reliable than prose-only merging

Cons:
- Less expressive unless paired with short explanations

For Beacon, Option B is the stronger foundation if the goal is ranking, comparison, or consensus.

## Recommended Output Shape

Each framework should return a structured object, not just prose.

Example:

```json
{
  "framework": "rice",
  "score": 78,
  "confidence": 0.71,
  "verdict": "promising",
  "strengths": [
    "clear user segment",
    "strong near-term urgency"
  ],
  "risks": [
    "distribution is unclear",
    "crowded adjacent category"
  ],
  "evidence": [
    "source-1",
    "source-4"
  ],
  "notes": "High reach and impact, but confidence is moderate due to weak evidence on adoption."
}
```

That creates something the system can actually compare.

## Meta-Ranking Layer

Once Beacon has multiple framework scorecards, it can run a final merge step that:

- normalizes scores across frameworks
- weights frameworks differently by use case
- detects agreement and disagreement
- penalizes low-confidence conclusions
- rewards overlapping evidence
- outputs a final verdict plus rationale

The final output should probably include:

- `final_score`
- `confidence_score`
- `disagreement_score`
- `per_framework_scores`
- `top_strengths`
- `top_risks`
- `why_frameworks_disagree`

## Why Disagreement Matters

This is one of the most valuable parts of the idea.

If multiple frameworks disagree, that is often not an error. It is the core insight.

Example:

- `JTBD`: users clearly have the pain
- `RICE`: there is strong prioritization value
- `Porter`: market is structurally hostile

That means:
"This may be a real user problem and still be a bad business to enter."

That is stronger than a single averaged score.

Beacon should surface disagreement explicitly rather than hiding it inside a blended summary.

## Product Opportunities

This could evolve into several distinct product features:

### Framework Consensus

A single topic gets multiple framework judgments and one merged conclusion.

### Multi-Lens Ranking

A set of ideas, competitors, or markets are ranked using several frameworks at once.

### Evidence Jury

Beacon behaves like a panel of expert judges with different reasoning styles.

### Strategy Conflict Detection

Beacon highlights where a product idea looks strong under one lens but weak under another.

## Suggested Workflow Design For Beacon

High-level workflow:

1. Load topic memory first.
2. Build one shared evidence base using the current research workflow.
3. Compress evidence into a framework-ready context package.
4. Run 3-5 framework evaluators in parallel.
5. Require structured scorecard output from each evaluator.
6. Run a meta-ranker to merge results.
7. Save the final result and per-framework scorecards into memory.

This fits Beacon well because the existing architecture already supports:

- durable workflow orchestration
- parallel execution
- memory-first / memory-last lifecycle
- separate context and synthesis phases

## Proposed Data Model

Possible additions to `ResearchReport` or a new comparative report type:

```ts
type FrameworkScorecard = {
  frameworkId: string
  score: number
  confidence: number
  verdict: string
  strengths: string[]
  risks: string[]
  evidence: string[]
  notes: string
}

type ComparativeResearchReport = {
  topic: string
  frameworkScorecards: FrameworkScorecard[]
  finalScore: number
  confidenceScore: number
  disagreementScore: number
  finalVerdict: string
  consensusSummary: string
  disagreementSummary: string
}
```

## UI Ideas

### Comparison Matrix

Rows:
frameworks

Columns:
- score
- confidence
- verdict
- top strength
- top risk

### Consensus Panel

Show:
- final verdict
- confidence
- disagreement level
- most-supported conclusion
- most-contested conclusion

### Ranking View

For multiple ideas or competitors, show:
- overall rank
- per-framework rank
- why this item moved up or down

## Key Risk: Fake Precision

The biggest product risk is pretending the system is more objective than it really is.

If Beacon collapses everything into one neat number too early, the feature may look rigorous while hiding uncertainty and evidence quality problems.

To avoid that, Beacon should keep:

- a final score
- a confidence score
- a disagreement score
- a per-framework breakdown

The point is not to create a fake objective truth.
The point is to create a transparent multi-lens decision aid.

## Strong Next Step

If this becomes a real Beacon feature, the best first version is probably:

1. one shared evidence gathering pass
2. three frameworks only
3. structured JSON scorecards
4. one meta-ranker
5. one comparison UI

A good initial trio would be:

- `JTBD`
- `RICE`
- `SWOT`

That mix gives user pain, prioritization, and strategic risk in one pass without making the system too wide too early.

## Short Thesis

Beacon should not only let a user choose one framework.
It could also compare frameworks as competing evaluators over the same evidence and turn disagreement into a product feature.

That would make Beacon feel less like a single report generator and more like a real research decision system.

---

## Architecture Fit

The current deep-mode workflow already runs three parallel agent tracks: Exploration, Competitive, and Signals. Each track runs a `synthesizeTrack` call and returns structured text. The `validateAndMerge` step then receives all three outputs and produces the final report.

This structure maps almost directly onto the framework consensus model:

- Each parallel agent slot becomes a framework evaluator instead of a thematic track.
- The `synthesizeTrack` function already accepts a custom system prompt per agent — swapping in a framework-specific scorecard prompt is a small delta.
- The output type changes from prose string to `FrameworkScorecard` JSON, but the step shape, retry logic, and concurrency model stay identical.
- `validateAndMerge` already handles N-agent report inputs. Changing its input from `string[]` to `FrameworkScorecard[]` and updating the meta-ranking prompt is the main work.

The key insight is that the parallel execution harness, the memory bookends, and the self-healing retry patterns do not need to change at all. Framework consensus is primarily a prompt and type change layered on top of existing infrastructure.

## Implementation Path (Phase 0)

The minimum viable version using existing infrastructure:

1. **Add `frameworkIds?: string[]` to `ResearchBrief`** — alongside the existing `frameworkId` (single-framework) field. When `frameworkIds` is present and `depth` is `deep`, the workflow enters consensus mode.

2. **In consensus mode, assign one framework per parallel agent slot.** Instead of `explorationAgent`, `competitiveAgent`, and `signalsAgent`, the three slots become `frameworkAgent_0`, `frameworkAgent_1`, `frameworkAgent_2` — each initialized with its framework's `synthesisHint` from `FRAMEWORKS_BY_ID`.

3. **Each agent returns a `FrameworkScorecard` JSON object**, not prose. The agent system prompt instructs the model to follow the scorecard schema strictly (score, confidence, verdict, strengths, risks, evidence, notes). Structured output mode via the Groq API can enforce this.

4. **`validateAndMerge` becomes the meta-ranker.** It receives 3 scorecards, normalizes scores across frameworks, detects agreement and disagreement, and outputs a `ComparativeResearchReport`. The existing meta-ranker system prompt is extended with normalization and disagreement-detection instructions.

5. **Token budget implication.** Scorecard JSON is denser than prose but more compressible. The custom `tokenBudget` field already in `ResearchBrief` means users on Groq paid tiers can increase `trackSynthTokens` to give each framework evaluator more evidence context per run without a code change.

## What the Existing Code Already Gives You

Several pieces are already in place and require no modification:

- `FRAMEWORKS_BY_ID.get(frameworkId)` already resolves full framework metadata including `synthesisHint`. Adding consensus mode does not require a new framework registry — it reuses the existing one.

- `synthesisHint` per framework is already written for prose synthesis. The main work is writing a parallel JSON scorecard variant of the hint: "Instead of writing a prose report, return a JSON object matching the FrameworkScorecard schema. Cite at least 2 source indices per field."

- The `validateAndMerge` system prompt already handles multiple agent report strings as concatenated input. Switching to structured scorecard objects means the meta-ranker gets cleaner, more comparable data, not a harder job.

- The `tokenBudget` type field is already on `ResearchBrief` and read by the workflow. No type changes needed to support per-tier scorecard depth tuning.

- `BriefRecord.frameworkId` in `lib/brief-store.ts` already persists the framework used. Extending it to store `frameworkIds?: string[]` and `frameworkScorecards?: FrameworkScorecard[]` is an additive change.

## Disagreement as a First-Class UX

The brief detail page (`/briefs/[id]`) currently renders the markdown report as a single view. Framework consensus warrants a second tab.

The scorecard tab would show a comparison matrix:

| Framework | Score | Confidence | Verdict | Top Risk |
|---|---|---|---|---|
| JTBD | 82 | 0.74 | promising | unclear distribution |
| RICE | 71 | 0.68 | conditional | low confidence score |
| Porter | 44 | 0.81 | caution | structurally hostile |

Below the matrix: a **Consensus Row** showing the meta-ranked final score, confidence, and disagreement score.

Disagreements are flagged visually: where two or more frameworks diverge on verdict (e.g., JTBD says "promising" while Porter says "caution"), the cells are highlighted in orange. High disagreement is not hidden or averaged away — it is shown as the primary signal, with a one-sentence explanation from `validateAndMerge` describing why the frameworks disagree.

This is a second tab, not a replacement. Users who want prose can stay on the Report tab. Users who want the structured comparison use the Scorecard tab.

## Critical Risk: Scorecard Gaming

LLMs tend to produce internally consistent scorecards when given a structured output schema and compressed evidence context. The risk is not hallucination in the traditional sense — the model fills the fields confidently even when the evidence is thin, because the schema rewards completion.

Three mitigations to build into the framework evaluator prompt:

**(a) Source citation requirement.** Each scorecard field (strengths, risks, notes) must cite at least 2 source indices from the compressed evidence context. If the model cannot find 2 supporting sources for a claim, it should lower the confidence score for that field and note the evidence gap.

**(b) Confidence ceiling rule.** Confidence scores above 0.85 are penalized unless at least 3 distinct sources support the claim. The meta-ranker prompt should re-score any over-confident field where the cited source count is below this threshold.

**(c) Raw evidence count in the UI.** Alongside each scorecard, show the number of evidence chunks (source snippets) that were passed into that framework's evaluator. A scorecard built on 4 sources deserves different trust than one built on 22. Showing this count creates an implicit calibration signal for the user without requiring any explanation copy.

These mitigations do not fully solve the problem — they surface it. The goal is not a perfect scorecard but a transparent one.
