# Routes — Design Specification

## What this project is

Routes is an educational website that explains **how agentic systems are built** through an interactive 3D world. The metaphor is a transit network: orchestrators are airports, managers are train hubs, workers are small stations, and tools are the ground crew supporting it all. Users land on a Mini Motorways-style world, click on buildings to learn what each piece does, and click on patterns (Prompt Chaining, Routing, etc.) to see how data flows through the system.

The site is grounded in Anthropic's "Building Effective Agents" framework (Schluntz & Zhang, 2024) and a builder's methodology for agent construction (see `agent_building_methodology.md`).

**Target audience:** both technical (developers building agents) and non-technical (PMs, founders, leaders trying to understand the space).

**The hook:** every other agent-pattern explainer is either flat docs or abstract diagrams. This one is a *world you explore.*

---

## v1 scope (what we're building this week)

- Intro screen with "Let's explore how workflows are built" button
- Tab 1: The Framework — the interactive 3D transit world
- Component-mode exploration (click buildings to learn what they are)
- Pattern-mode exploration (click a pattern to see its route highlighted)
- 6 canonical patterns visualized
- Dark mode aesthetic with vibrant accents
- Deployed on Vercel, public GitHub repo

## v2 / deferred (not this week)

- Tab 2: The Builder — drag-and-drop sandbox where users sketch their own workflow
- Phase-mode exploration (walk through the 7 phases of building an agent)
- Evals as an 8th phase
- Animation play/pause controls

---

## The core metaphor

| Concept | Visual element | Reasoning |
|---|---|---|
| **Orchestrator** | Airport (central hub) | The big terminal where every task starts and where final results are synthesized. Largest structure, central position. The *only* node that coordinates between managers. |
| **Manager** | Train terminus / hub station with multiple tracks fanning out | A regional hub that receives high-level tasks from the orchestrator and dispatches to many workers in parallel. Owns a single domain. **Managers do not communicate with each other.** |
| **Worker** | Small two-platform station | A focused stop where one specific task happens. Stateless — train arrives, work happens, train leaves. Belongs to exactly one manager. |
| **Plane** | Task assignment from Orchestrator → Manager | Long-haul, flies in arcs over the world. Visible from far away. |
| **Train** | Task dispatch from Manager → Workers | Multi-car articulated train; each car represents one parallel sub-task. |
| **Tools / Ground crew** | Trucks, baggage handlers, fuel trucks | Support vehicles that move between buildings doing deterministic work. Visually distinct from passenger vehicles to reinforce *tools do, agents decide*. |
| **Memory** | Depot / warehouse | Where state persists. Things go in and come back out later. |
| **Guardrails** | Security checkpoints / gates | Inspection points data passes through. |
| **Logging / Observability** | Control tower | Watches over everything, records what happens. |

---

## Architectural rules (visible in the layout)

These rules govern how the world is structured. They are not decoration — they reflect how production agentic systems should actually be built.

1. **One orchestrator.** A single airport sits at the center of the world. It is the only node that sees the full picture and the only node that synthesizes final output.

2. **Four managers, fully independent.** The default world has **4 managers** arranged around the airport. Each owns a distinct domain. **Managers never communicate with each other.** There are no direct routes between train hubs — only routes from each hub back to the airport. This visual rule (no manager-to-manager track) teaches a real architectural principle: cross-manager coordination is the orchestrator's job, not the managers' job. If two managers need shared context, that's a signal the orchestrator should be doing the work, not the managers.

3. **Workers belong to exactly one manager.** Each worker station sits on tracks that lead back to a single train hub. Workers are never shared between managers.

4. **Dependent work stays within a manager.** If subtasks depend on each other's output, they run on the same manager's tracks (sequentially along one line). If subtasks are independent, they fan out across that manager's parallel tracks. **Dependencies never cross manager boundaries** — if they would, the orchestrator should have decomposed differently.

5. **Decisions flow up, execution flows down.** Workers never make judgment calls — they execute. Managers don't synthesize cross-domain results — they delegate within their domain and report back. The orchestrator is the only node that makes cross-domain decisions.

6. **Tools sit at the worker level.** Ground crew vehicles operate around worker stations, not at the manager or orchestrator level. Tools are deterministic — they do, they don't decide.

### Why this matters

Most people designing agent hierarchies make one of two mistakes: either they create a monolithic agent that does everything (no managers), or they let managers talk to each other (which creates tangled coordination and lost context). The visual rule "no track between hubs" is a memorable way to internalize the correct principle: **if managers need to coordinate, the orchestrator should be the one doing it.**

---

## Default world layout

