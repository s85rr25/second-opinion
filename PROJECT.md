# Second Opinion — Project Spec

> A macOS menu-bar app that dispatches a swarm of AI agents to build a **provenance profile** for whatever you're reading. Not a fact-checker. A calibration tool.

This document is the canonical context for the project. Read it fully before writing any code.

---

## 1. Context: what we're building and why

### The one-line pitch
Every fact-checker tells you if something is *true*. Second Opinion tells you how many *independent* sources actually saw it with their own eyes — because most "consensus" is six outlets citing one tweet.

### The problem
When you read a news article, you cannot easily see:
- Where the central claim originated
- How many of the citing sources are themselves downstream of a single root
- What the author's track record on similar claims is
- Who funded the underlying research or has an incentive in the claim
- What the strongest *opposing* evidence looks like

Humans used to do this work themselves (slowly) or trust institutions to do it (less and less). LLMs + web search finally make it tractable to do in real time, for anything on your screen.

### The product
A macOS menu-bar app. User hits a global hotkey (⌘⇧S) while reading anything on screen. The app:
1. Captures the text of what they're reading
2. Dispatches four specialist agents in parallel
3. Aggregates their findings via a fifth synthesis agent
4. Displays a panel with a verdict, confidence badge, lineage graph, and a button for the full dossier

### The hackathon context (critical — read this)
This is a **6-hour hackathon** where **the idea matters more than the build**. The brief explicitly says: "We want to see your thinking as much as your code." Judges reward ethical wrestling, ambitious scope framing, and a memorable demo moment — not feature completeness.

The shipped product will be ~15% of the full vision. That is correct and intentional. The pitch will explicitly name what is stubbed and why, which is a pitch asset (honesty about scope), not a liability.

### Target tracks
Primary: **Governance & Collaboration**. Secondary: **Neuroscience & Mental Health** (calibrated trust as cognitive hygiene).

---

## 2. The ethical framing (bake this into the product, not just the pitch)

Four tensions this tool explicitly wrestles with. These are **not** afterthoughts — they should be visible in the product surface.

1. **Dependency risk.** An AI-mediated epistemic immune system isn't *your* immune system. If the tool is always on, does the skill of skepticism atrophy? — *Product implication: the tool must feel like scaffolding, not a verdict. Never replace the user's judgment; augment it.*

2. **Authority laundering.** Any verdict feels authoritative even when it shouldn't. — *Product implication: show uncertainty visibly. Confidence is a gradient, never binary. Dissent between agents is a first-class UI element, not a footnote.*

3. **Whose priors?** The agents themselves are LLMs with training biases. — *Product implication: name this in the dossier. Each agent's "verdict" is labeled as "the Lineage Agent found…" not as "the truth is…"*

4. **Chilling effect on heterodox sources.** A "red badge" on a legitimate-but-unconventional source could unfairly tank it. Provenance ≠ quality. — *Product implication: the badge is about provenance clarity, not truth. "Red" means "we couldn't trace this" or "everything traces to one source," not "this is wrong."*

**Do not try to resolve these tensions in code.** Name them. The product should feel like it's in honest conversation with its own limitations.

---

## 3. The multi-agent architecture

Four specialist agents run in **parallel**. A fifth synthesis agent aggregates. All agent calls are structured: strict JSON in, strict JSON out.

### Agent 1 — Lineage Agent (BUILD FULLY)
**Goal:** Trace the article's load-bearing claims backward to their origin.

**Input:** The article text.

**Process:**
1. First Claude call: extract the 2–3 most load-bearing factual claims from the article. Output `claims: string[]`.
2. For each claim, one Claude call with web search tool enabled: find the earliest appearance of this claim online, plus the citation chain between the article and that origin.
3. Third Claude call: dedupe sources, identify the root(s), build a graph.

