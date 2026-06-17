// DRAFT content for the Build Guide page. Structured like element-content.ts so the
// prose is easy to lock later (final wording is a later pass). Voice follows the locked
// Layer 2 rules: model-neutral, no em-dashes, no "But" openers, no product names. The
// per-element panels teach each piece on its own; this guide is the system-wide assembly
// manual and deliberately consolidates (one model table, one vocabulary table) rather
// than repeating per element.

export type ModelRow = { layer: string; model: string; why: string };
export type VocabRow = { ours: string; theirs: string; note: string };
export type Reference = { label: string; url: string };

// File tree renders as a PLAIN <pre> (not the syntax highlighter): box-drawing chars and
// the inline notes would mis-tokenize, and the first "#" would be read as a comment.
const FILE_TREE = `agent-system/
├── main.py              entry point: take a request, run the orchestrator
├── orchestrator.py      plan, dispatch managers in parallel, synthesize
├── manager.py           one manager, parameterized by domain (run four times)
├── memory.py            store the plan so long runs do not lose it
├── tools/
│   ├── research.py      web search, document retrieval, source reader
│   ├── data.py          database query, code execution, chart generator
│   ├── code.py          file read/write, test runner, repo search, linter
│   └── comms.py         email/messaging, calendar, records (CRM)
└── prompts/
    ├── orchestrator_planning.txt
    ├── synthesis.txt
    └── manager_research.txt    (one prompt per domain)`;

// Memory snippet renders through highlightCode (real Python). No "#" inside string
// literals: the highlighter treats the first "#" on a line as a comment.
const MEMORY_CODE = `# Illustrative pseudo-code. Check your AI provider's current SDK for exact API.

# Save the plan as soon as it is made, before any dispatch.
memory.save("plan", plan)

# Reload it later, during synthesis, even after a long run has filled the context.
final = ai.create(
    model="your strongest model",
    system=SYNTHESIS_PROMPT,
    input=combine(user_query, results, memory.load("plan")),
)`;

export const BUILD_GUIDE = {
  intro: {
    lead: `How to build the whole system the world shows: one orchestrator, a set of managers that each own a domain, and the tools beneath them. The element panels explain each piece on its own. This guide is the assembly manual for putting them together.`,
  },

  whatYouBuild: {
    body: `At the top is a single orchestrator. It receives the request, breaks it into independent tasks, and hands each one to a manager. Each manager is a specialized agent with its own context window and its own tools, and it works its task without talking to the other managers. Tools sit at the bottom: plain functions a manager calls to touch the real world. Results flow back up, manager to orchestrator, where they are combined into one answer.`,
  },

  fileLayout: {
    tree: FILE_TREE,
    note: `manager.py is a single file, not four. It takes a domain prompt and a toolset and runs the same loop for any domain, so the four manager buildings in the world are four instances of this one definition, exactly as the world renders one Manager component four times. Adding a domain means adding a prompt and a toolset, not a new file.`,
  },

  assembly: {
    intro: `Build from the bottom up. Each step works on its own before the next one wraps it.`,
    steps: [
      `Start with one tool. Define a single capability, a web search for example, with a clear name, a description, and an input shape, and wire it to one model call. Watch the model decide when to reach for it.`,
      `Wrap it in one manager. Give a single manager a domain prompt and that one tool, and get the loop working: receive a task, call the tool, return a short summary.`,
      `Add the orchestrator, sequentially. Have it break a request into two or three subtasks and call your one manager once per subtask, one after another, then combine the answers.`,
      `Parallelize the dispatch. Once the sequential version works end to end, run the manager calls at the same time instead of in series. This is an optimization, not the core pattern.`,
      `Add the other domains. Reuse manager.py with new prompts and toolsets for Data-Analysis, Code, and Communication-Action.`,
      `Add plan memory. For longer runs, save the plan before dispatching so the orchestrator does not lose track of it as its context fills.`,
    ],
  },

  models: {
    intro: `Use a strong model where the thinking is hardest and cheaper models for the focused work. One decision, applied across the whole system.`,
    rows: [
      {
        layer: "Orchestrator",
        model: "Your strongest model",
        why: "It plans the work and synthesizes the results, the two hardest steps. Quality here drives the whole system.",
      },
      {
        layer: "Manager",
        model: "A capable, cost-efficient model",
        why: "The orchestrator already did the heavy planning. Managers run focused, scoped work, so a mid-tier model is usually enough.",
      },
      {
        layer: "Tool",
        model: "Not a model",
        why: "A tool is plain code the manager calls. It runs a function and returns a result; it does not reason.",
      },
    ] as ModelRow[],
    example: `Anthropic's multi-agent research system uses this split directly: a stronger lead model with cheaper subagent models beneath it, for example Opus as the lead and Sonnet as the subagents.`,
    tradeoff: `This architecture spends far more tokens than a single call. The strong-lead, cheaper-workers split keeps the cost in check while preserving quality where it matters. Reach for the whole pattern only when the work is big enough to justify it.`,
  },

  vocab: {
    intro: `Friendly names on the left, the terms you will meet in the source material on the right.`,
    rows: [
      {
        ours: "Orchestrator",
        theirs: "Lead agent",
        note: "The central model that plans and synthesizes.",
      },
      {
        ours: "Manager",
        theirs: "Subagent",
        note: "A specialized agent with its own context window and tools.",
      },
      {
        ours: "Tool",
        theirs: "Tool",
        note: "A defined function the model can call.",
      },
    ] as VocabRow[],
  },

  noPeer: {
    body: `Managers never talk to each other. Each one receives a task from the orchestrator above it and calls the tools below it, and that is the full extent of its connections. Keeping managers independent is what lets them run in parallel and keeps the system easy to reason about. When two managers seem to need to coordinate, that coordination belongs in the orchestrator, which can sequence their work or pass one manager's result into another's task.`,
  },

  memory: {
    body: `The orchestrator's context window is finite. On a long run it fills up, and early content, including the original plan, can fall out. Saving the plan to memory right after it is made keeps it available through the whole run.`,
    code: MEMORY_CODE,
    note: `Memory has no element in the world yet. It is a code-level concept here, planned as a visible piece later.`,
  },

  aiAssist: {
    body: `AI coding assistants are good at the boilerplate here: defining a tool, wiring a tool-calling loop, scaffolding the file layout. Let them help, then build the simple version yourself first so you understand what they generated and why. The architecture is the part that has to be yours; the typing is the part you can hand off.`,
    metaNote: `This site itself was built with AI coding assistance, which is a fair example of the balance. The assistant handled much of the construction, and understanding the architecture is what made the result any good.`,
  },

  references: [
    {
      label: "Building Effective Agents, Anthropic (2024)",
      url: "https://www.anthropic.com/engineering/building-effective-agents",
    },
    {
      label: "How we built our multi-agent research system, Anthropic (2025)",
      url: "https://www.anthropic.com/engineering/multi-agent-research-system",
    },
  ] as Reference[],
};
