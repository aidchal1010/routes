# Routes — Design Specification

## What this project is

Routes is an educational website that explains **how agentic systems are built** through an interactive top-down world. The metaphor is a transit network rendered in the visual language of Mini Motorways: orchestrators are airports, managers are colorful destination buildings, workers are smaller building shapes around them, and the roads between managers and workers carry cars (tasks). Planes fly through the air between the airport and managers. Users land on a Mini Motorways-style map, pan and zoom around it, click on any building to learn what it represents, and click on patterns to see flows highlighted across the world.

The site is grounded in Anthropic's "Building Effective Agents" framework (Schluntz & Zhang, 2024) and a builder's methodology for agent construction (see `agent_building_methodology.md`).

**Target audience:** both technical (developers building agents) and non-technical (PMs, founders, leaders trying to understand the space).

**The hook:** every other agent-pattern explainer is flat docs or abstract diagrams. This one is *a world you explore.* The Mini Motorways game aesthetic makes it instantly inviting; the technical overlays (blueprint grid, monospace labels, pattern highlighting) make it clearly an educational tool rather than a game.

---

## v1 scope (what we're building)

- Intro screen with "Let's explore how workflows are built" button (already built)
- Tab 1: The Framework — the interactive top-down SVG world
- Pan + zoom navigation (no rotation — top-down only)
- Component-mode exploration: click buildings to open a side panel explaining what they are
- Pattern-mode exploration: click a pattern to see its route highlighted across the world
- 6 canonical patterns visualized
- Dark mode aesthetic with vibrant accents (Mini Motorways night mode + technical overlay)
- Deployed on Vercel, public GitHub repo

## v2 / deferred

- Tab 2: The Builder — drag-and-drop sandbox where users sketch their own workflow
- Phase-mode exploration (walk through the 7 phases of building an agent)
- Evals as an 8th phase
- Animation play/pause controls

---

## The core metaphor

| Concept | Visual element | Reasoning |
|---|---|---|
| **Orchestrator** | Airport — a large rounded square building with a runway extending off it | The central landmark. Bigger than any other building. Distinctive purple. The *only* node that coordinates between managers. |
| **Manager** | A Mini Motorways-style "destination" building — colored rounded square with a distinct icon | Each manager has its own color and a small geometric shape on top (circle, triangle, square, diamond) so they're identifiable at a glance. Receives tasks from the airport and dispatches to workers. **Managers do not communicate with each other.** |
| **Worker** | A small "house" building — minimal rounded shape, same color as its manager | Clustered around its manager. Stateless — a car arrives, work happens, a car leaves. |
| **Plane** | Top-down plane silhouette — small angular shape, color matches destination manager | Flies in a straight line from airport to manager. Color identifies which manager it's heading to. |
| **Car** | Tiny rounded rectangle with a directional headlight glow | Drives along roads between manager and workers. Each car carries one task. |
| **Road** | Grey curved ribbon between manager and worker | Visible infrastructure connecting a manager to its workers. Curved, not straight. |
| **Tools / Service vehicles** | Differently-shaped small vehicle (truck silhouette) on the roads | Support work, visually distinct from cars. |
| **Memory** | A warehouse-style building (square with hatched lines on it) | Where state persists. Distinct from active destination buildings. |
| **Guardrails** | Small checkpoint icons on the roads | Inspection points data passes through. |
| **Logging / Observability** | A control tower icon next to the airport | Watches over everything, records what happens. |

---

## Architectural rules (visible in the layout)

These rules govern how the world is structured. They are not decoration — they reflect how production agentic systems should actually be built.

1. **One orchestrator.** A single airport sits at the center of the world. It is the only node that sees the full picture and the only node that synthesizes final output.

2. **Four managers, fully independent.** The default world has **4 managers** arranged around the airport. Each owns a distinct domain, has its own color, and its own icon shape. **Managers never communicate with each other.** There are no direct roads between managers — only planes between airport and each manager, and roads between each manager and its workers.

3. **Workers belong to exactly one manager.** Each worker building sits on roads that connect only to one manager.

4. **Dependent work stays within a manager.** Dependent subtasks chain along the same manager's roads sequentially. Independent subtasks fan out across that manager's roads in parallel. Dependencies never cross manager boundaries.