**Output shape:**
```json
{
  "agent": "lineage",
  "claims": ["string"],
  "nodes": [
    { "id": "string", "url": "string", "title": "string", "publisher": "string", "date": "ISO8601", "is_root": false }
  ],
  "edges": [
    { "from": "node_id", "to": "node_id", "relationship": "cites | quotes | paraphrases" }
  ],
  "root_sources": ["node_id"],
  "confidence": 0.0,
  "notes": "string — any caveats, e.g. 'could not reach 2 of 7 cited sources'"
}
```

**This is the money-shot agent.** The lineage graph visualization is the single most important UI element in the demo.

### Agent 2 — Steelman Agent (BUILD FULLY)
**Goal:** Find the *strongest* opposing evidence. Not balanced coverage — specifically the best counter-case.

**Input:** The article text.

**Process:**
1. Claude call to identify the article's thesis.
2. Claude call with web search: search for high-quality opposing evidence, ranked by source credibility.

**Output shape:**
```json
{
  "agent": "steelman",
  "thesis": "string",
  "counter_evidence": [
    { "claim": "string", "source_url": "string", "source_title": "string", "strength": "strong | moderate | weak", "reasoning": "string" }
  ],
  "confidence": 0.0,
  "notes": "string"
}
```

### Agent 3 — Funding & Incentive Agent (STUB)
**Goal:** Identify who funded the underlying research, who benefits, affiliations of quoted experts.

**For the hackathon:** return a hand-written dossier after a 5–15s realistic delay. The interface must match what a real implementation would return.

**Output shape:**
```json
{
  "agent": "funding",
  "funders": [{ "entity": "string", "relationship": "string", "notes": "string" }],
  "quoted_experts": [{ "name": "string", "affiliation": "string", "disclosed_conflicts": "string" }],
  "confidence": 0.0,
  "notes": "string — stubbed for hackathon demo"
}
```

### Agent 4 — Track Record Agent (STUB)
**Goal:** Pull the author's (or publication's) prior claims on similar topics and how those aged.

**For the hackathon:** return a hand-written dossier after a 5–15s realistic delay.

**Output shape:**
```json
{
  "agent": "track_record",
  "author": "string",
  "publication": "string",
  "prior_claims": [{ "claim": "string", "date": "ISO8601", "aged_well": true, "notes": "string" }],
  "confidence": 0.0,
  "notes": "string — stubbed for hackathon demo"
}
```

### Agent 5 — Synthesis Agent (BUILD FULLY)
**Goal:** Aggregate the four dossiers into a single verdict — **and flag disagreement between agents as a first-class output**.

**Input:** All four agent outputs.

**Output shape:**
```json
{
  "verdict_sentence": "string — one sentence, <25 words",
  "badge": "green | yellow | red",
  "badge_reasoning": "string — one sentence on why this badge",
  "confidence": 0.0,
  "dissent": [
    { "between": ["agent_a", "agent_b"], "disagreement": "string — what they disagreed about" }
  ],
  "caveats": ["string"]
}
```

**Critical:** the `dissent` array must be rendered prominently in the UI. This is the ethical wrestling made visible. If agents disagree, the user must see it, not have it papered over.

### Agent execution
- Agents 1–4 run in **parallel** via `Promise.all`.
- Agent 5 runs once all four have returned (or timed out — see timeouts below).
- Total target latency: under 30 seconds.

---

## 4. Tech stack (locked)

### Runtime: Electron
**Why not native Swift:** Swift + SwiftUI eats hackathon time for menu-bar polish. Electron ships a menu-bar app in under 30 minutes and we already know JS/React.

- **Electron** latest stable
- **React 18** for the panel UI
- **TypeScript** throughout
- **Vite** for bundling (via `electron-vite`)
- **Tailwind CSS** for styling
- **Framer Motion** for the lineage graph animation (the collapse moment)
- **react-force-graph-2d** for the graph visualization
- **Zustand** for app state

