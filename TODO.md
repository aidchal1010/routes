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
