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

## ============================================
## MANAGER CONTENT — FINAL LOCKED
## Shared core (identical all 4) + Specific Domain block (swaps per manager)
## Structure: Overview (shared, NO example) | Specific Domain (swaps) | Advanced (shared)
## ============================================

### OVERVIEW (shared — identical for all 4 managers)

**What it is**
In this world, the managers are the four colored buildings around the airport, one in each direction. Each one represents a specialized subagent: an AI model that the orchestrator hands a whole slice of the problem to. A manager works the same way the orchestrator does, just at a smaller scale. It takes the task it was given, breaks it into concrete steps, and reaches for the tools it needs to carry them out. The difference is focus. The orchestrator sees the entire request, while a manager sees only its piece and goes deep on it.

**What it does**
When a task arrives from the orchestrator, the manager reads it and decides which of its tools to use. It sends those tools out to do the concrete work, waits for them to report back, and gathers the results. Once it has what it needs, it does its own small synthesis, combining the tool results into a single clean answer, and sends that answer back to the orchestrator. A manager never passes raw tool output straight up the chain. Its job is to do the work of its domain and return something digested and useful.

[CONNECTOR, italic] Watch the cars driving out from a manager to the smaller buildings around it. Each car is the manager calling one of its tools, and each returning car is a result coming back. When the manager has everything it needs, it sends a plane back to the airport carrying its finished answer.

### SPECIFIC DOMAIN (swaps by manager id — new section between Overview and Advanced; carries the per-domain example)

-- A · RESEARCH --
Domain: The Research manager gathers and makes sense of information. It is the one you send out into the world to find things: facts, sources, context, anything the system does not already know. Its work is mostly about breadth, casting a wide net and then narrowing down to what actually matters.
Its tools: Web search, document retrieval, and a source reader. Search finds candidate sources, retrieval pulls the promising ones in full, and the reader digests them into usable notes.
When you route work here: Send a task to the Research manager when the answer lives outside the system and has to be found before anything else can happen. Questions that start with "find out," "look into," or "what is the current state of" belong here.
Example: Given the task "find the top three electric vehicle makers by sales," the Research manager runs several searches at once, pulls in the most credible sources, reads through them, and returns a short ranked list with the figures that back it up. The orchestrator never sees the dozens of pages it skimmed, only the clean findings.

-- B · DATA-ANALYSIS --
Domain: The Data-Analysis manager works with structured data and numbers. Where Research finds information, this manager computes on it: querying, calculating, comparing, and turning raw figures into something a person can actually read.
Its tools: A database query tool, a code execution environment, and a chart generator. It pulls the data, runs analysis code over it, and renders the result into a visual when that makes the answer clearer.
When you route work here: Send a task to the Data-Analysis manager when the work involves real numbers that need to be fetched, computed, or compared. Anything that sounds like "calculate," "compare the figures," or "show the trend" belongs here.
Example: Given the task "compare these three companies by revenue growth," the Data-Analysis manager queries a database for the raw figures, runs code to compute the growth rates, generates a chart of the comparison, and returns the finished analysis. It hands back the conclusion and the chart, not the thousands of rows it started with.

-- C · CODE --
Domain: The Code manager reads and changes software. It is the one that touches a real codebase: understanding what is there, making edits, and checking that its changes actually work before reporting back.
Its tools: File read and write, a test runner, repository search, and a linter or type checker. It finds the relevant files, edits them, runs the tests, and checks its work for errors, often looping through these until the change holds.
When you route work here: Send a task to the Code manager when the work means reading or modifying an actual codebase. Tasks like "fix the failing test," "add this feature," or "find where this function is used" belong here.
Example: Given the task "fix the failing login test," the Code manager searches the repository for the relevant files, reads them, makes an edit, runs the test suite, and checks the result. If the test still fails, it tries again with its tools until it passes, then reports back whether the fix worked.