5. **Decisions flow up, execution flows down.** Workers execute, never decide. Managers delegate within their domain and report back, never synthesize across domains. Orchestrator is the sole point of cross-domain decision.

6. **Tools sit at the worker level.** Service vehicles operate on worker roads, not at the manager-to-airport level.

### Why this matters

The visual rule "no road between managers" makes the correct architectural principle obvious at a glance: **if managers need to coordinate, the orchestrator should be the one doing it.**

---

## Default world layout

```
                                  (plane)
                               ↗
              ┌─────────────────────────┐
              │         AIRPORT          │  ← Orchestrator (center)
              │   ╔══╗  with runway      │
              │   ║◇ ║                   │
              └─────────────────────────┘
                  ↙       ↓       ↘       ↘ (planes to each manager)
            ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
            │ MGR A│  │ MGR B│  │ MGR C│  │ MGR D│   ← 4 Managers
            │  ●   │  │  ▲   │  │  ■   │  │  ◆   │
            └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘
               │         │         │         │
           (curved roads to workers)
               │         │         │         │
             w w w     w w        w w w     w w w   ← Workers

       NO road between any two managers.
```

The world fits roughly one screen wide at default zoom. Pan and zoom let users explore details.

---

## The 6 canonical patterns

Each pattern has a route through the world that highlights when selected (relevant roads/planes light up vivid orange; everything else dims to ~30% opacity).

1. **Prompt Chaining** — Car driving station → station → station along one manager's roads.
2. **Routing** — Car arrives at a manager's switch, gets routed to one specialist worker.
3. **Parallelization** — Multiple cars leaving one manager simultaneously to multiple workers. Sectioning or voting variants.
4. **Orchestrator-Workers** — Planes land at multiple managers; each dispatches cars to workers. *Default view.*
5. **Evaluator-Optimizer** — Car loops between generator and evaluator workers within one manager until cleared.
6. **Autonomous Agent** — Single car choosing its own route within a manager's domain, visiting tool service points.

---

## The two modes of interaction (v1)

### Component mode (default)
Click any **building** → side panel slides in from the right:
- **What it is**
- **What goes inside**
- **What model to use** (Opus for orchestrator, Sonnet for managers, Haiku for workers)
- **Setup checklist**
- **Common mistakes**
- **Example use case**

### Pattern mode
Click a **pattern** in the menu → the relevant route lights up in orange, rest dims. Caption appears. Click another pattern, different route lights up.

---

## Visual aesthetic

### Reference base
**Mini Motorways night mode**, with a technical overlay.

