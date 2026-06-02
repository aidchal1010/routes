# Routes

An interactive visualization that teaches how agentic AI systems work — by turning the architecture into a living, top-down world you can explore.

Instead of a static diagram, Routes shows the pattern in motion: a central **orchestrator** dispatches tasks to specialized **managers**, who call **tools** to do concrete work, and results flow back up. Planes and cars carry the work between them, so you can watch how a complex request gets decomposed, delegated, and synthesized in real time.

## The model

Routes visualizes the orchestrator–workers pattern, composed hierarchically:

- **Orchestrator** (the airport) — the lead agent. Receives your request, breaks it into independent subtasks, dispatches them, and synthesizes the results into one answer.
- **Managers** (the four colored buildings) — specialized subagents, each scoped to a domain: Research, Data-Analysis, Code, and Communication-Action. Each runs in its own context window.
- **Tools** (the smaller buildings clustered around each manager) — the concrete capabilities a manager calls: web search, database queries, code execution, file access, and so on.
- **Planes** carry tasks between the orchestrator and managers; **cars** carry tool calls between managers and their tools. Outbound vehicles are a dispatch; the returning vehicles are the result.

The metaphor is grounded in Anthropic's published patterns (see References).

## Status

In active development. The static world, the motion system, and click-to-explore interactivity are built; educational content and a build guide are in progress.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [framer-motion](https://www.framer.com/motion/) for vehicle animation
- [react-zoom-pan-pinch](https://github.com/BetterTyped/react-zoom-pan-pinch) for pan/zoom
- SVG, rendered as React components
- Tailwind CSS

## Running locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) for the intro, or [http://localhost:3000/framework](http://localhost:3000/framework) for the world.

## References

The architecture is based on Anthropic's writing on agentic systems:

- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) — Anthropic (2024)
- [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — Anthropic (2025)
