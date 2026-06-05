# TODO

## Now (Phase A — next session)
- Empty SVG canvas at /framework with react-zoom-pan-pinch wrapping it
- Faint blueprint grid background (CSS-tiled SVG pattern)
- One debug rectangle at world origin to confirm rendering + pan/zoom work
- Verify on mobile/laptop

## Soon
- Phase B: Airport component as central landmark with runway extension
- Phase C: Parameterized Manager component, 4 instances in world-layout.ts
- Phase D: Parameterized Worker component, 2-3 per manager
- Phase E: Curved roads (manager↔workers), straight flight paths (airport↔managers)
- Phase F: Plane and Car animation along paths
- Phase G: SidePanel + click handlers + MDX content + pattern highlighting
- Phase H: Service vehicles, memory, guardrails, control tower; polish; deploy; LinkedIn

## Open decisions to revisit
- Plane flight paths: straight for v1, revisit if too rigid — could become slight arc later
- Color per manager: 4 distinct vivid colors needed (see palette.ts). Reference active-map.png for saturation level.
- Manager icon shapes: circle / triangle / square / diamond — confirm during Phase C
- Whether to add subtle "shadows" under buildings (depth illusion in 2D) — defer to polish phase

## Followups (post-launch)
- Tab 2 (the Builder) — drag-drop sandbox where users sketch their own workflow
- Phase-mode exploration (walk through the 7 phases of building an agent)
- Evals as an 8th phase
- Animation play/pause controls
- Camera constraints if pan/zoom feels too loose

## Things we discussed but explicitly skipped
- 3D rendering (R3F) — pivoted to 2D SVG; old 3D refs archived in references/_archive-3d/
- Parking garage building — not needed
- Satellite terminal — not needed (managers serve that role)
- Trees / landscaping — palette/geometry issues
- Perimeter road — clutter
- Multi-shade per-manager planes — locked: plane color matches destination manager

## Notes from the pivot day (preserve for context)
- We built a 3D R3F Airport on day 1 (4+ hours). The aesthetic was promising but the iteration speed was unsustainable for 9 more buildings.
- Day 2 pivot to top-down SVG, Mini Motorways-as-cars (not trains) metaphor.
- Cars-on-roads metaphor fits agent behavior better than trains-on-tracks (dispatches are dynamic, not scheduled).
- All visual references for the new direction in references/mini-motorways-v2/.

## Polish pass (do near end of project, before deploy)

- **Building shadows** — every building gets a long diagonal shadow (~30-45° offset, dark, soft edges). 
  Implementation: shared `<Shadow>` SVG filter or single shadow group composed once and reused. 
  Reference: see building-shapes.png in references/mini-motorways-v2/ — note the strong diagonal 
  shadow under the yellow building. This is what makes Mini Motorways look polished. Apply globally 
  to all buildings at once rather than per-building.

## Design principle (set during Phase A → B transition)

**Use Mini Motorways as visual vocabulary, not a template to copy.**
- The reference gives us: rounded buildings, curved roads, top-down view, dark night mode, vivid color accents.
- Our additions that already differentiate: blueprint grid, monospace labels, airports, runway, multi-type buildings (memory, guardrails, logger), pattern highlighting, click-to-explore.
- When designing each new building: ask "what's Routes' version of this?" not "how do I match Mini Motorways exactly?"
- The Airport (Phase B) is the easiest divergence — Mini Motorways has no airports. Use it to set the Routes-specific visual language.

## Polish (revisit during deploy prep)

- **Grid edges visible at max zoom-out.** Currently the grid is a finite rect (20× viewBox). At max zoom-out you can see the rect's edges. Tried several fixes; works in practice during normal use (zoomed to building level) but feels wrong on max zoom-out. Possible solutions to try later: render grid as a separate full-screen layer outside the pan/zoom transform (via CSS background), or constrain pan/zoom limits so users can't reach the rect edges.

## Architectural accuracy note (apply in Phase G content writing)

We checked against Anthropic's "Building Effective Agents" paper. Findings:
- The paper has 5 workflow patterns + 1 agent pattern.
- Orchestrator-workers pattern in the paper: orchestrator → workers directly. NO manager tier.
- Our "manager" tier is an extension representing what production multi-agent systems look like.
- Technically, our default world is "orchestrator-workers composed hierarchically" — a pattern composition that the paper acknowledges as common but doesn't name.

Decision: keep "manager" as friendly UI language (vs. "sub-orchestrator"). In Phase G educational content, be precise:
- Manager = a domain-specific sub-orchestrator
- Acknowledge this is pattern composition, not a single named pattern from the paper
- Teach the no-peer-coordination rule as a deliberate architectural principle (with reasoning)
- Cite the paper as our foundation while being honest that managers extend it

This makes the project both accessible AND honest. Don't pretend "manager" is in the paper; do explain why our model represents real production patterns.

## Car colors (Phase F implementation)

Cars are color-coded to encode flow direction:
- Outbound car (manager → worker, carrying a task): manager's color (colorBase)
- Inbound car (worker → manager, returning a result): worker's color (slightly lighter than manager)