- **Background:** dark blue-grey base (~#27313D, slightly bluer than pure dark grey)
- **Behind the world:** faint white blueprint grid — barely visible, sets the "technical schematic" tone
- **Buildings:** rounded squares with bright saturated colors and small icon overlays
- **Roads:** light grey curved ribbons connecting buildings
- **Vehicles:** tiny shapes with subtle headlight glows
- **Labels:** monospace small caps near each building ("ORCHESTRATOR", "MANAGER A", etc.) — the "technical" half of the hybrid

### Pattern highlighting (the magic moment)
Selected pattern's roads/planes shift to vivid orange-amber (like the highway in `active-map.png`). Others dim. Active-route vehicles may pulse or speed up subtly.

### Camera
Top-down only. No rotation. Pan + zoom only. Default zoom shows the whole world.

### Detail level
Flat, geometric, Mini Motorways-style. SVG primitives only (`<rect>`, `<circle>`, `<path>`, `<polygon>`). Style consistency from coherent shape language, color, and scale.

---

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Rendering:** **SVG**, rendered directly as React components
- **Pan/zoom:** `react-zoom-pan-pinch` (~5kb)
- **Animation:** `framer-motion` for UI panel transitions; SVG `<animateMotion>` or framer-motion for vehicles along paths
- **Grid background:** CSS-tiled SVG pattern
- **Content:** MDX
- **Hosting:** Vercel (free tier)
- **Repo:** github.com/aidchal1010/routes (public)

**Removed:** three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, @types/three.

**Why SVG:** crisp at any zoom, trivial click handlers, framer-motion friendly, ~50kb total payload, works on every device including phones with no GPU concerns, inspectable in DevTools.

---

## File structure

```
routes/
├── README.md
├── DESIGN.md                          ← this file
├── CLAUDE.md
├── TODO.md
├── references/
│   ├── mini-motorways-v2/             ← active references
│   ├── color-palette/                 ← existing palette refs
│   └── _archive-3d/                   ← archived 3D refs (don't use)
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   ← intro screen (unchanged)
│   │   └── framework/
│   │       └── page.tsx               ← Tab 1: the SVG world
│   ├── components/
│   │   ├── intro/
│   │   │   └── IntroScreen.tsx        ← unchanged
│   │   ├── map/                       ← NEW (replaces /world/)
│   │   │   ├── Map.tsx                ← top-level SVG canvas + pan/zoom
│   │   │   ├── GridBackground.tsx     ← faint blueprint grid
│   │   │   ├── Airport.tsx            ← orchestrator
│   │   │   ├── Manager.tsx            ← parameterized
│   │   │   ├── Worker.tsx             ← parameterized
│   │   │   ├── Memory.tsx
│   │   │   ├── Guardrail.tsx
│   │   │   ├── ControlTower.tsx
│   │   │   ├── Plane.tsx
│   │   │   ├── Car.tsx
│   │   │   ├── ServiceVehicle.tsx
│   │   │   ├── Road.tsx
│   │   │   ├── FlightPath.tsx
│   │   │   └── Label.tsx
│   │   ├── ui/
│   │   │   ├── SidePanel.tsx
│   │   │   ├── PatternMenu.tsx
│   │   │   └── Legend.tsx
│   │   └── shared/
│   │       ├── theme.ts
│   │       ├── types.ts
│   │       └── utils.ts
│   ├── content/
│   │   ├── nodes/
│   │   └── patterns/
│   └── lib/
│       ├── palette.ts
│       ├── world-layout.ts            ← (x,y) positions of every building
│       └── constants.ts
└── package.json
```

---

## Build sequence

### Phase A — Foundation
1. Empty SVG canvas with pan/zoom (`react-zoom-pan-pinch`)
2. Faint blueprint grid background
3. Place one debug rectangle to confirm rendering + pan/zoom work

### Phase B — The first building: Airport
4. `Airport.tsx` as the central landmark — big rounded square + runway extension + orchestrator purple
5. Verify "Mini Motorways store-like" feel at default zoom

### Phase C — Managers
6. Parameterized `Manager.tsx` (props: color, icon shape, position, label)
7. Define 4 managers in `world-layout.ts` (NW, NE, SW, SE)
8. Render all 4, add monospace labels

### Phase D — Workers
9. Parameterized `Worker.tsx`
10. Define worker positions under each manager (2-3 per manager)
11. Render all workers, color-matched to their manager

### Phase E — Infrastructure
12. Curved roads from each manager to its workers
13. Straight flight paths from airport to each manager
14. Verify no manager-to-manager road exists

### Phase F — Vehicles
15. `Plane.tsx` animating along flight paths
16. `Car.tsx` animating along roads
17. Ambient motion always on

### Phase G — Interactivity
18. `SidePanel.tsx` + click handlers
19. MDX content for each node type
20. Pattern menu + pattern highlighting

### Phase H — Polish & ship
21. Service vehicles, memory, guardrails, control tower
22. Pattern highlighting animation tuning
23. README, screenshots, GIF
24. Deploy to Vercel
25. LinkedIn post

---

## Visual references

Active references live in `/references/mini-motorways-v2/`:
- `empty-map.png`, `active-map.png` — world examples
- `building-shapes.png` — destination visual vocabulary
- `road-style.png`, `cars-close-up.png` — infrastructure details
- `wide-overview.png` — default zoom reference
- `fc-overview.png`, `fc-plane-shape.png` — plane references
- `blueprint-grid.png`, `cad-diagram-style.png` — technical overlay style

Color palette refs in `/references/color-palette/`.

---

## Principles

1. **Style over detail.** Coherent shape language + color + scale beats decorative complexity.
2. **Top-down only.** No rotation, no 3D, no isometric.
3. **Iterate visually.** Build one component, verify, refine. Don't build five blind.
4. **The diagram teaches the lesson.** Every visual choice reinforces a true principle.
5. **Ship the spine first, polish later.** Full world rendering with placeholders before perfecting any one piece.
6. **Respect architectural truth.** No road between managers. Workers belong to one manager. Tools at worker level. Don't fudge architecture for prettier visuals.