### Agent layer
- **Anthropic SDK** (`@anthropic-ai/sdk`) with the **web search tool** enabled for Lineage and Steelman
- **Model:** `claude-sonnet-4-5` for all agents (speed over peak intelligence for hackathon). Swap to `claude-opus-4-7` only if output quality is materially lacking.
- **Max tokens:** 2000 per agent call
- **Temperature:** 0.3 for specialist agents (Lineage, Steelman, Funding, Track Record), 0.5 for Synthesis
- **API key:** read from `ANTHROPIC_API_KEY` env var, loaded via `dotenv`

### Screen capture / text extraction
- **Primary:** global hotkey captures a screenshot of the frontmost window
  - Use Electron's `globalShortcut.register('CommandOrControl+Shift+S', ...)`
  - Use Electron's `desktopCapturer` to grab the screenshot
- **OCR:** `tesseract.js` — runs in the renderer, no native deps, ships in the Electron bundle
- **Do NOT** attempt macOS Accessibility API integration. It is a rabbit hole. Screenshot + OCR is the demo-safe path and visually stronger anyway (user sees the capture happen).

### Menu-bar integration
- Electron `Tray` API — menu-bar icon, click to open/close panel
- Panel is a `BrowserWindow` with `frame: false`, `transparent: true`, positioned under the tray icon
- Hotkey always works; clicking the tray icon is secondary

### IPC
- `ipcMain` / `ipcRenderer` for main ↔ renderer
- Agent orchestration lives in the **main process** (keeps API key out of renderer, cleaner concurrency)
- Renderer subscribes to agent progress events: `agent:started`, `agent:progress`, `agent:completed`, `agent:failed`

### Storage
- For the hackathon: no persistence. Each run is fresh.
- (Post-hackathon: SQLite via `better-sqlite3` for history.)

---

## 5. Project structure

```
second-opinion/
├── CLAUDE.md                          # This file
├── README.md                          # Setup instructions
├── package.json
├── tsconfig.json
├── vite.config.ts
├── electron.vite.config.ts
├── tailwind.config.js
├── .env.example                       # ANTHROPIC_API_KEY=...
├── .gitignore
├── src/
│   ├── main/                          # Electron main process
│   │   ├── index.ts                   # App entry, tray, hotkey, windows
│   │   ├── capture.ts                 # Screenshot capture
│   │   ├── ocr.ts                     # Tesseract wrapper
│   │   ├── ipc.ts                     # IPC channel registration
│   │   └── agents/
│   │       ├── orchestrator.ts        # Runs agents in parallel, emits progress
│   │       ├── lineage.ts             # Lineage Agent (real)
│   │       ├── steelman.ts            # Steelman Agent (real)
│   │       ├── funding.ts             # Funding Agent (stub)
│   │       ├── track_record.ts        # Track Record Agent (stub)
│   │       ├── synthesis.ts           # Synthesis Agent (real)
│   │       ├── claude.ts              # Shared Claude client wrapper
│   │       └── prompts.ts             # All agent prompts in one place
│   ├── renderer/                      # React panel UI
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Panel.tsx              # Main container
│   │   │   ├── AgentStatus.tsx        # Four-agent progress display
│   │   │   ├── VerdictBadge.tsx       # Green/yellow/red with verdict sentence
│   │   │   ├── LineageGraph.tsx       # react-force-graph-2d + Framer Motion
│   │   │   ├── DissentPanel.tsx       # Prominent display of agent disagreement
│   │   │   ├── Dossier.tsx            # Full dossier view (expanded)
│   │   │   └── EthicsFooter.tsx       # Always-visible reminder of tool limits
│   │   ├── store.ts                   # Zustand store
│   │   └── styles.css
│   ├── preload/
│   │   └── index.ts                   # Exposes IPC to renderer
│   └── shared/
│       ├── types.ts                   # All agent output types
│       └── demo-stubs.ts              # Pre-written dossiers for Funding + Track Record
```

---

## 6. Shared types (build these first)