-- D · COMMUNICATION-ACTION --
Domain: The Communication-Action manager interacts with the outside world on your behalf. The other managers find, compute, and build. This one acts: it sends, schedules, and updates real systems, the steps that actually change something rather than just producing information.
Its tools: Email and messaging, a calendar, and a records system such as a CRM. It can reach out, find or book a time, and update the system of record to reflect what happened.
When you route work here: Send a task to the Communication-Action manager when the work ends in a real action rather than an answer. Anything phrased as "send," "schedule," "notify," or "update the record" belongs here.
Example: Given the task "schedule a follow-up with the client," the Communication-Action manager checks the calendar for an open slot, drafts and sends the invitation, updates the client's record to log the follow-up, and returns confirmation that it is done. The result is not a report, it is a change in the real world.

### ADVANCED (shared — identical for all 4)

**How it actually works**
A manager is a separate AI model call with its own independent context window, running a prompt scoped to its domain. It receives a task description from the orchestrator: an objective, an expected output format, and the boundaries of what it should and should not do. From there it operates like a small orchestrator of its own. It decides which tools to call, often calls several at once, reads what they return, and may call more before it is finished. When the work is done, it condenses everything into a summary for the orchestrator, the digested result rather than the raw tool output. That separate context window is the whole point. A manager can work through a large volume of tool results without ever crowding the orchestrator's context.

**Code** [render monospace, highlighted]
(run_manager pseudo-code: capable cost-efficient model, MANAGER_PROMPT_FOR_DOMAIN, DOMAIN_TOOLS, task.description; comment that model chooses tools, loop runs them, returns summary. Full block in conversation. NO '#' inside strings.)

**Where to start**
Build one manager before you build four. Pick a single domain, write a focused prompt for it, give it one or two tools, and get the basic loop working on its own: receive a task, call a tool, return a summary. Do this before any orchestrator exists above it. A manager is really just a scoped agent with a small set of tools, and once one of them works end to end, the orchestrator is simply the thing that calls several of them at once. AI coding assistants are good at wiring up the tool-calling loop, but get one tool working by hand first so the call-and-result cycle is clear to you.

**Common traps to watch for** [prose, 2 paras, no bullets]
The most common mistake is letting a manager return everything its tools produced. When a manager passes raw output straight up to the orchestrator, it floods the orchestrator's context and erases the benefit of giving the manager its own context window in the first place. A manager has to summarize before it reports back. The second trap is a fuzzy task description. A manager given a vague assignment will wander outside its lane, so the task it receives needs clear boundaries about what belongs to it and what does not.
The other trap is tool sprawl. It is tempting to give a capable manager a large pile of tools, but more tools make its choices harder and its mistakes more frequent. A focused manager with a few well-chosen, domain-relevant tools is more reliable than one holding everything. Keep each manager's toolset tight.

**When to use it**
You add a layer of managers when a single agent can no longer hold all the work in one context window, or when the problem splits into clear domains that each benefit from focused handling. If your task is small enough for one agent with a few tools, you do not need this layer at all. Reach for it only when the size of the work or the separation of domains makes the split worth the coordination it costs.

**Our model**
What we call a "manager" is what Anthropic calls a subagent in their multi-agent research system. We use "manager" because it captures the role well: it manages a domain and the tools beneath it. Giving our managers their own tools is how we show the orchestrator-workers pattern composed, a subagent that is itself a small orchestrator over its own tools. The underlying idea is general and works with any capable model.

**References**
Building Effective Agents, Anthropic (2024) -> https://www.anthropic.com/engineering/building-effective-agents
How we built our multi-agent research system, Anthropic (2025) -> https://www.anthropic.com/engineering/multi-agent-research-system

### RENDERING NOTES for wiring:
- Manager Overview has NO example field (shared, example moved to Specific Domain).
- NEW "Specific Domain" section, renders between Overview and Advanced. Decide at wire time: its own tab, or final section of Overview tab. LEAN: section at end of Overview tab (keeps 2-tab layout consistent w/ other elements).
- Manager entry stores: shared overview + shared advanced + array of 4 domain blocks keyed by managerId (a/b/c/d). Each domain block = { domain, tools, whenToRoute, example }.
- Panel picks domain block by clicked manager's id. All 4 managers = ONE content entry.

