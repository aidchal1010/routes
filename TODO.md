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
