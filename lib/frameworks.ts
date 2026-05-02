export interface FrameworkOption {
  id: string
  name: string
  category: FrameworkCategory
  description: string
  queryHint: string
  synthesisHint: string
}

export type FrameworkCategory =
  | 'Discovery & Framing'
  | 'User Research'
  | 'Prioritization'
  | 'Systems Thinking'
  | 'Strategy'
  | 'Validation'
  | 'AI/Deep Research'

export const FRAMEWORK_CATEGORIES: FrameworkCategory[] = [
  'Discovery & Framing',
  'User Research',
  'Prioritization',
  'Systems Thinking',
  'Strategy',
  'Validation',
  'AI/Deep Research',
]

export const FRAMEWORKS: FrameworkOption[] = [
  // ── Discovery & Framing ───────────────────────────────────────────────────
  {
    id: 'jobs-to-be-done',
    name: 'Jobs to Be Done',
    category: 'Discovery & Framing',
    description: 'Focus on the progress users are trying to make, not the features they request.',
    queryHint: 'Search for what outcomes and progress users are trying to achieve, what triggers them to seek a solution, and what alternatives they currently use including non-consumption. Prioritize forums, reviews, and interview write-ups over marketing copy to surface motivational context.',
    synthesisHint: 'Structure findings around three job layers: (1) Functional Job — the core task; (2) Emotional Job — how users want to feel; (3) Social Job — how users want to be perceived. Use "When I [situation], I want to [motivation], so I can [outcome]" framing. Identify key hiring and firing triggers.',
  },
  {
    id: 'problem-solution-fit',
    name: 'Problem/Solution Fit',
    category: 'Discovery & Framing',
    description: 'Validate that a real, painful problem exists before investing in solutions.',
    queryHint: 'Search for evidence the problem is real: failure rates, workarounds, user complaints, and forum discussions. Prioritize primary source evidence over vendor claims. Find pain metrics: frequency of occurrence, cost of the problem, and alternatives users have tried and abandoned.',
    synthesisHint: 'Lead with problem validation evidence scored on three axes: (1) Frequency — how often it occurs; (2) Intensity — how painful it is; (3) Willingness to pay for a fix. Map the solution landscape: existing solutions and why they fail to fully resolve the job. End with a gap/opportunity statement.',
  },
  {
    id: 'opportunity-solution-tree',
    name: 'Opportunity Solution Tree',
    category: 'Discovery & Framing',
    description: 'Map the outcome → opportunity → solution hierarchy to avoid premature solution framing.',
    queryHint: 'Search for the desired outcome metric, the pain points preventing that outcome, and existing solution approaches. Find what has been tried, what worked partially, and what root causes remain unaddressed.',
    synthesisHint: 'Structure as a tree: (1) Desired Outcome at the top; (2) Opportunity nodes — unmet needs, pain points, constraints; (3) Solution nodes — existing approaches mapped to each opportunity. Identify which opportunities are most underserved by current solutions and deserve investment.',
  },
  {
    id: 'five-whys',
    name: '5 Whys Root Cause',
    category: 'Discovery & Framing',
    description: 'Drill past symptoms to find the systemic root cause of a problem.',
    queryHint: 'Search for documented root cause analyses, post-mortems, and failure case studies. Find patterns across multiple instances of the problem. Search for systemic causes: process failures, incentive misalignments, resource gaps, knowledge gaps.',
    synthesisHint: 'Present findings as a 5-level causal chain from surface symptom to systemic root cause. For each level, cite evidence. Conclude with: (1) Root cause statement; (2) Why fixing symptoms fails long-term; (3) Highest-leverage intervention point at the root level.',
  },
  {
    id: 'how-might-we',
    name: 'How Might We',
    category: 'Discovery & Framing',
    description: 'Reframe problems as design opportunities using open-ended HMW questions.',
    queryHint: 'Search for pain points, frustrations, constraints, and workarounds. Find examples of innovation in adjacent domains. Search for latent needs — things users do that were not designed for — and edge case behaviors that reveal unstated requirements.',
    synthesisHint: 'Reframe each major finding as a "How Might We…" design question. Group by reframing type: (1) Amplify the positive; (2) Eliminate the negative; (3) Challenge assumptions; (4) Draw on analogies from other domains. Prioritize the 5-7 most promising HMW questions for further exploration.',
  },
  {
    id: 'double-diamond',
    name: 'Double Diamond',
    category: 'Discovery & Framing',
    description: 'Diverge/converge twice: first define the right problem, then design the right solution.',
    queryHint: 'First diamond — search broadly for related problems, adjacent needs, and contradictory evidence from diverse stakeholder perspectives. Second diamond — search for existing solutions, their adoption rates, and unmet edge cases that current solutions miss.',
    synthesisHint: 'Structure as two diamonds: Diamond 1 — (Discover) breadth of problems found; (Define) sharpest problem statement. Diamond 2 — (Develop) solution directions identified; (Deliver) recommended approach with evidence. Be explicit about what was deprioritized and why.',
  },
  {
    id: 'problem-space-analysis',
    name: 'Problem Space Analysis',
    category: 'Discovery & Framing',
    description: 'Systematically map the full landscape of a problem before committing to any solution.',
    queryHint: 'Search for the full problem landscape: sub-problems, contributing factors, affected populations, and edge cases. Find quantitative severity data. Search for historical context: why has this not been solved yet, and what has been tried.',
    synthesisHint: 'Present a structured landscape: (1) Problem definition with scope; (2) Sub-problems and relationships; (3) Affected populations by severity; (4) Root contributing factors; (5) Historical solution attempts and why they fell short. End with the highest-leverage intervention point.',
  },

  // ── User Research ─────────────────────────────────────────────────────────
  {
    id: 'empathy-map',
    name: 'Empathy Map',
    category: 'User Research',
    description: 'Understand the user\'s world through four lenses: what they say, think, do, and feel.',
    queryHint: 'Search for direct user quotes from forums, reviews, social media, and support logs. Find behavioral data showing what users actually do vs. what they say. Search for emotional cues: frustrations, aspirations, fears, and delights. Prioritize unfiltered primary sources over summaries.',
    synthesisHint: 'Organize findings into four quadrants: (1) SAYS — direct quotes and stated needs; (2) THINKS — inferred beliefs and mental models; (3) DOES — observed behaviors and actions; (4) FEELS — emotions and motivations. Highlight gaps between stated and actual behavior. Conclude with Pains and Gains.',
  },
  {
    id: 'user-journey-map',
    name: 'User Journey Mapping',
    category: 'User Research',
    description: 'Map the end-to-end experience across all touchpoints to expose friction and delight.',
    queryHint: 'Search for step-by-step user workflows, onboarding flows, and task completion paths. Find reviews mentioning specific journey stages: discovery, evaluation, onboarding, use, and support. Search for where drop-offs and complaints cluster along the journey.',
    synthesisHint: 'Structure as a journey with phases: Aware → Consider → Purchase → Use → Advocate. For each phase: (1) User actions; (2) Emotions and sentiment; (3) Pain points and friction; (4) Touchpoints and channels. Mark moments of highest and lowest satisfaction. Conclude with top 3 optimization opportunities.',
  },
  {
    id: 'persona-development',
    name: 'Persona Development',
    category: 'User Research',
    description: 'Build evidence-based user archetypes that represent real patterns in the target population.',
    queryHint: 'Search for demographic and psychographic patterns. Find segmentation studies, user interviews, and survey data. Search for distinct usage patterns: power vs. casual, technical vs. non-technical. Look for behavioral clustering evidence that supports distinct archetypes.',
    synthesisHint: 'Define 2-3 primary personas. For each: (1) Name + archetype label; (2) Goals and motivations; (3) Pain points; (4) Behaviors and habits; (5) Context — tools used, media consumed; (6) Representative quote. Identify the primary persona and the rationale for prioritizing them.',
  },
  {
    id: 'kano-model',
    name: 'KANO Model',
    category: 'User Research',
    description: 'Classify features by satisfaction impact: must-haves, performance drivers, and delighters.',
    queryHint: 'Search for feature requests, complaints about missing functionality, and delight stories. Find reviews that mention specific features positively or negatively. Look for what users take for granted vs. what surprises them. Find competitive feature differentiators.',
    synthesisHint: 'Classify findings into three KANO categories: (1) Must-Be (Basic) — absence causes dissatisfaction, presence is expected; (2) Performance (Linear) — more is better, directly correlates to satisfaction; (3) Attractive (Delighter) — unexpected features that create delight. Provide prioritization recommendation based on KANO positioning.',
  },
  {
    id: 'contextual-inquiry',
    name: 'Contextual Inquiry',
    category: 'User Research',
    description: 'Observe users in their natural environment to uncover unarticulated needs and workarounds.',
    queryHint: 'Search for documented user behavior studies, usability test reports, and field research write-ups. Find examples of workarounds users have created. Search for edge cases and non-obvious use patterns, the environment of use, and tools used in parallel.',
    synthesisHint: 'Present contextual observations: (1) Work environment and context factors; (2) Observed tasks vs. official workflow; (3) Workarounds and improvised solutions; (4) Breakdowns and interruptions; (5) Artifacts and tools in use. Highlight the gap between designed behavior and actual practice.',
  },
  {
    id: 'user-story-mapping',
    name: 'User Story Mapping',
    category: 'User Research',
    description: 'Map user activities and tasks to build a shared understanding of what to build first.',
    queryHint: 'Search for the key activities users perform, the tasks within each activity, and how they sequence them. Find minimum viable flow evidence: what users need to accomplish their primary goal end-to-end. Search for persona-specific paths through the same high-level activities.',
    synthesisHint: 'Structure as a story map: Activities (horizontal backbone) → Tasks (cards per activity) → Detail (depth per task). Identify the walking skeleton — the minimum path that delivers end-to-end value. Group tasks by priority: MVP / Next / Later. Note where different personas diverge in their paths.',
  },
  {
    id: 'affinity-mapping',
    name: 'Affinity Mapping',
    category: 'User Research',
    description: 'Cluster qualitative data to reveal emergent themes and patterns across research findings.',
    queryHint: 'Search broadly and collect qualitative evidence: user quotes, forum threads, reviews, case studies, and expert opinions. Prioritize diverse sources to surface varied perspectives. Collect atomic data points that can be independently evaluated.',
    synthesisHint: 'Group findings into clusters of related ideas without imposing a predetermined structure. For each cluster: (1) Name the theme in the user\'s voice; (2) List 3-5 supporting evidence points; (3) Note frequency and strength. Show clustering hierarchy: observations → themes → meta-themes. Identify the 3 most significant emergent patterns.',
  },

  // ── Prioritization ────────────────────────────────────────────────────────
  {
    id: 'rice-scoring',
    name: 'RICE Scoring',
    category: 'Prioritization',
    description: 'Score initiatives by Reach, Impact, Confidence, and Effort to prioritize objectively.',
    queryHint: 'Search for quantitative evidence informing RICE signals: user population size (Reach), problem severity and frequency (Impact), evidence quality (Confidence), and implementation complexity benchmarks (Effort). Find comparable case studies to calibrate estimates.',
    synthesisHint: 'Structure findings to directly inform RICE scoring: (1) Reach — estimated users affected with source; (2) Impact — problem severity (low/medium/high/massive) with evidence; (3) Confidence — evidence quality score with caveats; (4) Effort — comparable implementation data. Produce a ranked shortlist with RICE scores and key assumptions.',
  },
  {
    id: 'ice-scoring',
    name: 'ICE Scoring',
    category: 'Prioritization',
    description: 'Quick prioritization using Impact, Confidence, and Ease — ideal for early-stage decisions.',
    queryHint: 'Search for evidence of potential impact (market size, pain intensity), confidence signals (validated assumptions, comparable case studies), and ease of implementation (technical complexity, resource requirements). Focus on benchmarks from similar products.',
    synthesisHint: 'For each candidate provide: (1) Impact evidence (1-10) with rationale; (2) Confidence evidence (1-10) — what is and is not validated; (3) Ease estimate (1-10) — complexity and dependencies. Produce a ranked list by ICE score (I×C×E). Flag top assumptions that would reorder the list if wrong.',
  },
  {
    id: 'moscow-method',
    name: 'MoSCoW Method',
    category: 'Prioritization',
    description: 'Categorize requirements as Must-have, Should-have, Could-have, or Won\'t-have this release.',
    queryHint: 'Search for requirements that are non-negotiable, important but not critical, nice-to-have enhancements, and explicitly out-of-scope items. Find user expectation evidence: what users consider table stakes vs. bonus features. Look for competitive parity requirements.',
    synthesisHint: 'Present findings in four MoSCoW categories: (1) Must-Have — evidence that absence causes failure; (2) Should-Have — evidence of value but degraded without; (3) Could-Have — delight features with low core-value dependency; (4) Won\'t-Have Now — explicitly deprioritized with rationale. Justify each categorization with evidence.',
  },
  {
    id: 'impact-effort-matrix',
    name: 'Impact vs Effort Matrix',
    category: 'Prioritization',
    description: 'Plot initiatives on a 2×2 to identify quick wins and deprioritize hard low-value work.',
    queryHint: 'Search for evidence on two axes per candidate: potential impact (user value, revenue, risk reduction) and implementation effort (time, complexity, dependencies). Find industry benchmarks for similar features. Look for case studies showing impact after implementation.',
    synthesisHint: 'Map findings to four quadrants: (1) Quick Wins — high impact, low effort; (2) Major Projects — high impact, high effort; (3) Fill-Ins — low impact, low effort; (4) Thankless Tasks — low impact, high effort. For each quadrant, list items with supporting evidence. Recommend what to do first and what to deprioritize.',
  },
  {
    id: 'opportunity-scoring',
    name: 'Opportunity Scoring',
    category: 'Prioritization',
    description: 'Find underserved outcomes where importance is high but current satisfaction is low.',
    queryHint: 'Search for what outcomes users care most about (importance signals) and how well current solutions deliver on those outcomes (satisfaction signals). Find complaints indicating high importance + low satisfaction gaps. Search for NPS data, user surveys, and satisfaction metrics.',
    synthesisHint: 'Apply the Ulwick formula: Opportunity = Importance + max(Importance − Satisfaction, 0). Present a table ranked by opportunity score: (1) Outcome; (2) Importance evidence; (3) Satisfaction evidence; (4) Score; (5) Current solution gap. Highlight the top 5 underserved outcomes as prime innovation targets.',
  },
  {
    id: 'weighted-scoring',
    name: 'Weighted Scoring',
    category: 'Prioritization',
    description: 'Score options against multiple weighted criteria to reflect actual business priorities.',
    queryHint: 'Search for evidence against common scoring criteria: user value, strategic alignment, technical feasibility, revenue potential, competitive differentiation, and risk. Find data to support scoring each option on each criterion. Look for industry benchmarks.',
    synthesisHint: 'Present a weighted scoring matrix with suggested weights: Strategic Fit 25%, User Value 25%, Feasibility 20%, Revenue 20%, Risk 10%. For each option, provide evidence-based scores per criterion and total weighted score. Add sensitivity analysis: which weight change most reorders the ranking.',
  },
  {
    id: 'value-vs-complexity',
    name: 'Value vs Complexity',
    category: 'Prioritization',
    description: 'Simple 2×2 that separates high-value simple wins from complex low-value investments.',
    queryHint: 'Search for value signals (demand frequency, revenue potential, competitive necessity) and complexity signals (engineering effort, dependencies, regulatory burden, maintenance cost). Find cases where teams over-invested in complex low-value work.',
    synthesisHint: 'Map to a 2×2: (1) High Value/Low Complexity — do first; (2) High Value/High Complexity — plan carefully; (3) Low Value/Low Complexity — opportunistic; (4) Low Value/High Complexity — avoid. List examples per quadrant with evidence. Add a "complexity debt" note: which items could be simplified before execution.',
  },

  // ── Systems Thinking ──────────────────────────────────────────────────────
  {
    id: 'causal-loop',
    name: 'Causal Loop Diagram',
    category: 'Systems Thinking',
    description: 'Map reinforcing and balancing feedback loops to understand systemic dynamics.',
    queryHint: 'Search for causal relationships in the system: what factors drive each other, what creates feedback loops, and what delays exist between cause and effect. Find historical data showing reinforcing growth cycles or balancing corrections. Look for unintended consequences of past interventions.',
    synthesisHint: 'Map the system in text: (1) Reinforcing loops (R) — virtuous or vicious cycles; (2) Balancing loops (B) — self-correcting mechanisms; (3) Key leverage points — variables where small changes have outsized effects; (4) Time delays that obscure cause-effect. Highlight which loops currently dominate behavior.',
  },
  {
    id: 'iceberg-model',
    name: 'Iceberg Model',
    category: 'Systems Thinking',
    description: 'Look beyond events to patterns, structures, and mental models driving outcomes.',
    queryHint: 'Search for patterns and trends behind observable events. Find structural causes: policies, incentives, resource flows, and power dynamics creating the patterns. Search for the mental models and beliefs sustaining the structures. Look for historical attempts to change symptoms without addressing root structure.',
    synthesisHint: 'Present findings at four iceberg levels: (1) Events — visible/observable right now; (2) Patterns — recurring trends over time; (3) Structures — systems, incentives, and flows creating the patterns; (4) Mental Models — beliefs sustaining the structures. Emphasize that interventions at the structure and mental model levels are most leveraged.',
  },
  {
    id: 'pestle',
    name: 'PESTLE Analysis',
    category: 'Systems Thinking',
    description: 'Scan macro-environment forces: Political, Economic, Social, Technological, Legal, Environmental.',
    queryHint: 'Search across six dimensions: Political (regulations, policy, geopolitical risk), Economic (market conditions, funding climate), Social (demographic shifts, cultural trends), Technological (emerging tech, disruption vectors), Legal (compliance, IP landscape), Environmental (sustainability pressure, climate risk). Find both threats and opportunities in each.',
    synthesisHint: 'Structure as a PESTLE matrix with one section per dimension. For each: (1) Top 2-3 forces; (2) Evidence and trend direction; (3) Impact magnitude (low/medium/high); (4) Timeline (near-term vs. long-term). Conclude with a cross-cutting synthesis: which forces are most interconnected and how they amplify each other.',
  },
  {
    id: 'stakeholder-mapping',
    name: 'Stakeholder Mapping',
    category: 'Systems Thinking',
    description: 'Identify and prioritize stakeholders by influence and interest to shape engagement strategy.',
    queryHint: 'Search for all parties affecting or influenced by the topic: direct users, decision-makers, influencers, regulators, and opponents. Find evidence of each stakeholder\'s goals, concerns, and influence level. Look for existing coalition dynamics and power structures.',
    synthesisHint: 'Map stakeholders on two axes: Power/Influence (high-low) and Interest/Alignment (high-low). Four quadrants: (1) Manage closely — high power, high interest; (2) Keep satisfied — high power, low interest; (3) Keep informed — low power, high interest; (4) Monitor — low power, low interest. For each key stakeholder: goal, concern, engagement strategy.',
  },
  {
    id: 'force-field',
    name: 'Force Field Analysis',
    category: 'Systems Thinking',
    description: 'Identify driving forces for change and restraining forces against it to design interventions.',
    queryHint: 'Search for forces driving adoption/change (tech enablers, market demand, competitive pressure, regulatory push) and forces resisting change (inertia, switching costs, vested interests, technical barriers, cultural resistance). Find evidence of magnitude for each force.',
    synthesisHint: 'Present two columns: Driving Forces (for change) and Restraining Forces (against change). For each force: (1) Description; (2) Evidence and strength (1-5). Calculate net force direction. Strategy: strengthen the top 2 driving forces AND/OR weaken the top 2 restraining forces — with specific tactics for each.',
  },
  {
    id: 'systems-archetypes',
    name: 'Systems Archetypes',
    category: 'Systems Thinking',
    description: 'Recognize common systemic behavior patterns to predict dynamics and avoid traps.',
    queryHint: 'Search for systemic patterns: Fixes That Fail (short-term fix creates long-term problems), Shifting the Burden, Limits to Growth, Tragedy of the Commons, Escalation (arms races). Find historical examples matching the pattern. Look for leading indicators suggesting which archetype is at play.',
    synthesisHint: 'Identify which system archetype(s) best describe the dynamics. For each archetype found: (1) Name the archetype; (2) Map specific variables to the structure; (3) Predict trajectory if uninterrupted; (4) Identify the high-leverage intervention that breaks the pattern. Flag co-occurring archetypes that interact.',
  },

  // ── Strategy ──────────────────────────────────────────────────────────────
  {
    id: 'blue-ocean',
    name: 'Blue Ocean Strategy',
    category: 'Strategy',
    description: 'Create uncontested market space by eliminating, reducing, raising, and creating value factors.',
    queryHint: 'Search for: value factors the industry competes on that customers do not actually value (eliminate/reduce candidates); value factors customers want but the industry underdelivers (raise candidates); value factors no current solution offers (create candidates). Find evidence of non-customers and why they do not buy any existing solution.',
    synthesisHint: 'Apply the ERRC grid: (1) Eliminate — factors to remove with evidence they add cost but not value; (2) Reduce — factors to lower below industry standard; (3) Raise — factors to lift above standard with demand evidence; (4) Create — factors never offered with latent need evidence. Conclude with a Strategy Canvas showing before/after value curve.',
  },
  {
    id: 'porters-five-forces',
    name: 'Porter\'s Five Forces',
    category: 'Strategy',
    description: 'Analyze competitive intensity through five structural forces that shape industry profitability.',
    queryHint: 'Search for evidence of each force: supplier concentration and switching costs, buyer bargaining leverage, barriers to entry and new entrant activity, substitute products and adoption rates, current competitor intensity and differentiation strategies. Find market structure data: concentration ratios, margins.',
    synthesisHint: 'Score each force (Low/Medium/High intensity): (1) Threat of New Entrants — barriers evidence; (2) Bargaining Power of Suppliers; (3) Bargaining Power of Buyers; (4) Threat of Substitutes including non-consumption; (5) Rivalry Among Competitors. Overall attractiveness assessment and key strategic implication per force.',
  },
  {
    id: 'value-chain',
    name: 'Value Chain Analysis',
    category: 'Strategy',
    description: 'Map primary and support activities to identify where value is created and where to optimize.',
    queryHint: 'Search for key activities in creating and delivering value: inbound logistics, operations, outbound, marketing, and service (primary). Support activities: procurement, technology, HR, infrastructure. Find where margins are highest, costs are concentrated, and competitors differentiate.',
    synthesisHint: 'Map the value chain with Primary Activities (Inbound → Operations → Outbound → Marketing → Service) and Support Activities (Infrastructure, HR, Technology, Procurement). For each activity: (1) Key cost drivers; (2) Differentiation potential; (3) Competitive benchmark. Identify the 2-3 activities offering the greatest leverage for competitive advantage.',
  },
  {
    id: 'competitive-moats',
    name: 'Competitive Moats',
    category: 'Strategy',
    description: 'Identify sustainable competitive advantages: network effects, switching costs, cost advantages, intangibles.',
    queryHint: 'Search for evidence of durable advantages: network effects (value growing with users), switching costs (what keeps customers locked in), cost advantages (scale economics, proprietary processes), intangible assets (brand loyalty, IP, regulatory licenses). Find evidence of moat erosion and competitive attempts to replicate.',
    synthesisHint: 'Assess each moat type: (1) Network Effects — value-increases-with-scale evidence; (2) Switching Costs — evidence users stay despite alternatives; (3) Cost Advantages — structural cost leadership evidence; (4) Intangible Assets — brand premium or IP protection evidence; (5) Efficient Scale — natural monopoly dynamics. Rate each moat: wide / narrow / none. Identify the primary moat and its durability.',
  },
  {
    id: 'platform-strategy',
    name: 'Platform Strategy',
    category: 'Strategy',
    description: 'Design multi-sided platform dynamics: producers, consumers, core interaction, and network effects.',
    queryHint: 'Search for two-sided or multi-sided market dynamics: producer side, consumer side, and the core value exchange. Find evidence of same-side and cross-side network effects. Search for platform governance decisions, monetization models, and chicken-and-egg bootstrapping strategies.',
    synthesisHint: 'Map the platform: (1) Sides — producers and consumers; (2) Core Interaction — primary value exchange; (3) Network Effects — same-side and cross-side dynamics; (4) Monetization — where value is captured; (5) Governance — curation and quality control. Identify the key bootstrapping challenge and how successful platforms solved it.',
  },
  {
    id: 'first-principles',
    name: 'First Principles Thinking',
    category: 'Strategy',
    description: 'Break down assumptions to fundamental truths, then reason up to novel solutions.',
    queryHint: 'Search for the fundamental physical, economic, or behavioral constraints governing the topic. Find evidence challenging common assumptions: what has always been done a certain way and is it actually necessary. Search for cases where someone violated industry conventions and succeeded.',
    synthesisHint: 'Structure as a first principles decomposition: (1) Identify the convention being challenged; (2) Decompose to fundamental constraints — what is physically or economically immutable; (3) Identify which assumptions are convention, not constraint; (4) Rebuild from fundamentals — what would the optimal solution look like without convention; (5) Map the gap between current state and the first-principles ideal.',
  },
  {
    id: 'category-design',
    name: 'Category Design',
    category: 'Strategy',
    description: 'Create and dominate a new market category rather than competing in an existing one.',
    queryHint: 'Search for conditions suggesting a new category is emerging: problems existing categories do not address, terminology shifts, new buyer profiles, and enabling technology changes. Find examples of successful category creation. Search for problems currently addressed by a patchwork of workarounds.',
    synthesisHint: 'Assess category design potential: (1) Category Problem — new problem existing categories do not solve; (2) Category Solution — the new way framed as a category not a feature; (3) Category King potential — is a dominant player emerging; (4) Ecosystem adoption — partners, investors, press; (5) Conditioning — how to educate the market. Recommend whether to compete in or create a category.',
  },

  // ── Validation ────────────────────────────────────────────────────────────
  {
    id: 'pretotype-testing',
    name: 'Pretotype Testing',
    category: 'Validation',
    description: 'Test the riskiest assumption at lowest cost before building anything real.',
    queryHint: 'Search for the fastest validation methods in similar contexts: landing page tests, fake door tests, manual simulations, and prototype user reactions. Find case studies of products validated with minimal investment. Search for demand signals: waitlists, pre-orders, community formation around the problem.',
    synthesisHint: 'Identify the riskiest assumption that must be true for the product to succeed. For each key assumption: (1) The assumption stated; (2) A pretotype design to test it; (3) Success metric — what signal validates it; (4) Cost and timeline estimate. Prioritize by risk: which assumption, if false, would be most fatal.',
  },
  {
    id: 'fake-door-test',
    name: 'Smoke Test / Fake Door',
    category: 'Validation',
    description: 'Measure demand by advertising a feature that does not exist yet and tracking intent signals.',
    queryHint: 'Search for fake door test examples and benchmark conversion rates in comparable markets. Find which messaging and value propositions resonate most with the target segment. Look for existing landing pages or ads testing similar offers and their reported results.',
    synthesisHint: 'Design a smoke test proposal: (1) Hypothesis — what demand signal validates the opportunity; (2) Test design — specific CTA or landing page; (3) Traffic source and targeting; (4) Success benchmark — the conversion rate that justifies building; (5) Interpretation guide — what different results mean for the go/no-go decision. Reference comparable test benchmarks from research.',
  },
  {
    id: 'wizard-of-oz',
    name: 'Wizard of Oz MVP',
    category: 'Validation',
    description: 'Simulate automated behavior with manual human effort to validate without building automation.',
    queryHint: 'Search for Wizard of Oz MVP examples — services that appeared automated but were manually fulfilled. Find evidence of the target interaction frequency and latency tolerance. Search for operational benchmarks: what manual fulfillment costs per transaction at the target volume.',
    synthesisHint: 'Design the Wizard of Oz test: (1) The automated capability to simulate; (2) The manual process behind the curtain; (3) User-facing interface design; (4) Operational burden estimate per interaction; (5) Key metrics: usage, satisfaction, and demand signal; (6) Break-even point between manual and automated. Flag what to learn that justifies the operational cost.',
  },
  {
    id: 'concierge-mvp',
    name: 'Concierge MVP',
    category: 'Validation',
    description: 'Manually deliver the value proposition to a small group before building any product.',
    queryHint: 'Search for concierge MVP examples in comparable domains. Find what white-glove service delivery looked like and the unit economics: cost vs. value delivered. Look for what teams learned from high-touch delivery that they would not have learned from a product alone.',
    synthesisHint: 'Design the concierge MVP: (1) Target segment — who to serve manually first; (2) Service scope — what will be done by hand; (3) Success metrics — results that must be achieved for the user; (4) Learning goals — what validated insights does this provide; (5) Unit economics — cost of service vs. willingness to pay; (6) Automation roadmap — which steps to automate first based on frequency.',
  },
  {
    id: 'ab-testing',
    name: 'A/B Testing Framework',
    category: 'Validation',
    description: 'Design controlled experiments to test hypotheses with statistical rigor.',
    queryHint: 'Search for industry benchmarks for the metric being tested. Find comparable A/B test case studies and their effect sizes. Search for confounding variables that contaminate results. Look for minimum detectable effect benchmarks in similar product contexts.',
    synthesisHint: 'Design the test: (1) Hypothesis — specific change and expected effect direction; (2) Primary metric determining success; (3) Guardrail metrics to monitor for regressions; (4) Sample size for 80% power at the minimum detectable effect; (5) Duration — accounting for novelty effect and weekly cycles; (6) Pre-committed decision criteria. Reference benchmark conversion rates from research.',
  },
  {
    id: 'north-star-metric',
    name: 'North Star Metric',
    category: 'Validation',
    description: 'Identify the single metric that best captures the core value delivered to users.',
    queryHint: 'Search for how successful companies in this space define their North Star Metric. Find examples of companies that over-optimized on proxies (DAU, revenue) and lost product-market fit. Search for what behavior most strongly correlates with retention and expansion.',
    synthesisHint: 'Evaluate candidate North Star Metrics on three criteria: (1) Does it reflect real value to the user, not just business value? (2) Is it a leading indicator of long-term retention? (3) Can the full team influence it? Recommend one North Star Metric with rationale, plus 3-5 input metrics that drive it. Flag anti-patterns: metrics that look good but hide unhealthy dynamics.',
  },

  // ── AI/Deep Research ──────────────────────────────────────────────────────
  {
    id: 'chain-of-thought',
    name: 'Chain-of-Thought Research',
    category: 'AI/Deep Research',
    description: 'Break the research question into explicit sub-questions and answer each before synthesizing.',
    queryHint: 'Decompose the main research question into 4-6 sub-questions that must be answered to fully address it. Search each sub-question independently with targeted queries. For each, look for both confirming and disconfirming evidence. Prioritize primary sources.',
    synthesisHint: 'Present research as an explicit reasoning chain: (1) Restate the main question; (2) For each sub-question: the question, evidence, and provisional answer; (3) Show how sub-answers combine into the final answer; (4) State confidence level for each step; (5) Flag the weakest link — the step with least evidence. Conclude with the answer and the reasoning path.',
  },
  {
    id: 'multi-perspective',
    name: 'Multi-Perspective Analysis',
    category: 'AI/Deep Research',
    description: 'Analyze the question through diverse stakeholder lenses to surface blind spots.',
    queryHint: 'Search for perspectives from diverse stakeholders: end users, operators, regulators, investors, critics, and domain experts. Find arguments both for and against the dominant view. Search for contrarian analyses. Look for how different industries or geographies approach the same question differently.',
    synthesisHint: 'Present distinct perspectives: (1) Label each (User, Investor, Regulator, Critic, etc.); (2) Key claims and supporting evidence; (3) What each perspective identifies as the core problem; (4) Where perspectives conflict and why. Conclude with a synthesis: what view emerges when all perspectives are weighted, and which perspective is most underrepresented in mainstream analysis.',
  },
  {
    id: 'red-team',
    name: 'Red Team Analysis',
    category: 'AI/Deep Research',
    description: 'Stress-test assumptions and plans by systematically arguing the opposing case.',
    queryHint: 'Search for failure cases, counterarguments, and disconfirming evidence. Find critiques from domain experts opposing the mainstream view. Search for historical precedents where the optimistic case failed. Look for second-order effects, unintended consequences, and edge cases that break the primary thesis.',
    synthesisHint: 'Lead with the strongest version of the opposing argument — steelman the countercase fully. For each major claim in the primary thesis: (1) Most credible counterargument; (2) Supporting evidence; (3) Strength rating (strong/medium/weak). Conclude with: which assumptions are most fragile, what evidence would change the thesis, and which risk mitigations matter most.',
  },
  {
    id: 'scenario-planning',
    name: 'Scenario Planning',
    category: 'AI/Deep Research',
    description: 'Map multiple plausible futures to stress-test strategy robustness across different outcomes.',
    queryHint: 'Search for key uncertainties that will most determine the future: technological change vectors, regulatory directions, economic cycles, and behavioral shifts. Find historical scenario planning analyses for comparable markets. Search for leading indicators signaling which future is materializing.',
    synthesisHint: 'Define 3-4 scenarios: (1) Name and narrative; (2) Key assumptions and uncertainties differentiating each; (3) Probability estimate with rationale; (4) Implications for the topic in each scenario. Identify decisions that are robust across all scenarios (no-regret moves) vs. scenario-specific bets. Conclude with the most likely scenario and highest-priority strategic response.',
  },
  {
    id: 'analogical-reasoning',
    name: 'Analogical Reasoning',
    category: 'AI/Deep Research',
    description: 'Find structural analogies from other domains and extract transferable insights.',
    queryHint: 'Search for analogous problems in different industries sharing structural similarities: same dynamics, constraints, or stakeholder relationships. Find how analogous problems were solved and what made those solutions work. Look for "what industry is this the X of?" framings. Search for both successful analogies and cases where analogies misled.',
    synthesisHint: 'Present 3-5 structural analogies: (1) The analogous domain and problem; (2) How the structure maps to the current problem and where the analogy breaks; (3) How the analogous problem was solved; (4) Transferable insight for the current context; (5) Key differences limiting applicability. Conclude with the most actionable insight from the strongest analogy.',
  },
  {
    id: 'socratic-method',
    name: 'Socratic Method',
    category: 'AI/Deep Research',
    description: 'Use systematic questioning to expose assumptions, contradictions, and deeper truths.',
    queryHint: 'Search for the deepest assumptions underlying the conventional wisdom about the topic. Find evidence challenging each assumption. Search for questions that most experts avoid. Look for contradictions between stated beliefs and actual behavior in the field. Find the unanswered questions that would most change the field if answered.',
    synthesisHint: 'Structure as a sequence of questions and answers that progressively deepen understanding: (1) Surface question and common answer; (2) Evidence that challenges the common answer; (3) Deeper question revealed; continue for 4-5 levels. Conclude with the deepest unresolved question — the one that, if answered, would most change how the topic is understood. Flag which assumptions remain untested.',
  },
  {
    id: 'pre-mortem',
    name: 'Pre-Mortem Analysis',
    category: 'AI/Deep Research',
    description: 'Imagine the project has already failed and work backwards to identify risks and failure modes.',
    queryHint: 'Search for failure modes and common reasons projects fail in this domain. Find post-mortems and failure case studies. Search for warning signs and leading indicators of failure. Look for risks that others in similar situations systematically ignored until it was too late.',
    synthesisHint: 'Structure as a pre-mortem: (1) State the failure scenario — the project has failed; (2) For each likely failure cause: evidence it could happen, early warning signs, and preventive action; (3) Rank failure modes by likelihood × impact; (4) Identify the single most probable cause of failure; (5) Prescribe the 3 most important early interventions. Lead with the hardest-to-see risk, not the most obvious one.',
  },
]

export const FRAMEWORK_IDS = new Set(FRAMEWORKS.map((f) => f.id))
export const FRAMEWORKS_BY_ID = new Map(FRAMEWORKS.map((f) => [f.id, f]))

export const FRAMEWORKS_BY_CATEGORY = FRAMEWORKS.reduce(
  (acc, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  },
  {} as Record<FrameworkCategory, FrameworkOption[]>
)