```ts
// src/shared/types.ts

export type BadgeColor = 'green' | 'yellow' | 'red';
export type AgentName = 'lineage' | 'steelman' | 'funding' | 'track_record' | 'synthesis';
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface LineageNode {
  id: string;
  url: string;
  title: string;
  publisher: string;
  date: string; // ISO8601
  is_root: boolean;
}

export interface LineageEdge {
  from: string;
  to: string;
  relationship: 'cites' | 'quotes' | 'paraphrases';
}

export interface LineageOutput {
  agent: 'lineage';
  claims: string[];
  nodes: LineageNode[];
  edges: LineageEdge[];
  root_sources: string[];
  confidence: number;
  notes: string;
}

export interface SteelmanOutput {
  agent: 'steelman';
  thesis: string;
  counter_evidence: Array<{
    claim: string;
    source_url: string;
    source_title: string;
    strength: 'strong' | 'moderate' | 'weak';
    reasoning: string;
  }>;
  confidence: number;
  notes: string;
}

export interface FundingOutput {
  agent: 'funding';
  funders: Array<{ entity: string; relationship: string; notes: string }>;
  quoted_experts: Array<{ name: string; affiliation: string; disclosed_conflicts: string }>;
  confidence: number;
  notes: string;
}

export interface TrackRecordOutput {
  agent: 'track_record';
  author: string;
  publication: string;
  prior_claims: Array<{ claim: string; date: string; aged_well: boolean; notes: string }>;
  confidence: number;
  notes: string;
}

export interface SynthesisOutput {
  verdict_sentence: string;
  badge: BadgeColor;
  badge_reasoning: string;
  confidence: number;
  dissent: Array<{ between: [AgentName, AgentName]; disagreement: string }>;
  caveats: string[];
}

export interface AgentProgressEvent {
  agent: AgentName;
  status: AgentStatus;
  message?: string;
  output?: LineageOutput | SteelmanOutput | FundingOutput | TrackRecordOutput | SynthesisOutput;
  error?: string;
}

export interface RunResult {
  article_text: string;
  lineage: LineageOutput;
  steelman: SteelmanOutput;
  funding: FundingOutput;
  track_record: TrackRecordOutput;
  synthesis: SynthesisOutput;
  duration_ms: number;
}
```

---

## 7. Build order (6-hour plan — follow strictly)

### Hour 0–1: Skeleton
1. `npm create electron-vite@latest` with React + TS template
2. Install deps: `@anthropic-ai/sdk`, `tesseract.js`, `react-force-graph-2d`, `framer-motion`, `zustand`, `tailwindcss`, `dotenv`
3. Get tray icon + hotkey + panel window opening/closing working
4. Write `src/shared/types.ts` in full
5. Stub out all agents to return hardcoded JSON matching their output types
6. Wire up the full flow: hotkey → capture (fake) → orchestrator → all 5 agents (stubbed) → panel displays verdict

**Exit criteria for Hour 1:** End-to-end demo works with 100% fake data. Don't proceed until this is smooth.

### Hour 1–3: Real agents (Lineage + Steelman)
1. Implement `claude.ts` wrapper around the Anthropic SDK with web search tool enabled
2. Implement Lineage Agent (the three-step process from §3)
3. Implement Steelman Agent
4. Implement Synthesis Agent (simple aggregation, no web search needed)
5. Test each agent in isolation with a known article before wiring into the full flow

### Hour 3–4: Stubs + real capture
1. Screenshot + OCR via `tesseract.js`
2. Pre-write `demo-stubs.ts`: Funding and Track Record dossiers for the specific demo article
3. Add realistic delays (5–15s random) to stubs so they feel live
4. Stubs must read from the same interface a real implementation would — comment clearly