Same logic as planes (outbound colored by destination, inbound represents result coming back). Implement when building Car.tsx in Phase F.

## Phase G interaction model (locked decision)

**Universal click-to-pause behavior:**
- Click anything (building, car, plane, road) → all motion globally pauses
- A popup (not a new tab) shows an explanation contextual to what was clicked
- Closing the popup resumes all motion from where it paused

**What clicks reveal:**
- Building click: explanation of the node type (orchestrator/manager/worker/etc.), what it does, what's inside, model recommendations, common mistakes
- Car click: the specific task/dispatch this car represents — e.g., "task sent from Manager A to Worker A2: manager needs database data, requesting from database worker"
- Plane click: the specific dispatch from orchestrator to manager — e.g., "orchestrator dispatching research task to Manager B (data analysis specialist)"
- Road click: the dispatch pattern represented by this connection
- Flight path click: the orchestrator↔manager communication pattern

**Implementation requirement for Phase F:**
- Motion system needs a "paused" global state that all animations subscribe to
- Cars/planes track their progress along their path (0.0 to 1.0) so they can pause AT that exact position and resume from there
- Probably a React context (PauseContext) or zustand store

## Polish item (revisit during Phase H deploy prep)

- **Grid edges still slightly visible** at default zoom even after 50× expansion. Tried multiple approaches (multiplier expansion, hardcoded large rect). Works in practice during normal use but still has thin dark border around the world's outer edges. Options for later: render grid as CSS background outside the SVG entirely, or constrain pan limits so users can't reach the rect edges.

## Architectural accuracy note (informs Phase G educational content)

