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
