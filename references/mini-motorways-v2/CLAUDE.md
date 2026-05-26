# Working agreement for Claude Code

Read this before every session. DESIGN.md is the product spec (what we're building). This file is the working agreement (how to build it).

## Sources of truth

- **`DESIGN.md`** — product spec, metaphor, architectural rules, file structure, build sequence. Anchor major decisions here.
- **`src/lib/palette.ts`** — color values, single source of truth. Tailwind reads the same hex codes.
- **`references/`** — visual inspiration organized by node type. Look at the matching folder before designing any 3D component.
- **`agent_building_methodology.md`** (when added) — the builder's methodology that informs node content.

If a request conflicts with DESIGN.md, flag it and ask before proceeding. Don't silently override the spec.

## Workflow rules

- **Plan before non-trivial changes.** For anything more complex than a small tweak, propose a plan first and wait for approval. Surface design decisions explicitly instead of guessing.
- **Phase-by-phase.** We work through DESIGN.md's Build Sequence in order. Don't pull in work from later phases. If something seems urgent but belongs to a later phase, flag it for `TODO.md` instead.
- **Iterate visually.** Build one component, verify it renders, refine, then move on. Don't build five components blind.
- **Commit at phase boundaries.** When a phase completes, suggest a commit message summarizing what changed.

## Code conventions

### TypeScript
- Strict mode. No `any`. Use explicit types over inference for public APIs (component props, exported functions).
- Prefer `type` over `interface` unless extending.
- Components: `export default function Name()` style; named export only when more than one symbol leaves the file.

### React / Next.js
- Server components by default. Add `"use client"` only when needed (browser APIs, hooks like useState/useEffect, R3F Canvas trees).
- Keep client boundaries small — push interactivity to leaf components, not whole pages.
- Use Next's `<Link>` for navigation, not `<a>`.

### R3F / Three.js
- Always import `import type {} from "@react-three/fiber"` at the top of any file that uses R3F intrinsic JSX elements (`<mesh>`, `<group>`, etc.) but doesn't otherwise import from `@react-three/fiber`. Without it, TypeScript loses the JSX types.
- Build 3D objects from primitives (`<boxGeometry>`, `<cylinderGeometry>`, `<coneGeometry>`) composed in `<group>`s. Don't reach for external GLB/GLTF models — the project's aesthetic comes from coherent primitive composition.
- Use `meshStandardMaterial` for objects that should catch light. Use `meshBasicMaterial` for things that should read at a flat exact color regardless of lighting (e.g., the ground plane).
- All colors come from `@/lib/palette`. Never inline raw hex in components — if a needed color isn't in the palette, add it to `palette.ts` and `tailwind.config.ts` first.
- All units are arbitrary Three.js units. The Airport is roughly 4-6 units wide; train hubs ~3-4; workers ~1-2. Keep scale ratios consistent.

### Tailwind
- Use the role-based tokens (`bg-orchestrator`, `text-ink-100`, `bg-night-950`, etc.) instead of generic Tailwind colors.
- If a needed style requires a new token, add it to `tailwind.config.ts` and mirror in `palette.ts`.

## File placement

- 3D scene components → `src/components/world/`
- UI overlays (panels, menus, legends) → `src/components/ui/`
- Reusable shared utilities/types → `src/components/shared/` or `src/lib/`
- MDX content for side panels → `src/content/nodes/` and `src/content/patterns/`
- One component per file. Filename matches default export name.

## Aesthetic guardrails

- **Style over detail.** Coherent color and scale beat polygon count. The reference is Mini Motorways night mode — geometric, quiet, atmospheric.
- **Dark first.** Background is `night-950`, ground is slightly lighter (currently `#353841`). Buildings introduce color via palette tokens.
- **No emoji-style details.** Buildings are abstract geometric forms, not literal renderings. An airport is a curved roof + tower silhouette, not a textured 3D scan.
- **Architectural truth.** Visual choices must reflect real principles from DESIGN.md. Examples: no tracks connect hubs to each other; tools live at the worker level, not the orchestrator level; workers belong to exactly one manager. If a visual would contradict an architectural rule, change the visual.

## Reporting back

When a task completes, tell me:
1. **What changed** — files and what they now do, with line links when useful.
2. **Any deviations from the plan** — and why.
3. **What I should verify visually** — the page to open, what to look for, what would indicate a problem.
4. **What you couldn't verify from your environment** — explicitly call out things only the human can confirm (visual rendering, browser interaction).

## Don'ts

- Don't run `git push --force` or `git reset --hard` without asking.
- Don't install dependencies not in DESIGN.md's tech stack without flagging the addition.
- Don't refactor working code outside the current phase's scope. If you notice something worth refactoring, add it to `TODO.md`.
- Don't write content (MDX node descriptions, pattern captions) until Phase 7. Stubs only before then.
- Don't add post-processing, animation, or interactivity ahead of its phase — even if it would be easy.
- Don't fudge architecture for prettier visuals. If the metaphor breaks, the lesson breaks.