## ============================================
## TOOL CONTENT — FINAL LOCKED
## ============================================
[OVERVIEW]
What it is: In this world, the tools are the small buildings clustered around each manager, the lighter-colored ones at the end of every road. A tool is a single, concrete capability that a manager can use: a web search, a database query, a code run, an email send. Tools are the simplest pieces in the system and the only ones that touch the world outside it. A tool does not think, plan, or make decisions. It does one well-defined job and hands back the result, which is exactly what makes it dependable.
What it does: When a manager needs something real, a fact it does not have, a calculation it cannot do in its head, a file, an action in another system, it calls one of its tools. The tool takes the specific request, does its single job, and returns the result. A tool has no memory of the larger task and never talks to other tools. It answers the one call it was given and nothing more. That narrowness is the point: because a tool does exactly one thing, you can trust what it returns and reason about it easily.
Connector: Watch the cars arriving at a tool from its manager. Each one is the manager asking the tool to do its job, and each car heading back is the tool returning a result. The tool itself never moves. It waits to be called, does its work, and answers.
[ADVANCED]
How it works: A tool is a function the AI model is allowed to call. You define it with a name, a description of what it does, and the shape of the input it expects. During a run, when the model decides it needs that capability, it produces a structured request to call the tool with specific arguments. Your code receives that request, runs the real function behind it, hitting a search API, querying a database, executing code, and returns the result to the model. The model never runs anything itself. It asks for the call, your code does the work, and the result comes back into the model's context. How well a tool works depends heavily on how clearly you describe it, since the model decides when and how to use it based entirely on that description.
Code: [search_tool dict + execute_tool fn block — pasted at wire time, NO # in strings]
Where to start: Tools are the easiest part to build first, and a good place to begin the whole system. Pick one real capability, a web search, a calculator, a database lookup, and define it with a precise name and a clear description. Wire it to a single AI call and watch the model decide when to reach for it. Get one tool working in a plain back-and-forth before you build any managers or an orchestrator above it. Everything higher in the system is just the coordination of tool calls like this one. AI coding assistants are especially helpful here, but write one tool definition by hand first so the call-and-result shape is clear to you.
Common traps: The most frequent mistake is a weak description. The model only knows what a tool does from how you describe it, so a vague description leads to a misused tool. Write the description the way you would document a function for a new teammate, plainly and completely. Anthropic found they spent more time refining their tool descriptions than tuning the main prompt, which is a good sign of where the effort actually pays off. A close second is an ambiguous input format. If a tool can be called in two slightly different ways, the model will eventually pick the wrong one, so make the input hard to misread.
The last trap is asking a single tool to do too much. A tool that tries to handle several jobs is harder for the model to use correctly than a few focused tools that each do one thing. When a tool starts growing extra responsibilities, that is usually a sign it should be split. Keep each tool narrow and predictable.
When to use it: You reach for a tool whenever an agent has to touch something real: get live information, run an exact calculation, read or change a file, or take an action in another system. If a task can be answered from the model's own knowledge, it may need no tools at all. The moment it needs something current, exact, or external, that is the moment a tool earns its place.
Our model: What we show as "tools" are exactly what the source material calls tools: the concrete capabilities an agent calls to get something done. In some diagrams these leaf capabilities are drawn as another layer of small agents, but we follow the way real systems are built and treat them as tools, defined functions the model invokes rather than independent reasoners. The idea is general and works with any capable model.
References: Building Effective Agents (2024); How we built our multi-agent research system (2025).

## VEHICLES — see chat drafts (Task Dispatch / Result Return / Tool Call / Tool Result). Where-to-start = pointers to building panels. No code field. Full text in conversation.

## ============================================
## VEHICLE CONTENT — FINAL LOCKED (4 entries)
## Lighter Advanced: how it works / common traps / when to use / our model / references
## NO where-to-start, NO code. Overview is full (what it is / what it does / connector).
## ============================================

### PLANE-OUTBOUND (Task Dispatch) — orchestrator to manager
[OVERVIEW]
What it is: In this world, the outbound planes are the colored aircraft leaving the airport for a manager. Each one represents a Task Dispatch: the orchestrator handing a single, self-contained piece of work to one of its managers. The plane is not a thing that sits anywhere. It is the moment of delegation itself, one task leaving the center and traveling to the manager chosen to handle it.
What it does: When the orchestrator finishes planning, it sends one task to each manager it has chosen, and each of those hand-offs is an outbound plane. The plane carries everything the manager needs to begin: the objective, the expected format, and the boundaries of the job. Every task that goes out is answered by a result that comes back, so each outbound plane has a matching return plane later. The dispatch is one half of a round trip.
Connector: Watch a plane leave the airport and fly to a manager. That single flight is one task being handed off. Its answer will return later as a purple plane coming back to the airport.
[ADVANCED]
How it works: A task dispatch is a single call from the orchestrator to a manager, made in its own context window. The orchestrator usually sends several at once rather than one at a time, firing the whole batch of tasks in parallel so the managers can work simultaneously. Each dispatch carries a clear task description, and that description is the entire basis for the manager's work, so its quality decides how well the manager performs.
Common traps: The most frequent mistake is sending a vague task. A dispatch that says only "research competitors" gives the manager too little to work with, and the manager either guesses at the boundaries or wanders off course. A good dispatch names the objective, the format of the answer, and what is in and out of scope. The second trap is sending too many dispatches at once. Parallel hand-offs are powerful, though each one costs a full manager run, so dispatching more tasks than the request actually needs is a direct waste of tokens and time.
When to use it: A task dispatch is the right move whenever the orchestrator has a piece of work that a specialized manager can handle on its own. If a request splits into independent parts, each part becomes a dispatch. If the work cannot be separated, or one small answer would do, there is nothing to dispatch and a single call is enough.
Our model: A task dispatch maps to the lead agent calling a subagent in Anthropic's multi-agent research system. The pattern is general: a coordinating model handing a scoped task to a worker model, and it applies to any capable model.
References: Building Effective Agents (2024); How we built our multi-agent research system (2025).

### PLANE-INBOUND (Result Return) — manager to orchestrator, purple
[OVERVIEW]
What it is: In this world, the inbound planes are the purple aircraft flying back to the airport from a manager. Each one represents a Result Return: a manager sending its finished work back to the orchestrator. Where the outbound plane carried a task out, the return plane carries the answer home. It is the second half of every dispatch, the response to a request that went out earlier.
What it does: When a manager finishes its work, it condenses everything it did into a single clean summary and sends that back to the orchestrator. That return trip is the inbound plane. The summary is deliberately compact. The manager does not send back everything its tools produced, only the digested result the orchestrator actually needs. This compression is quiet but important: it is what keeps the orchestrator's context clear enough to combine many managers' answers without overflowing.
Connector: Watch a purple plane arrive at the airport. That is one manager reporting its finished work. Somewhere earlier, a colored plane left carrying the task this result answers.
[ADVANCED]
How it works: A result return is the value a manager hands back when its call completes. The important detail is what it contains: a condensed summary, not the manager's full working history. A manager may have made dozens of tool calls and read a great deal of material, and all of that stays in the manager's own context window. What returns to the orchestrator is the distilled conclusion. That selective return is the mechanism that lets the system process far more total information than the orchestrator's context could hold on its own.
Common traps: The most frequent mistake is returning too much. When a manager sends back its full output instead of a summary, it floods the orchestrator's context and undoes the benefit of the separate window. A return should be the conclusion, not the transcript. The second trap is returning too little. A summary so terse that it drops key facts forces the orchestrator to dispatch again to recover them, which is slower than returning the right detail the first time. The skill is in returning exactly what the orchestrator needs and nothing more.
When to use it: Every dispatched task ends in a result return, so it is less a choice than a guarantee: any time a manager is given work, its answer comes back this way. The design decision is not whether to return, but how much to include in what comes back.
Our model: A result return maps to a subagent returning its findings to the lead agent in Anthropic's multi-agent research system. The principle of returning a condensed result rather than raw work is general and applies to any capable model.
References: Building Effective Agents (2024); How we built our multi-agent research system (2025).

### CAR-OUTBOUND (Tool Call) — manager to tool
[OVERVIEW]
What it is: In this world, the outbound cars are the small vehicles driving from a manager to one of its tools. Each one represents a Tool Call: a manager asking a single tool to do its specific job. If the plane is how the orchestrator delegates to a manager, the car is how a manager reaches for a capability. It is a request traveling a shorter distance, from a manager to the tool right beside it.
What it does: When a manager decides it needs something concrete, a search, a calculation, a file, it calls the right tool, and that call is the outbound car. The car carries the specific input the tool needs to do its one job. Just like a dispatch, every tool call is answered: each outbound car has a matching car that brings the result back. A manager often sends several at once when it needs more than one tool.
Connector: Watch a car drive from a manager out to one of the smaller buildings. That trip is the manager calling a tool. The car that returns is the tool's answer coming back.
[ADVANCED]
How it works: A tool call is a structured request the manager's model produces when it decides it needs a tool. The request names the tool and provides the specific arguments to run it with. Your code receives that request, runs the real function behind the tool, and the result returns to the manager. A manager can issue several tool calls at once when its tasks are independent, the same parallel pattern the orchestrator uses, one level down.
Common traps: The most frequent mistake is an unclear tool definition, which leads the model to call the tool with the wrong arguments or at the wrong time. The call is only as good as the tool's description and input format. The second trap is calling tools in sequence when they could run at once. If a manager needs three independent lookups, calling them one after another wastes time that a parallel batch would save. Look for independent calls that can be fired together.
When to use it: A tool call is the right move whenever the manager needs something it cannot produce from its own reasoning: live information, an exact computation, a real file, an external action. If the manager can answer from what it already has, no call is needed. The moment it needs the outside world, it makes a call.
Our model: A tool call maps directly to tool use in any agent framework: the model emitting a structured request to run a defined function. This is a standard, general capability and works with any capable model that supports tools.
References: Building Effective Agents (2024); How we built our multi-agent research system (2025).

### CAR-INBOUND (Tool Result) — tool to manager
[OVERVIEW]
What it is: In this world, the inbound cars are the small vehicles returning from a tool back to a manager. Each one represents a Tool Result: a tool handing back the answer to the call it was given. It is the response half of every tool call, the outcome of the one job the tool was asked to do, traveling back to the manager that asked.
What it does: When a tool finishes its job, it returns its result, and that return trip is the inbound car. The result is whatever the tool produced: the search hits, the query rows, the output of the code it ran. The manager takes that result, along with the results of any other tools it called, and uses them to do its work. Every tool call ends in one of these returns, which is why you always see cars traveling in both directions along a road.
Connector: Watch a car come back from a tool to its manager. That is a result being delivered. It answers a call that drove out moments earlier.
[ADVANCED]
How it works: A tool result is the value your code returns to the model after running a tool. The model receives it back into its context and uses it to decide what to do next, whether that is calling another tool or finishing its task. A tool returns raw, factual output: the data it was asked to fetch or produce. It does not interpret or summarize. Making sense of the result is the manager's job, not the tool's, which keeps the tool simple and predictable.
Common traps: The most frequent mistake is returning messy or oversized output. If a tool hands back a huge raw blob, it fills the manager's context and makes the model's job harder. Return what is useful, in a form the model can read. The second trap is hiding failures. When a tool errors, it should return a clear, readable error rather than nothing or a cryptic code, so the model can recognize what happened and react instead of guessing.
When to use it: A tool result happens automatically whenever a tool is called, so like the result return, it is a guarantee rather than a choice. The decision that matters is the shape of what comes back: clean and usable, or raw and hard to work with.
Our model: A tool result maps to the tool-use response in any agent framework: the output of a function call returning to the model. It is a standard, general mechanism and works with any capable model that supports tools.
References: Building Effective Agents (2024); How we built our multi-agent research system (2025).

## ============================================
## PHASE G LAYER 2 — COMPLETE (all 7 elements content-complete)
## ============================================
DONE: orchestrator, manager (4 domains + 3rd tab swap + code), tool (+code), 4 vehicles (lighter Advanced, no code/where-to-start). All wired, highlighted, committed.
Panel: 480px, syntax highlighter (VS Code palette), conditional Code/Where-to-start sections, manager Domain-Specific tab with accent-tinted active tab + index guard.

## REMAINING WORK (Phase G Layer 1b chrome + Phase H polish)
Layer 1b chrome (not yet built):
- WELCOME popup: screen-covering intro on entering /framework ("Welcome to Routes...", what the project is, how to use). Upgrade from small popup.
- LEGEND/key: top-right expandable, does NOT pause.
- SEARCH: opens matching element's panel (reuses panel system).
- Top bar / nav chrome.
- BUILD GUIDE: separate TOP TAB (whole-system: file layout, build order, "building with AI assistance" section, learning path). The per-element "where to start" pieces feed into this.
Phase H polish:
- Grid edges still faintly visible (deferred).
- Panel resizable (deferred from the width bump).
- Service vehicles, other visual polish.
- Deploy to Vercel.
- LinkedIn post.

## REMAINING BUILD ORDER (confirmed)
1. LEGEND/KEY — top-right expandable reference. Does NOT pause the world. Shows what each element (orchestrator/manager/tool/plane/car) is at a glance.
2. WELCOME POPUP — screen-covering intro on entering /framework.
3. BUILD GUIDE — separate top tab, whole-system "how to build this yourself."
4. SANDBOX — (new) most ambitious; define scope when we get there.

## LEGEND/KEY — DESIGN LOCKED
- Always-visible static card. NO expand/collapse, no button.
- Fixed to VIEWPORT top-right (moves with screen, NOT the world; survives pan/zoom unchanged).
- Content: element swatches+names+motion meaning. Buildings: Orchestrator (purple), Manager (4 domain colors or generic), Tool. Vehicles: Plane = Task Dispatch / Result Return; Car = Tool Call / Tool Result.
- Style matches InfoPanel (dark card, same fonts/colors).
- Info panel covers it when open (no move/hide needed). Does NOT pause the world.

## LEGEND/KEY — DESIGN UPDATED (interactive)
Supersedes the static-only version. Now an interactive table of contents:
- Always-visible card, top-right, FIXED TO VIEWPORT (moves with screen, survives pan/zoom). Chrome layer, outside pan/zoom transform.
- Items are CLICKABLE: clicking opens that element's info panel (same panel/content as clicking the real element) AND pauses the world (same as a real element click). (Replaces earlier "does not pause" rule.)
- Manager row EXPANDS on click to reveal 4 domain sub-rows (Research/Data-Analysis/Code/Comm-Action); each sub-row opens that specific manager's panel (with its domain tab).
- Swatches use REAL element colors (orchestrator purple, each manager its domain color, tool lighter, plane/car colors) so key mirrors world.
- Vehicles: Plane (Task Dispatch / Result Return), Car (Tool Call / Tool Result). Clicking opens the relevant vehicle panel.
- Style matches InfoPanel. Info panel covers legend when open (z-index: panel above).
- Reuses existing panel-open + pause systems (don't rebuild them; the legend just triggers the same showElement path Map.tsx uses).
