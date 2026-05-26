# Working agreement for Claude Code

Read this before every session. DESIGN.md is the product spec (what we're building). This file is the working agreement (how to build it).

## Sources of truth

- **`DESIGN.md`** — product spec, metaphor, architectural rules, file structure, build sequence
- **`src/lib/palette.ts`** — color values, single source of truth; Tailwind reads the same hex codes
- **`src/lib/world-layout.ts`** — (x, y) positions of every building in the world, single source of truth for layout
- **`references/mini-motorways-v2/`** — visual references for the SVG world. Look here before designing any component.
- **`references/color-palette/`** — color references
- **`references/_archive-3d/`** — old 3D references (DO NOT USE — these are from the abandoned R3F version)

If a request conflicts with DESIGN.md, flag it and ask. Don't silently override the spec.

## Project context (read before first session of a new conversation)

This project pivoted from 3D R3F to 2D SVG on day 2. If you see legacy references to React Three Fiber, `world/` folder, or 3D primitives in commit history — that's the old version. The current implementation is **top-down SVG, rendered as React components, with pan/zoom via react-zoom-pan-pinch**. There is no 3D, no isometric, no rotation.

## Workflow rules

- **Plan before non-trivial changes.** For anything beyond a small tweak, propose a plan and wait for approval.
- **Phase-by-phase.** Work through DESIGN.md's Build Sequence in order. Don't pull work from later phases. If something seems urgent but belongs later, flag for `TODO.md`.
- **Iterate visually.** Build one component, verify it renders, refine, then move on.
- **Commit at phase boundaries.** Suggest a commit message when a phase completes.

## Code conventions

### TypeScript
- Strict mode. No `any`. Explicit types for component props and exported functions.
- Prefer `type` over `interface` unless extending.
- Default export for components: `export default function Name()`.

### React / Next.js
- Server components by default. `"use client"` only when needed (browser APIs, hooks, interactive SVG handlers).
- Push client boundaries to leaf components.
- Use Next's `<Link>` for navigation.

### SVG conventions (this is the rendering layer)
- **Coordinate system:** the world uses a logical coordinate space. The Map SVG has a `viewBox` (e.g., `0 0 1000 700`). All building positions are in these world units, not pixels.
- **Building components return `<g>` groups**, not raw shapes. This keeps each building self-contained, easy to transform, and easy to attach click handlers to.
- **Buildings are parameterized.** `Manager.tsx` takes props for color, icon shape, position, label — not hardcoded per-instance. Same for `Worker.tsx`. Defines once, instantiated many times.
- **Layout lives in `src/lib/world-layout.ts`**, not inside components. Components consume layout data; they don't define their own positions.
- **Colors come from `@/lib/palette`.** No inline hex. If a needed color is missing, add to `palette.ts` and `tailwind.config.ts` first.
- **Curves use SVG `<path>` with `d="M ... Q ..."` or `C` for bezier curves.** Roads are quadratic or cubic bezier paths. Don't approximate curves with many small lines.
- **Vehicle motion** uses framer-motion's `motion.g` or native SVG `<animateMotion>` along a path defined as a string. Path strings can be reused: one road path can both render the road AND drive vehicle motion.
- **No external SVG assets / no imports of `.svg` files.** Every visual is composed of SVG primitives in component code so we can color, animate, and modify them. Importing pre-made SVG art breaks this discipline.

### Tailwind
- Role-based tokens (`bg-orchestrator`, `text-ink-100`, `bg-night-950`) instead of generic colors.
- Tailwind classes apply to HTML wrapper elements. SVG elements use `fill`, `stroke`, etc. directly — pull colors from `palette.ts`.
- If a needed style requires a new token, add it to `tailwind.config.ts` and mirror in `palette.ts`.

## File placement

- SVG world components → `src/components/map/`
- UI overlays (panels, menus, legends) → `src/components/ui/`
- Reusable shared utilities/types → `src/components/shared/` or `src/lib/`
- World layout (positions of every building) → `src/lib/world-layout.ts`
- Palette → `src/lib/palette.ts`
- MDX content for side panels → `src/content/nodes/` and `src/content/patterns/`
- One component per file. Filename matches default export name.

## Aesthetic guardrails

- **Mini Motorways night mode with a technical overlay.** The base aesthetic is the Dinosaur Polo Club game look: flat rounded buildings, curved grey roads, tiny vehicles, dark blue-grey background. On top of that: faint blueprint grid behind everything, monospace small-caps labels next to buildings.
- **Top-down only.** No rotation, no perspective, no isometric. Pure overhead.
- **Buildings have icon overlays for identity.** Each manager has a unique geometric icon (circle, triangle, square, diamond) on top of its colored body. This makes them identifiable at a glance even with the same shape.
- **No emoji-style detail.** Buildings are abstract geometric forms.
- **Architectural truth.** Visual choices reflect real principles from DESIGN.md. No road between managers. Workers belong to exactly one manager. Tools at worker level. Don't fudge architecture for prettier visuals.

## Reporting back

After completing a task, tell me:
1. **What changed** — files and what they now do, with line links when useful.
2. **Any deviations from the plan** — and why.
3. **What I should verify visually** — page to open, what to look for, signs of a problem.
4. **What you couldn't verify from your environment** — explicit callout of visual rendering, browser interaction, etc.

## Don'ts

- Don't run `git push --force` or `git reset --hard` without asking.
- Don't install dependencies not in the DESIGN.md tech stack without flagging the addition. Especially: do NOT reinstall any 3D library (three, @react-three/*). The project deliberately moved away from these.
- Don't import .svg files as assets. Build SVG inline in components.
- Don't refactor working code outside the current phase. Add to `TODO.md`.
- Don't write MDX content (node descriptions, pattern captions) before Phase G. Stubs only.
- Don't add pattern highlighting, animation, or interactivity ahead of its phase.
- Don't fudge architecture for prettier visuals. If the metaphor breaks, the lesson breaks.
- Don't use the files in `references/_archive-3d/` — those are from the abandoned 3D version.