### Hour 4–5: Dissent UI + graph visualization
1. `LineageGraph.tsx`: render nodes + edges with react-force-graph-2d
2. **The collapse animation**: nodes appear as the Lineage Agent reports them (streamed), then edges animate in, then highlight the root source(s) with a pulse
3. `DissentPanel.tsx`: if `synthesis.dissent.length > 0`, render prominently above the dossier
4. `EthicsFooter.tsx`: always-visible strip reminding the user this is a provenance tool, not a truth oracle

### Hour 5–6: Polish + rehearsal
1. Pick the demo article. Trace its lineage by hand. Verify the Lineage Agent actually finds what you found manually.
2. Rehearse the pitch 3× with a timer
3. Write README with setup instructions
4. Record a backup video of the demo working in case live demo fails

**Do not add features in hour 5–6.** Polish only.

---

## 8. Prompt specs (starting points — iterate during Hour 1–3)

### Lineage Agent — Step 1: Extract claims
```
You are the Lineage Agent. Your job is to identify the 2–3 most load-bearing factual claims in the article below. A "load-bearing" claim is one that, if false, would collapse the article's thesis.

Rules:
- Only factual claims (no opinions or predictions)
- Prefer claims with specific attribution ("X said Y", "Study Z found W")
- Reject claims that are hedged beyond usefulness

Return ONLY valid JSON matching this schema:
{ "claims": ["string", "string", "string"] }

Article:
<<<
{ARTICLE_TEXT}
>>>
```

### Lineage Agent — Step 2: Trace each claim
```
You are the Lineage Agent. For the claim below, use web search to find:
1. The earliest verifiable appearance of this claim online (the "root")
2. Every intermediate source you can find that repeats or cites it

For each source found, return: url, title, publisher, date, and what it cites (if anything). Be aggressive about finding the root — if outlet A cites outlet B, search for the original B article.

Return ONLY valid JSON:
{
  "sources": [
    { "id": "s1", "url": "...", "title": "...", "publisher": "...", "date": "...", "cites": ["s2"] }
  ],
  "root_candidate_ids": ["s_root"]
}

Claim:
{CLAIM}
```

### Lineage Agent — Step 3: Consolidate
(Done in code — merge the per-claim results into one graph, dedupe by URL, flag root sources.)

### Steelman Agent
```
You are the Steelman Agent. Your job is NOT balance. Your job is to find the STRONGEST evidence AGAINST the article's thesis, ranked by source quality.

Ignore weak counter-arguments. Ignore "some critics say" filler. Find the single best peer-reviewed study, investigative report, or expert statement that contradicts the thesis, and up to 2 more strong counter-points.

Return ONLY valid JSON matching SteelmanOutput schema. Use web search aggressively.

Article thesis (identify first, then search):
<<<
{ARTICLE_TEXT}
>>>
```

### Synthesis Agent
```
You are the Synthesis Agent. Four specialist agents have investigated an article. Your job:

1. Produce ONE sentence (<25 words) summarizing what the user should know.
2. Assign a badge: green (well-sourced, traces to multiple independent roots), yellow (partial provenance or mixed signals), red (single-source consensus, cannot trace, or strong counter-evidence ignored).
3. CRITICALLY: identify any DISAGREEMENT between the four agents. If the Lineage Agent found the claim is well-sourced but the Steelman Agent found strong opposing evidence, that is dissent — surface it. If the Funding Agent flagged conflicts but the Track Record agent says the author is reliable, that is dissent.

The `badge` is about PROVENANCE, not TRUTH. A well-sourced article with legitimate counter-evidence gets yellow, not red.

Return ONLY valid JSON matching SynthesisOutput schema.

Dossiers:
{LINEAGE}
{STEELMAN}
{FUNDING}
{TRACK_RECORD}
```

---

## 9. Timeouts, errors, and graceful degradation

- Each agent has a **25-second timeout**. If it doesn't return in time, orchestrator marks it `failed` and synthesis runs with partial data.
- Synthesis agent MUST handle missing dossiers: if Lineage failed, synthesis says so in `caveats`.
- Web search failures: log, continue, flag in `notes`.
- Never block the UI on agent failure. The panel always renders *something*, even if it's just "we couldn't trace this."