Our visual model in Anthropic-paper terms:
- "Orchestrator" = the lead agent that decomposes queries
- "Manager" = a specialized sub-orchestrator (the paper doesn't have this layer explicitly — managers are "specialized subagents that further decompose")
- "Worker" = leaf subagent that does atomic work
- Our pattern = "orchestrator-workers composed hierarchically"

This is more accurate than calling it "the orchestrator-worker pattern" — that name refers to a specific 2-layer pattern in the paper. Ours is the pattern *composed*.

For Phase G educational popups: explain the manager layer as "domain-specific sub-orchestrators that decompose their slice of the problem and dispatch to specialized workers." Be explicit that this is a *composition* of the named pattern.

Future design decisions about how the visualization REPRESENTS agentic behavior should be researched against Anthropic's published patterns before committing.

## Phase G addition — Legend/Key UI (top-right)

A persistent legend in the top-right corner that explains the visual vocabulary without requiring clicks.

**Behavior:**
- Collapsed state: small button/tab with an arrow indicator (▶ or chevron)
- Click the arrow → expands into a panel showing the key
- Does NOT pause motion (unlike click-to-popup behavior on world elements)
- Click again or click an X to collapse
- Stays in top-right corner regardless of pan/zoom on the world (UI overlay, not in SVG)

**Contents (visual key — what each shape/color means):**
- Orchestrator (purple airport icon) → "Lead agent that decomposes tasks"
- Manager (4 colored shapes: cyan circle, orange triangle, green square, pink diamond) → "Specialized sub-orchestrators"
- Worker (small lighter-shade square) → "Leaf agent that executes atomic tasks"
- Plane (outbound colored / inbound purple) → "Task dispatch / result return between orchestrator and managers"
- Car (outbound saturated / inbound light) → "Subtask dispatch / result return between managers and workers"
- Road (thick grey) → "Manager-to-worker dispatch channel"
- Flight path (dashed colored line) → "Orchestrator-to-manager communication channel"

**Visual style:**
- Same dark theme as the world (palette.night950 background, palette.terminal text)
- Monospace font (matches existing labels)
- Subtle border or shadow to separate from world
- Width when expanded: ~280-320px
- Each row: small icon swatch + short label + ~1 sentence explanation

**Implementation notes:**
- Not part of the SVG — positioned as absolute HTML overlay over the TransformWrapper
- Built as a separate component: `src/components/map/Legend.tsx`
- State (open/closed) local to component, no global state needed
- Doesn't subscribe to pause context (motion continues whether legend is open or closed)

## Phase G — Popup content structure (locked decision)

Each popup has TWO tabs:

**Default tab — "Overview"** (for mixed audience, leans accessible)
- Title (the element's name)
- What it is — plain-language description using analogy
- What it does — its role in the system
- A concrete example (e.g., "An orchestrator might break a research question into 3 parallel searches")

**Advanced tab — "Components (Advanced)"** (for engineers / those wanting to build)
- Components — the actual building blocks (e.g., for a manager: model + system prompt + decomposition logic + worker registry + result synthesis prompt)
- Implementation — how to build it (Claude SDK patterns, code structure, API setup)
- Production considerations — caching, retries, error handling, observability, common pitfalls
- Reference — links to relevant Anthropic docs or paper sections

**UI behavior:**
- Tabs at top of popup (Overview | Components (Advanced))
- Default to Overview when opening any popup
- Tab state resets when popup closes — next click starts on Overview again
- Tab styling: subtle underline or color shift on active tab

**Content storage:**
- TypeScript object per element type with both "overview" and "advanced" fields
- Each field is structured (not freeform prose) so the popup layout stays consistent
- Example structure:
```ts
  type ElementContent = {
    title: string;
    overview: {
      whatItIs: string;
      whatItDoes: string;
      example: string;
    };
    advanced: {
      components: string[]; // bullet list
      implementation: string;
      production: string[];
      references?: { label: string; url: string }[];
    };
  };
```

**Writing principle:**
- Default tab: explainable to a smart non-engineer in 30 seconds
- Advanced tab: useful to an engineer who wants to actually build this
- Never repeat content between tabs — each tab earns its own real estate

## Phase G — Layer 1 expanded scope (app chrome)

Split Layer 1 into:

**Layer 1a — Core interaction (build first):**
- Popup UI design
- Pause system (technical keystone)
- Popup shell component
- Click handlers on buildings
- Click handlers on vehicles

**Layer 1b — App chrome (build after core works):**
- TOP BAR (persistent horizontal strip, outside SVG, stays during pan/zoom)
  - Contains: key/legend, search box, sandbox button
  - Design decision pending: full top bar vs floating top-right panel
- KEY/LEGEND — now lives in the top bar (was: floating top-right). Static visual vocabulary. Does NOT pause motion.
- INTRO/WELCOME POPUP — appears on entering /framework, explains the project. Use localStorage to show once (real Next.js app, so persistence works). Dismissible.
- SEARCH BOX — "What component do you want to look for?"
  - Layer 1: UI placeholder only (looks real, no behavior)
  - Behavior TBD (pan-to-element? open popup? filter/dim?) — design in later phase
- SANDBOX BUTTON — placeholder labeled "Builder (coming soon)", sets up v2 feature

**Design session needed before coding Layer 1b:**
- Top bar layout: height, left-to-right contents, visual style
- Confirm top bar vs floating panel for the key
- Search behavior model (separate decision)

## Phase G — Search behavior (refined decision)

Search opens the matching element's popup directly — reuses the existing popup system, not a separate results UI.

- User types an element name (e.g. "orchestrator", "worker", "manager")
- Matching → opens that element's popup (same popup as clicking the element in the world)
- Search-triggered popups DO pause the world (consistency — a popup is a popup regardless of how it's opened)
- No pan-to-element, no highlight, no filter/dim — just open the popup

Implementation: search maps a query string → an element content key → opens popup with that content. Trivial once the popup + content systems exist. Likely fuzzy-match or simple dropdown of matching element types as you type.

This means search is genuinely easy to build once Layer 1a (popup) + Layer 2 (content) exist. Could even slot into Layer 1b as just the input box, with wiring deferred until content exists.

## Phase G — Popup UI design (LOCKED)

- Layout: SIDE PANEL, slides in from the right. World stays visible behind it (not dimmed/covered). ~360-400px wide.
- Tabs: "Overview" | "Components (Advanced)" at top of panel. Defaults to Overview. Tab state RESETS to Overview each time the panel opens (next click starts fresh on Overview).
- Close: three methods — X button (top-right of panel), click-outside (on the world), AND ESC key. Most forgiving.
- Entrance: slide-in from right + fade. Exit: reverse.
- Visual style: dark theme matching world (night950 bg, terminal text, monospace labels). Element's color used as accent (header icon swatch + active-tab underline).
- Opening the panel triggers pause (via PauseContext). Closing resumes.
- Header: small color-swatch icon of the clicked element + element name in monospace.
- Overview tab sections: "What it is", "What it does", "Example"
- Advanced tab sections: "Components", "Implementation", "Production considerations", "References" (optional links)
- Future polish: highlight/ring the clicked element in the world while panel open (deferred to polish step)

## Phase G Layer 2 — Content structure (LOCKED)

### Overview tab (per element) — teaches progressively, follows a path
- What it is (analogy-driven, metaphor)
- What it does (role in the flow, connected narrative)
- Example (concrete, relatable)
Template proven on Orchestrator. ~2.5x original length, flowing not bullet-y.

### Advanced tab (per element) — genuinely technical, additive (NOT overview-with-jargon)
- How it actually works (real mechanism, no metaphor)
- Code (illustrative pseudo-code + "check current SDK" note; rich inline comments showing WHERE: the thinking/reasoning step, where memory lives, model choice, prompt locations)
- Gotchas (named failure modes from Anthropic's docs)
- When to use it (decision criteria)
- Our model (one-line mapping: our term -> Anthropic's official term)
- References (links, no inline citations)

### Model-choice content (per element where relevant)
Anthropic's pattern: Opus as lead/orchestrator, Sonnet as subagents/workers. The "strong model orchestrates, cheaper models execute" decision. Include in Orchestrator, Manager, Worker advanced tabs.

### Code approach: illustrative pseudo-code, clearly labeled, with "check current Claude SDK for exact API" note. Honest, won't go stale.

### SCOPE DECISION: popups are PER-ELEMENT ONLY
- Each panel = what THIS element is + how to build THIS piece. Tight, focused.
- Whole-system content does NOT go in per-element panels.

### Dedicated "How to build this yourself" panel (SEPARATE — build later in Phase G)
- Project file layout / scaffolding (orchestrator.py, subagent.py, prompts/, etc.)
- How pieces connect
- Which models go where (system-wide)
- Tech stack recommendations
- This is where file-layout content lives, NOT repeated per-element.

### Citations: References section at bottom of Advanced only, with links. No inline.
### Transparency: "Our model" note in every element's Advanced tab (our term vs Anthropic's).

### Two grounding sources (everything traces to these):
1. Building Effective Agents — anthropic.com/engineering/building-effective-agents (Dec 2024)
2. How we built our multi-agent research system — anthropic.com/engineering/multi-agent-research-system (June 2025)

## Phase G Layer 2 — TARGET CLARIFIED (the vision)

The site is a learning funnel from "what is this" to "I built one":
- OVERVIEW tab = understanding (anyone, incl. non-technical). Conceptual, metaphor-driven.
- ADVANCED tab = for BUILDERS (incl. newcomers ready to build, NOT just experts). How it works + illustrative code + WHERE TO START building this piece.
- BUILD GUIDE tab (separate top-level tab, alongside world view) = build the WHOLE system: file layout, order of assembly, learning path, which models where.

Advanced is the on-ramp from understanding -> building, not gated expert content.

### Final per-element Advanced structure:
1. How it actually works
2. Code (illustrative pseudo-code, teaching comments)
3. Where to start (NEW — first concrete step to build THIS piece)
4. Gotchas
5. When to use it
6. Our model (mapping note)
7. References

### Build Guide = separate TOP TAB (not a popup). Whole-system learning path + file layout.

## Phase G Layer 2 — VOICE: generic, not Claude-centric (LOCKED)

The site teaches the PATTERN, not a product. Explanations are model-neutral.
- Code: model = "your strongest model" with "# e.g. Claude Opus, or another frontier model" as example — not hardcoded to Claude everywhere.
- "Where to start": generic ("call a strong model with a planning prompt"), tool-agnostic.
- Strong-lead / cheap-worker split = stated as general principle; Anthropic's Opus-lead/Sonnet-worker given as a cited EXAMPLE, not the universal rule.
- Anthropic sources STILL cited in References (honest attribution — that's where the patterns are documented). But prose stays model-neutral.
- Rationale: a learning tool that's secretly a product pitch loses trust. Teaching the real pattern generically = credible educational resource.

## Phase G Layer 2 — "Building with AI assistance" mention (LOCKED)

Acknowledge that people can use AI coding assistants to build these systems. Two placements:

1. PER-ELEMENT (in "Where to start"): light, optional one-liner — "AI coding assistants (e.g. Claude Code or similar) can scaffold this for you, but build the simple version first so you understand what's generated." Tone: matter-of-fact, not pushy, generic/model-neutral.

2. BUILD GUIDE tab: fuller "Building with AI assistance" section — AI helps with scaffolding/boilerplate, but you must understand the architecture (which the site teaches); build order still applies. Optional honest meta-note: this site itself was built with AI assistance (true — built with Claude Code), modeling the "AI helps build, understanding makes it good" message.

Key framing throughout: "use AI to help, but understand it first." Protects educational integrity.

## METAPHOR CORRECTION (LOCKED) — Workers → Tools

Foundation fix after checking against sources. The accurate model:
  Orchestrator (lead agent) -> Managers (subagents, own context windows) -> Tools (search, DB, code-exec, APIs)

- Worker RELABELED to TOOL. A "tool" = a capability a subagent calls (search, database, code execution, external API). This matches Anthropic's "subagents use 3+ tools in parallel" far better than a 3rd agent tier.
- Manager = subagent (Anthropic's term); we keep "Manager" label for friendliness but it now clearly = the subagent tier.
- Car (manager<->tool) now = a subagent making a tool call + getting a result. Motion UNCHANGED: car out = the call, pause = tool executing, car back = the result.
- Plane (orchestrator<->manager) unchanged = task dispatch / condensed result return.

### Scope of change:
CONTENT/LABELS (main work):
- Visual label "WORKERS" -> "TOOLS"
- Worker content -> rewritten as Tool content
- Car content: "subtask/result" -> "tool call / tool result"
- Legend, welcome popup, Build Guide language
CODE (light):
- Decide: rename Worker.tsx -> Tool.tsx, OR keep internal data names (worker/WORKERS) and only change user-facing text. LEANING: keep data-layer names to avoid risky refactor, change only displayed text + content. DECIDE before implementing.
- element-content.ts worker entry -> tool entry
DOES NOT CHANGE: motion system, positions, colors, shapes, counts (3/2/4/2 = "this subagent has N tools"), pause/click/panel.

### Side effects:
- "Our model" caveat gets SMALLER — model is now accurately the multi-agent research system (lead->subagents->tools) composed. Managers still a friendly relabel of "subagents."
- FUTURE POLISH (noted, not now): tools could get distinct icons by type (search=magnifier, db=cylinder, code=brackets). Relabel opens this door.

## WELCOME POPUP (upgraded)
Upgrade the small Layer-1b intro popup to a proper screen-covering WELCOME screen shown on entering /framework before motion: "Welcome to Routes..." + what the project is + how to use it (click anything, etc.). Decide later: full modal vs large card over dimmed/static world.

## TOOLS — per-manager themed (LOCKED)

Each of the 4 managers = a specialized DOMAIN; its tools reflect that domain. Makes the orchestrator-workers "specialization" principle visible — you can read a cluster's purpose from its tools.

Illustrative domain set (refine before writing content):
- Manager A -> RESEARCH: web search, document retrieval, source reader
- Manager B -> DATA/ANALYSIS: database query, code execution, chart generator
- Manager C -> CODE: file read/write, test runner, repo search
- Manager D -> COMMUNICATION/ACTION: email/API, calendar, CRM

Tool COUNT per manager stays 3/2/4/2 (now means "this subagent has N tools"). If a domain needs a specific count of named tools, may revisit counts — flag if mismatch.

Per-manager themed tools means: each manager's panel content is domain-specific; each tool's content names what that tool does. Opens future polish: distinct tool icons per type.

## CODE RELABEL — let Claude Code recommend depth
Worker -> Tool relabel. Let Claude Code read the actual code + THIS TODO and recommend: full rename (Worker.tsx->Tool.tsx + internal names) vs keep-data-names-change-display-text. Decide from its recon.

## IMPORTANT: Claude Code must READ TODO.md at the start of Layer 2 work.
All Phase G Layer 2 content decisions are logged here. Any Layer 2 prompt must instruct Claude Code to read TODO.md first.

## CONFIRMED: Manager domains LOCKED
- Manager A -> RESEARCH
- Manager B -> DATA-ANALYSIS
- Manager C -> CODE
- Manager D -> COMMUNICATION-ACTION
(Map A/B/C/D to these in content. Verify A/B/C/D positions/colors in code during recon so domain assignment matches the actual managers.)

## CONFIRMED: Sequencing = recon -> relabel decision -> content

## Overview tab — TWO additions (LOCKED)

1. "IN THIS WORLD" ANCHOR: every Overview's "What it is" OPENS by naming the visual element ("In this world, the orchestrator is the airport at the center..."). Ties the explanation to the thing the user clicked.

2. "WHAT IT CONNECTS TO" CONNECTOR: every Overview's "What it does" ENDS by pointing the user to the related on-screen motion/elements ("Watch the planes leaving the runway — each is a task heading to a manager..."). Makes panels a guided tour, not a glossary.

Final Overview structure per element:
- What it is: [in-this-world anchor] + concept
- What it does: role + [what-it-connects-to connector]
- Example: concrete instance

Visual anchors per element:
- Orchestrator = the airport (center)
- Manager = the 4 colored buildings (N/S/E/W), by domain
- Tool = the small lighter squares clustered around each manager
- Outbound plane = colored plane leaving the right runway
- Inbound plane = purple plane arriving at left runway
- Outbound car = car leaving a manager toward a tool
- Inbound car = lighter car returning from tool to manager
- Road = thick line between manager and its tools
- Flight path = dashed curved line between airport and a manager

## Connector wording — NO viewport-relative directions (LOCKED)
"What it connects to" connectors must NOT use "to your right / left / above" etc. — the user can pan/zoom, so those break. Reference elements by name/identity instead ("the planes leaving the airport's runway", "the purple planes arriving at the airport", "the cars heading out from this manager"). Always accurate regardless of view.

## Manager content = shared core + domain block (LOCKED)
All 4 managers share the core "what a subagent is" explanation; each adds a domain block (Research/Data-Analysis/Code/Communication-Action).
Storage: one manager template (shared text) + per-domain data (domain name, its tools, its example, optional 1 domain-specific line). Keeps concept consistent, less repetition, easy to maintain.
Shared across all 4: how-it-works, where-to-start, when-to-use, our-model, references, core gotchas.
Per-domain: which tools, the example, domain name in "what it is", domain-flavored tool names in code.

## TOOL COUNTS CHANGED: 3/2/4/2 -> 3/3/4/3 (LOCKED)
Counts now follow domain content, not arbitrary slots. Adding 2 tool buildings (B +1, D +1) = 13 tools total.
Final tool sets per manager:
- A RESEARCH (3): web search, document retrieval, source reader
- B DATA-ANALYSIS (3): database query, code execution, chart generator
- C CODE (4): file read/write, test runner, repository search, linter/type-checker
- D COMM-ACTION (3): email/messaging, calendar, CRM/records
Subtle truth this adds: managers don't all have the same tool count, because real subagents don't.

REQUIRES layout work BEFORE content: new positions + roads (beziers) for the 2 added tools in B (east) and D (west) clusters; re-verify clusters/car-lanes. Relabel (Worker->Tool display-only, Option A) happens in same pass or just before. THEN write content.

## ORCHESTRATOR CONTENT — FINALIZED (ready to wire, review before adding tomorrow)

### Overview
**What it is:** In this world, the orchestrator is the airport at the center — every plane begins or ends its journey here. It represents the lead agent: a single, capable AI model that receives your original request. But here's the key idea: it doesn't try to answer the request by itself. Its whole job is to understand the request deeply enough to break it into smaller, independent pieces of work that specialized managers can handle. It's a coordinator, not a doer.

**What it does:** When a request arrives, the orchestrator first thinks — it analyzes what you're really asking and forms a plan. Then it divides that plan into separate tasks and hands each to the manager best suited for it. While the managers work, it waits; as their results return, it holds them together, and once it has everything, it performs the final step: synthesis — combining the separate results into one coherent answer greater than any single piece. [CONNECTOR, italic] Watch the planes leaving the airport — each one carries a task to one of the four specialized managers around it (Research, Data-Analysis, Code, and Communication). The purple planes arriving back are those managers reporting their results.

**Example:** Imagine you ask, "Research the electric vehicle market and chart the top three players' revenue." A single AI answering alone would have to do everything in one stream of thought. The orchestrator instead splits the work: it sends the market research to the Research manager and the revenue analysis to the Data-Analysis manager — at the same time. When each reports back, it combines their findings into one answer. You get a broader, deeper result than one agent working alone could produce.

### Advanced
**How it actually works:** The orchestrator is a single AI model call running with a planning-oriented prompt. When a query arrives, it doesn't answer — it emits a plan: a set of subtask definitions. Your code reads that plan and, for each subtask, makes a separate AI call (a manager, or "subagent"), each with its own independent context window. These calls run in parallel. As each returns a condensed result, the orchestrator collects them; once all are in, it makes a final call whose job is synthesis. Crucially, the orchestrator's own context holds only the plan and the returned summaries — not the full work each manager did. That separation is what lets the system process more total information than any single context window could hold.

**Code:** [illustrative pseudo-code, 4 steps: PLAN (strongest model, planning prompt, think-before-deciding comment) -> REMEMBER (save plan to memory, context-window note) -> DISPATCH IN PARALLEL (run_manager per task, own context window) -> SYNTHESIZE (strong model, synthesis prompt). "check your AI provider's current SDK" header. Full code block in conversation history.]

**Where to start:** Don't build the parallel version first. Start with the simplest possible loop: one AI call that breaks a request into 2-3 subtasks, then a separate call for each, then a final call that combines the answers — all sequential. Get that working end-to-end, then switch the per-subtask calls to parallel. The parallelism is an optimization; the decompose->delegate->synthesize loop is the real thing to nail first. (AI coding assistants can scaffold this — but build the simple version yourself first so you understand what's generated.)

**Gotchas:** Over-spawning (early Anthropic versions spawned 50 subagents for a 1-subagent question; planning prompt must scale effort to complexity). Vague delegation (loose subtask descriptions -> managers duplicate/drift; each needs objective + output format + boundaries). Losing the plan (long runs fill context window; persist plan to memory early). Cost (many times the tokens of a single call; only worth it when answer quality justifies it).

**When to use it:** Breadth-first tasks that split into independent parallel directions where total info exceeds one context window (research, multi-file code changes, multi-source gathering). Avoid for tightly interdependent tasks (subtask needs previous result) and simple queries one call handles — coordination overhead isn't worth it.

**Our model:** "Orchestrator" maps to Anthropic's lead agent (multi-agent research system) and the central LLM in the orchestrator-workers workflow (Building Effective Agents). Patterns are general, apply to any capable model.

**References:** Building Effective Agents — Anthropic (2024); How we built our multi-agent research system — Anthropic (2025).

### STATUS: text locked, NOT yet wired. Tomorrow: review, then wire into element-content.ts as the end-to-end test (first content rendered in real panel). Then batch the other 8.

## TARGET AUDIENCE (LOCKED — governs all Layer 2 content)

A learning funnel: curious -> understanding -> able to build. Three groups:

1. CURIOUS NON-TECHNICAL (PM, designer, founder, student) — wants to UNDERSTAND, not code today. Served entirely by OVERVIEW tab (metaphor-driven, zero jargon, 30-sec read). May never open Advanced; that's fine.

2. ASPIRING BUILDER / NEWCOMER-TO-AGENTS (PRIMARY audience for Advanced) — technical enough, new to agents, thinks "how do I build this?" Served by ADVANCED as an ON-RAMP: how-it-works -> illustrative code -> where-to-start. A foothold, not gated expert content.

3. PROFICIENT ENGINEER (SECONDARY for Advanced) — skims Overview (known), gets value from Advanced's gotchas + when-to-use. Not who we optimize for.

PRIORITY RULE: Advanced is primarily for Group 2 (aspiring builders), secondarily Group 3. When choosing "deeper for expert" vs "clearer for newcomer-builder," choose CLEARER. Expert still benefits; not optimized for.

NOT for: agent-framework experts wanting production copy-paste code (code is illustrative). Not Claude-specific (model-neutral voice).

This audience def validated the Orchestrator content as written (illustrative code + "start simple" hand-holding = correctly pitched at Group 2).

## VOICE RULES (LOCKED — apply to ALL Layer 2 content)
Make it sound human-written, not AI. Rules:
1. NO em-dashes / no "word — aside — word" dash habit. Restructure instead. (Keep legitimate compound-term hyphens like "breadth-first" unless told otherwise.)
2. NO sentences starting with "But."
3. NO ask-then-deny structure ("it doesn't X, it does Y" / "when a query arrives, it doesn't answer, it emits..."). State directly and positively.
4. Do NOT use "spawned" / "spawn." Use create/start/run.
5. NO "Gotchas." Use "Common pitfalls" (academic). [picked: Common pitfalls]
6. NO "doer" / "coordinator not a doer" framing.
General: sound like the author wrote it, plain confident prose, no AI tells.

## ============================================
## ORCHESTRATOR CONTENT — FINAL LOCKED (v3, author-voiced)
## This is also the VOICE + FLOW TEMPLATE for all 8 remaining elements.
## ============================================

### OVERVIEW

**What it is**
In this world, the orchestrator is the airport at the center, where every plane (Task Dispatch) begins or ends its journey. It represents the lead agent: a single, capable AI model that receives your original request. The orchestrator never does the detailed work itself. Its job is to understand the request deeply enough to break it into smaller, independent pieces that specialized managers can handle. It coordinates the whole effort from the center.

**What it does**
When a request arrives, the orchestrator analyzes what you are really asking and forms a plan. It divides that plan into separate tasks and hands each one to the manager best suited for it. The managers work while the orchestrator waits, and as their results come back, it holds them together. Once it has everything, it performs the final step: synthesis, combining the separate results into one coherent answer greater than any single piece.
[CONNECTOR, italic] Watch the planes leaving the airport. Each one carries a task to one of the four specialized managers around it: Research, Data-Analysis, Code, and Communication. The purple planes arriving back are the specific managers reporting their results.

**Example**
Imagine you ask, "Research the electric vehicle market and chart the top three companies by revenue." A single AI answering alone would have to work through everything in one stream of thought. The orchestrator splits the work instead, sending the market research to the Research manager and the revenue analysis to the Data-Analysis manager at the same time. When each one reports back, the orchestrator combines their findings into a single answer. You get a broader, deeper, and much faster result than one agent working alone could produce.

### ADVANCED

**How it actually works**
The orchestrator is a single AI model call running with a planning prompt. Its output is a plan made of subtask definitions. Your code reads that plan and, for each subtask, makes a separate AI call (a manager, or "subagent"), and each call runs in its own independent context window. The calls run in parallel. As each one returns a condensed result, the orchestrator collects it, and once all the results are in, it makes a final call to handle synthesis. The orchestrator's own context holds only the plan and the returned summaries, never the full work each manager did. That separation is what lets the system process far more total information than a single context window could ever hold.

**Code** [render as monospace preformatted block]
(4-step illustrative pseudo-code: PLAN / REMEMBER / DISPATCH IN PARALLEL / SYNTHESIZE, with "check your AI provider's current SDK" header and inline teaching comments. Full block in conversation + prior TODO entry.)

**Where to start**
Build the simple version before the parallel one. Start with a single loop: one AI call that breaks a request into two or three subtasks, then a separate call for each subtask, and finally a call that combines the answers, all running one after another. Once that sequential version works from end to end, switch the per-subtask calls to run in parallel. Parallelism is an optimization you add later. The core pattern to get right first is decompose, delegate, and synthesize. AI coding assistants can scaffold this loop for you, but there's real value in building the simple version yourself first. It gives you a much clearer sense of what they generate and why.

**Common traps to watch for** [render as flowing prose, 2 paragraphs, NO bullets]
The most frequent mistake is over-delegating. Early versions of Anthropic's research system spun up fifty subagents for a question that needed one. Your planning prompt has to teach the orchestrator to match its effort to the scale of the request, or costs will climb faster than you'd expect. Closely related is vague delegation. Loose descriptions like "research competitors" cause subagents to duplicate work or wander off course. Every task needs a clear objective, a defined output format, and explicit boundaries.
Two other traps are easy to miss until they hurt you. On long runs, the context window fills up and earlier content gets dropped, so save the plan to memory early or the orchestrator will lose track of what it set out to do. Since this architecture can burn through a lot of tokens on a single request, it's worth asking whether the quality of the output genuinely justifies the cost.

**When to use it**
The orchestrator fits work that naturally splits into independent directions: research, multi-file code changes, aggregating from many sources, especially when the total information is more than a single context window can hold. It's the wrong choice for tightly coupled tasks where each step depends on the previous one, or for simple questions a single call handles just fine. In those cases, the coordination adds overhead without adding much of anything.

**Our model**
What we call the "orchestrator" maps to what Anthropic calls the lead agent in their multi-agent research system, and the central model in the orchestrator-workers workflow from Building Effective Agents. The pattern itself is general and works with any capable model.

**References**
Building Effective Agents, Anthropic (2024) -> https://www.anthropic.com/engineering/building-effective-agents
How we built our multi-agent research system, Anthropic (2025) -> https://www.anthropic.com/engineering/multi-agent-research-system

## ============================================
## WRITING FLOW GUIDE (derived from Orchestrator — apply to all 8 remaining)
## ============================================
VOICE: author-written, not AI. Confident, plain, a little warm. (All earlier voice rules still apply: no em-dashes, no "But" openers, no ask-then-deny, no "spawned"/"doer"/"gotchas".)

STRUCTURE per element:
- Overview > What it is: OPEN with "In this world, [element] is the [visual]..." anchor, name the element's panel-title term in parens once (e.g. "(Task Dispatch)"), then the concept in plain terms.
- Overview > What it does: the role as connected narrative; END with an italic CONNECTOR pointing at on-screen motion/elements (no viewport-relative directions).
- Overview > Example: one concrete, relatable scenario that matches what's visible on screen; close with the payoff ("broader, deeper, much faster" style).
- Advanced > How it actually works: real mechanism, plain technical prose, light jargon defined in passing.
- Advanced > Code: illustrative pseudo-code, "check your AI provider's current SDK" header, model-neutral ("your strongest model" w/ Claude as e.g.), numbered steps with teaching comments.
- Advanced > Where to start: simplest-first build path; end with the AI-assistant note ("scaffold... but build the simple version yourself first").
- Advanced > Common traps to watch for: FLOWING PROSE (2 short paras), not bullets. Lead with "The most frequent mistake is...", weave 3-4 traps into prose.
- Advanced > When to use it: where it fits + where it's the wrong choice.
- Advanced > Our model: map our term to Anthropic's; note the pattern is general/model-neutral.
- Advanced > References: linked sources.

FLOW HABITS to mirror: short declarative openers; occasional "you/your" address to the builder; concrete numbers from sources (e.g. "fifty subagents"); end sections on a useful takeaway not a hedge.

## ============================================
## PHASE G LAYER 2 — STATUS (resume here tomorrow)
## ============================================

DONE:
- PanelContent type reshaped to final structure (overview: whatItIs/whatItDoes/connector/example; advanced: howItWorks/code/whereToStart/commonTraps/whenToUse/ourModel/references[]).
- InfoPanel renders all sections: italic connector, code block, commonTraps as prose, references as new-tab links.
- ORCHESTRATOR fully wired with final v3 content + code block. END-TO-END TEST PASSED.
- Panel widened 380 -> 480px.
- Syntax highlighter (src/components/map/highlightCode.tsx) — VS Code Dark+ palette, comment #6A9955, comment-first tokenizing. Reused by all 7 element code blocks. Colors in palette.ts syntax group.
- Code font 11px. (Known/accepted: longest 1-2 lines still scroll horizontally — fine, left as-is.)
- 6 other ElementKinds remapped to new shape as PLACEHOLDERS (still type-check, render distinct).

TODO NEXT — write real content for the remaining 6 ElementKinds, IN THIS ORDER:
1. MANAGER (most involved: shared core + 4 domain blocks A=Research/B=Data-Analysis/C=Code/D=Comm-Action)
2. TOOL (capability the manager calls; comment-heavy code; remember NO '#' inside string literals — highlighter limitation)
3. PLANE-OUTBOUND (Task Dispatch: orchestrator->manager)
4. PLANE-INBOUND (Result Return: manager->orchestrator, purple)
5. CAR-OUTBOUND (Tool Call: manager->tool)
6. CAR-INBOUND (Tool Result: tool->manager)

STYLE — every element MUST match the Orchestrator's voice + flow (see "WRITING FLOW GUIDE" + "ORCHESTRATOR CONTENT FINAL LOCKED v3" entries above). Recap:
- Voice rules: no em-dashes, no "But" openers, no ask-then-deny, no "spawned"/"doer"/"gotchas". Author-voiced, plain, confident, "you/your" to the builder, concrete source numbers, sections end on a useful takeaway.
- Overview: "In this world, [element] is the [visual] (PanelTitleTerm)..." anchor -> concept -> italic CONNECTOR pointing at on-screen motion (no viewport-relative directions) -> Example matching what's visible.
- Advanced: how-it-works -> code (illustrative pseudo-code, "check your AI provider's current SDK", model-neutral "your strongest model" w/ Claude as e.g., numbered steps + teaching comments, NO '#' in strings) -> where-to-start (simple-first, end on AI-assistant note) -> "Common traps to watch for" (FLOWING PROSE 2 paras, lead "The most frequent mistake is...") -> when-to-use -> our-model (map to Anthropic term, note pattern is general) -> references (linked).
- Model-neutral throughout. Anthropic cited in References as source of the patterns, not as the product being taught.

WORKFLOW for each: draft in chat -> user edits to their voice -> lock to TODO -> wire into BODY.<kind> in element-content.ts -> verify in panel. (Manager is one shared entry, not 4.)