```
                    ┌─────────────┐
                    │   AIRPORT   │   ← Orchestrator (center)
                    │ (Orchestr.) │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ✈ ───┴───✈        ✈ ────┴────✈        ✈───┴───✈
   │                  │                  │             ✈
┌──▼──┐            ┌──▼──┐            ┌──▼──┐       ┌──▼──┐
│ HUB │            │ HUB │            │ HUB │       │ HUB │   ← 4 Managers (NW, NE, SW, SE)
│  A  │            │  B  │            │  C  │       │  D  │
└──┬──┘            └──┬──┘            └──┬──┘       └──┬──┘
   │                  │                  │             │
 🚆🚆🚆            🚆🚆🚆            🚆🚆🚆           🚆🚆🚆
 │ │ │              │ │ │              │ │ │           │ │ │
 W W W              W W W              W W W           W W W   ← Workers

        No tracks connect HUB A ↔ HUB B ↔ HUB C ↔ HUB D
        Only routes: Airport ↔ each Hub, and each Hub ↔ its own Workers
```

Each hub has 2-3 worker stations under it. Trains run between hubs and their workers. Planes run between the airport and each hub. Ground crew vehicles operate around the worker stations.

---

## Why this metaphor works

1. **Hierarchy is visible.** Airports > train hubs > local stops, in scale and importance.
2. **Parallelism is visible.** A train pulling out of a manager-hub with 5 cars heading to 5 worker stations = 5 parallel workers, instantly readable.
3. **Flow direction is visible.** Vehicles travel along routes. You can see data move.
4. **"Tools do, agents decide" is visible.** Ground crew doesn't make decisions — dispatch does. This visually reinforces the most important architectural principle.
5. **Different vehicle types = different layers of hierarchy.** Planes vs trains vs trucks read at a glance.
6. **Manager independence is visible.** No tracks between hubs makes the isolation principle obvious at first glance.

---

## The 6 canonical patterns

These come from the Anthropic "Building Effective Agents" taxonomy. Each will have a route through the world that highlights when the user selects it.

1. **Prompt Chaining** — Single train going station → station → station along one manager's track. Linear, sequential. Output of one feeds the next.
2. **Routing** — A train arrives at a manager's switch (classifier), gets routed to one specific specialist worker line within that manager's domain.
3. **Parallelization** — Multiple worker stations under one manager all fire simultaneously. Two variants: sectioning (split work across workers) and voting (same work, multiple workers, aggregate at the manager).
4. **Orchestrator-Workers** — Planes land at multiple hubs, each hub dispatches multiple trains fanning out to workers. *This is the default view of the world.*
5. **Evaluator-Optimizer** — A train loops back to its origin worker until cleared. Generator worker → Evaluator worker → Generator until quality threshold met. Lives entirely within one manager.
6. **Autonomous Agent** — A single train choosing its own route within a manager's domain, visiting tool-depots as needed, deciding when it's done.

---

## The two modes of interaction (v1)

### Component mode (default)
User clicks any **building** in the world. A side panel slides in from the right with:
- **What it is** — one-sentence definition
- **What goes inside** — the actual structure (system prompt, tools, output format, etc.)
- **What model to use** — e.g. Opus for orchestrator, Sonnet for managers, Haiku for workers, no LLM for deterministic tools
- **Setup checklist** — concrete steps to build one
- **Common mistakes** — what to avoid
- **Example use case** — a real scenario

### Pattern mode
User clicks a **pattern** in a small menu (top or left). The relevant route in the world lights up, everything else dims. A caption appears explaining the pattern. Click another pattern, different route lights up.

---

## Side panel content (per node type)

Each building type needs the side panel content written out. Initial set:

- **Orchestrator** (Airport)
- **Manager** (Train hub)
- **Worker** (Local station)
- **Router** (Train switch — within a manager)
- **Evaluator** (Quality control worker — within a manager)
- **Tool** (Ground crew vehicle)
- **Memory** (Warehouse / depot)
- **Guardrail** (Security gate)
- **Logger** (Control tower)

Content for each will be written in MDX files under `/content/nodes/`.

---

## Visual aesthetic

- **Reference games:** Mini Motorways (night mode), Fly Corp, Townscaper
- **Camera:** Tilted isometric with slight perspective. Slight zoom-out at landing so the user sees the whole world.
- **Background:** Deep dark (near-black, slight blue undertone). See `references/color-palette/mm-night-mode.png`.
- **Accents:** Vibrant purple, orange, cyan, magenta, lime green. See `references/color-palette/mm-color-palette.png`.
- **Lighting:** Soft ambient + directional. Bloom/glow on active routes and buildings.
- **Motion:** Always-on ambient — a few vehicles always in transit so the world feels alive. Highlighted routes get more visible movement.
- **Detail level:** Low-poly, geometric. Building from primitive shapes (boxes, cylinders, cones) composed together. Style consistency comes from coherent color and scale, not high detail.

---

## Tech stack

- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS
- **3D:** React Three Fiber + @react-three/drei + @react-three/postprocessing (for bloom/glow)
- **Animation:** Built-in R3F frame loop for ambient motion; framer-motion for UI/panel transitions
- **Content:** MDX for node descriptions and pattern captions
- **Hosting:** Vercel (free tier)
- **Repo:** github.com/aidchal1010/routes (public)

---

## File structure