---

## 10. The demo article

**Status:** to be chosen by the user before Hour 0.

**Criteria (in priority order):**
1. Multiple major outlets cover it
2. Citation chain traces back to a single study, press release, or anonymous source
3. Published in the last 12 months so web search finds it
4. User has personally traced the lineage by hand so they know what the right answer looks like

**Common archetypes that work:**
- Viral health/nutrition study where every outlet cites one underpowered paper
- Geopolitical claim where every outlet cites one anonymous official in a single Reuters/AP piece
- Product or company exposé where every outlet cites the same leaked document

Once chosen, hand-write `demo-stubs.ts` to reflect the Funding and Track Record findings for this specific article.

---

## 11. The pitch (rehearse, do not improvise)

**Structure, with timing:**

1. **Hook (20s):** "Every fact-checker tells you if something is true. None of them tell you how many independent sources actually saw it with their own eyes. Most 'consensus' is six outlets citing one tweet." Open the tool on the pre-chosen article.
2. **Live demo (90s):** Hotkey → four agents spin up → lineage graph animates → collapse moment → one dissent flag visible → click for dossier.
3. **Architecture (30s):** Show the four-agent + synthesis diagram. "Two agents are live, two are stubbed for today. The interface is the contribution."
4. **Ethics (60s):** Name all four tensions from §2. Do not resolve them. Say: "The honest version of this tool foregrounds its own uncertainty, which is why dissent between agents is a first-class UI element, not a footnote."
5. **Close (10s):** "This is a weeks-long project. In six hours we built the loop, two agents, and the moment that makes it feel real."

---

## 12. What this project is NOT

Guardrails against scope creep:

- **Not a fact-checker.** It does not adjudicate truth. It surfaces provenance.
- **Not a browser extension.** It is OS-level on purpose.
- **Not a chat interface.** It is a one-shot analysis tool. No back-and-forth.
- **Not a social feature.** No sharing, no accounts, no history (for the hackathon).
- **Not a content moderation tool.** Badges reflect provenance clarity, not content quality.
- **Not trying to replace human judgment.** Explicitly trying to scaffold it.

If Claude Code is about to add a feature that violates one of these, stop and re-read this section.

---

## 13. Success criteria for the hackathon

- [ ] Global hotkey triggers end-to-end flow
- [ ] Lineage Agent returns a real citation graph for the demo article
- [ ] Steelman Agent returns real counter-evidence for the demo article
- [ ] Funding + Track Record stubs return plausible dossiers with realistic delay
- [ ] Synthesis Agent produces verdict + badge + dissent array
- [ ] Lineage graph animates — nodes appearing, edges drawing, root pulsing
- [ ] Dissent panel renders prominently when `dissent.length > 0`
- [ ] Ethics footer always visible
- [ ] Pitch rehearsed 3× with timer
- [ ] Backup demo video recorded

**Non-goals** (do not do these, they are time sinks):
- Persistence / history
- User accounts
- Settings UI
- Real implementations of Funding and Track Record agents
- macOS Accessibility API integration
- Streaming tokens from Claude (batch responses are fine)
- Error toast system (console.error is fine for hackathon)
- Cross-platform support (macOS only)

---

## 14. Notes for Claude Code

- When in doubt about scope, re-read §1 (hackathon context) and §12 (what this is NOT).
- When in doubt about UX, the answer is almost always "show more uncertainty, less authority."
- Prefer readable code over clever code. The pitch may involve showing source files.
- If an agent prompt isn't returning useful output, iterate on the prompt before adding logic in code.
- Do not silently catch errors that would hide an agent failing — the dissent UI depends on knowing what happened.
- The lineage graph animation is non-negotiable. Budget time for it.
- Ask before adding any dependency not listed in §4.