```
routes/
├── README.md
├── DESIGN.md                          ← this file
├── references/                         ← visual references (already in place)
├── public/
│   └── (favicon, etc.)
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ← root layout, dark mode, fonts
│   │   ├── page.tsx                   ← intro screen
│   │   └── framework/
│   │       └── page.tsx               ← Tab 1: the 3D world
│   ├── components/
│   │   ├── intro/
│   │   │   └── IntroScreen.tsx
│   │   ├── world/
│   │   │   ├── World.tsx              ← top-level R3F Canvas
│   │   │   ├── Airport.tsx            ← orchestrator
│   │   │   ├── TrainHub.tsx           ← manager
│   │   │   ├── WorkerStation.tsx      ← worker
│   │   │   ├── ControlTower.tsx       ← logger
│   │   │   ├── Depot.tsx              ← memory
│   │   │   ├── SecurityGate.tsx       ← guardrail
│   │   │   ├── Plane.tsx              ← vehicle: orchestrator → manager
│   │   │   ├── Train.tsx              ← vehicle: manager → worker
│   │   │   ├── GroundVehicle.tsx      ← tool vehicles
│   │   │   ├── Route.tsx              ← reusable path component
│   │   │   └── Ground.tsx             ← the floor / world base
│   │   ├── ui/
│   │   │   ├── SidePanel.tsx          ← slides in when building clicked
│   │   │   ├── PatternMenu.tsx        ← pattern selector
│   │   │   └── Legend.tsx             ← key explaining each piece
│   │   └── shared/
│   │       └── (theme, types, utils)
│   ├── content/
│   │   ├── nodes/
│   │   │   ├── orchestrator.mdx
│   │   │   ├── manager.mdx
│   │   │   ├── worker.mdx
│   │   │   ├── router.mdx
│   │   │   ├── evaluator.mdx
│   │   │   ├── tool.mdx
│   │   │   ├── memory.mdx
│   │   │   ├── guardrail.mdx
│   │   │   └── logger.mdx
│   │   └── patterns/
│   │       ├── prompt-chaining.mdx
│   │       ├── routing.mdx
│   │       ├── parallelization.mdx
│   │       ├── orchestrator-workers.mdx
│   │       ├── evaluator-optimizer.mdx
│   │       └── autonomous-agent.mdx
│   └── lib/
│       └── (helpers, constants, color palette)
└── package.json
```

---

## Build sequence (suggested order)

### Phase 1 — Foundation (day 1, first half)
1. Scaffold Next.js + TypeScript + Tailwind
2. Install R3F, drei, postprocessing
3. Build intro screen with "Let's explore" button
4. Create `/framework` route with empty R3F Canvas
5. Add Ground plane, basic lighting, camera at isometric angle

### Phase 2 — Build the buildings (day 1, second half)
6. Airport component (most detailed — terminal, control tower, runway, hangar)
7. TrainHub component (large multi-track terminus)
8. WorkerStation component (small two-platform stop)
9. Place one of each in the world to scale-check

### Phase 3 — Connect the world (day 2, first half)
10. Route component (curved paths between buildings)
11. Plane component + animation (arc flight from airport to hubs)
12. Train component + animation (along tracks from hub to workers)
13. Compose full world: 1 airport, **4 hubs**, 2-3 workers per hub (8-12 workers total), routes between them
14. **No tracks between hubs** — enforce the manager independence rule visually

### Phase 4 — Interactivity (day 2, second half)
15. SidePanel component (slides in on click)
16. PatternMenu component
17. Wire up click-to-open-panel for each building type
18. Write MDX content for each node
19. Pattern highlighting (selecting a pattern highlights its route)

### Phase 5 — Polish & ship
20. Bloom/postprocessing for the glow
21. Ambient vehicle motion
22. Legend component
23. Polish intro screen
24. Write README with screenshots
25. Deploy to Vercel
26. Write LinkedIn post

---

## Visual references (in this repo)

All references live in `/references/` organized by category:
- `airport-style/` — orchestrator inspiration (terminal, control tower, planes, runway)
- `train-station-style/` — manager hub inspiration (multi-track terminus)
- `worker-buildings/` — worker station inspiration (two-platform stop, train vehicle)
- `color-palette/` — color and night-mode atmosphere references

When building any 3D component, Claude Code should look at the matching reference folder for visual guidance. The goal is not to copy but to capture the *spirit*: low-poly, geometric, clean, slightly stylized, consistent color palette.

---

## Principles to follow throughout

1. **Style over detail.** Coherent color and scale beat high polygon count.
2. **Simplicity over framework magic.** When unsure, use the simplest R3F primitives.
3. **Iterate visually.** Build one component, see it render, refine before moving on. Don't build five things blind.
4. **The diagram teaches the lesson.** Every visual choice should reinforce something true about agentic systems. If a visual is just decoration, cut it.
5. **Ship the spine first, polish later.** Get the full world rendering with placeholders before perfecting any single piece.
6. **Respect architectural truth.** Visual choices (like "no track between hubs") must reflect real principles. Don't fudge the architecture for prettier visuals.
