// PLACEHOLDER content — real educational copy lands in Layer 2 (Step 7–9).
// Builds a PanelContent for a clicked world element, keyed by element kind. The text is
// realistic enough to judge the panel's feel, but is intentionally generic per type
// (not yet per-instance) until Layer 2 writes the real per-element copy.

import type { PanelContent } from "./InfoPanel";

type ElementKind =
  | "orchestrator"
  | "manager"
  | "tool"
  | "plane-outbound"
  | "plane-inbound"
  | "car-outbound"
  | "car-inbound";

export function getPlaceholderContent(
  kind: ElementKind,
  elementName: string,
  accentColor: string,
): PanelContent {
  return { elementName, accentColor, ...BODY[kind](elementName) };
}

type Body = Omit<PanelContent, "elementName" | "accentColor">;

// Placeholder fillers for the fields the reshaped type added. Real per-element copy
// for these 6 elements lands in Layer 2 (only the orchestrator is wired for real now).
const PH_CONNECTOR =
  "Placeholder connector — points to the related on-screen motion. Real copy in Layer 2.";
const PH_CODE =
  "// Illustrative pseudo-code lands in Layer 2.\n// Check your AI provider's current SDK.";
const PH_WHERE_TO_START =
  "Placeholder — the first concrete build step lands in Layer 2.";
const PH_WHEN_TO_USE =
  "Placeholder — where this fits and where it's the wrong choice lands in Layer 2.";
const PH_OUR_MODEL =
  "Placeholder — mapping to Anthropic's official term lands in Layer 2.";

const BODY: Record<ElementKind, (name: string) => Body> = {
  orchestrator: () => ({
    // FINAL LOCKED v3 content (TODO.md "ORCHESTRATOR CONTENT — FINAL LOCKED (v3)").
    // Prose is the locked text verbatim. `code` is a clearly-marked placeholder —
    // paste the final illustrative pseudo-code block here.
    overview: {
      whatItIs: `In this world, the orchestrator is the airport at the center, where every plane (Task Dispatch) begins or ends its journey. It represents the lead agent: a single, capable AI model that receives your original request. The orchestrator never does the detailed work itself. Its job is to understand the request deeply enough to break it into smaller, independent pieces that specialized managers can handle. It coordinates the whole effort from the center.`,
      whatItDoes: `When a request arrives, the orchestrator analyzes what you are really asking and forms a plan. It divides that plan into separate tasks and hands each one to the manager best suited for it. The managers work while the orchestrator waits, and as their results come back, it holds them together. Once it has everything, it performs the final step: synthesis, combining the separate results into one coherent answer greater than any single piece.`,
      connector: `Watch the planes leaving the airport. Each one carries a task to one of the four specialized managers around it: Research, Data-Analysis, Code, and Communication. The purple planes arriving back are the specific managers reporting their results.`,
      example: `Imagine you ask, "Research the electric vehicle market and chart the top three companies by revenue." A single AI answering alone would have to work through everything in one stream of thought. The orchestrator splits the work instead, sending the market research to the Research manager and the revenue analysis to the Data-Analysis manager at the same time. When each one reports back, the orchestrator combines their findings into a single answer. You get a broader, deeper, and much faster result than one agent working alone could produce.`,
    },
    advanced: {
      howItWorks: `The orchestrator is a single AI model call running with a planning prompt. Its output is a plan made of subtask definitions. Your code reads that plan and, for each subtask, makes a separate AI call (a manager, or "subagent"), and each call runs in its own independent context window. The calls run in parallel. As each one returns a condensed result, the orchestrator collects it, and once all the results are in, it makes a final call to handle synthesis. The orchestrator's own context holds only the plan and the returned summaries, never the full work each manager did. That separation is what lets the system process far more total information than a single context window could ever hold.`,
      code: `# Illustrative pseudo-code. Check your AI provider's current SDK for exact API.

# 1. PLAN. Use your strongest model here; planning quality drives everything.
plan = ai.create(
    model="your strongest model",          # e.g. a frontier model like Claude Opus
    system=ORCHESTRATOR_PLANNING_PROMPT,    # task decomposition lives in this prompt
    # Give it room to reason before deciding. A thinking step here keeps the
    # model from committing to a bad plan too early.
    input=user_query,
)
subtasks = parse_subtasks(plan)             # the plan lists the pieces of work

# 2. REMEMBER. Context windows are finite, so save the plan before it can be lost.
memory.save("plan", plan)

# 3. DISPATCH IN PARALLEL. Each manager runs in its own fresh context window.
results = run_in_parallel([
    run_manager(task) for task in subtasks
])

# 4. SYNTHESIZE. Back to the strong model; combining results is its own hard task.
final = ai.create(
    model="your strongest model",
    system=SYNTHESIS_PROMPT,                # "combine these into one answer" lives here
    input=combine(user_query, results, memory.load("plan")),
)`,
      whereToStart: `Build the simple version before the parallel one. Start with a single loop: one AI call that breaks a request into two or three subtasks, then a separate call for each subtask, and finally a call that combines the answers, all running one after another. Once that sequential version works from end to end, switch the per-subtask calls to run in parallel. Parallelism is an optimization you add later. The core pattern to get right first is decompose, delegate, and synthesize. AI coding assistants can scaffold this loop for you, but there's real value in building the simple version yourself first. It gives you a much clearer sense of what they generate and why.`,
      commonTraps: `The most frequent mistake is over-delegating. Early versions of Anthropic's research system spun up fifty subagents for a question that needed one. Your planning prompt has to teach the orchestrator to match its effort to the scale of the request, or costs will climb faster than you'd expect. Closely related is vague delegation. Loose descriptions like "research competitors" cause subagents to duplicate work or wander off course. Every task needs a clear objective, a defined output format, and explicit boundaries.

Two other traps are easy to miss until they hurt you. On long runs, the context window fills up and earlier content gets dropped, so save the plan to memory early or the orchestrator will lose track of what it set out to do. Since this architecture can burn through a lot of tokens on a single request, it's worth asking whether the quality of the output genuinely justifies the cost.`,
      whenToUse: `The orchestrator fits work that naturally splits into independent directions: research, multi-file code changes, aggregating from many sources, especially when the total information is more than a single context window can hold. It's the wrong choice for tightly coupled tasks where each step depends on the previous one, or for simple questions a single call handles just fine. In those cases, the coordination adds overhead without adding much of anything.`,
      ourModel: `What we call the "orchestrator" maps to what Anthropic calls the lead agent in their multi-agent research system, and the central model in the orchestrator-workers workflow from Building Effective Agents. The pattern itself is general and works with any capable model.`,
      references: [
        {
          label: "Building Effective Agents, Anthropic (2024)",
          url: "https://www.anthropic.com/engineering/building-effective-agents",
        },
        {
          label: "How we built our multi-agent research system, Anthropic (2025)",
          url: "https://www.anthropic.com/engineering/multi-agent-research-system",
        },
      ],
    },
  }),
  manager: (name) => ({
    overview: {
      whatItIs: `${name} is a domain-specific sub-orchestrator — a specialized agent that owns one slice of the problem, the way a team lead owns a project area.`,
      whatItDoes:
        "It receives a task dispatched from the orchestrator, works through it step by step, calls whichever of its tools it needs along the way, and synthesizes the results into a single answer it hands back up.",
      connector: PH_CONNECTOR,
      example:
        "Asked to 'summarize last quarter's support tickets,' it might call a database tool to pull the tickets, an analysis tool to cluster them by theme, then draft the summary itself — combining the tool results into one answer.",
    },
    advanced: {
      howItWorks:
        "Build it as a tool-using agent loop: the manager calls its tools, collects their structured results, and runs a synthesis pass. Managers never talk to peer managers — they only call their own tools and report back to the orchestrator (the no-peer-coordination rule, kept deliberately to avoid tangled cross-team dependencies).",
      code: PH_CODE,
      whereToStart: PH_WHERE_TO_START,
      commonTraps:
        "Cache the system prompt — it's stable across calls and large. Add retries with backoff on tool failures so one flaky tool doesn't sink the cycle. Set a synthesis timeout or safety cap so a stuck tool call can't block the manager forever. Log call to result per tool for observability. Common pitfall: over-calling tools on trivial tasks, since every tool call adds latency and cost.",
      whenToUse: PH_WHEN_TO_USE,
      ourModel: PH_OUR_MODEL,
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
  tool: () => ({
    overview: {
      whatItIs:
        "A tool is a capability a manager can call — a web search, a database query, a code-execution sandbox, an external API. It isn't an agent that plans or delegates; it's a function the manager invokes and gets a result back from.",
      whatItDoes:
        "When a manager needs information or an action it can't produce from reasoning alone, it calls a tool with a focused input and waits for the structured result it returns.",
      connector: PH_CONNECTOR,
      example:
        "A research manager hands its web-search tool the query 'recent EU AI regulation,' and the tool returns a list of source links — nothing more.",
    },
    advanced: {
      howItWorks:
        "Build it as a well-described function the agent runtime can call: a clear name, a typed input schema, and a structured return value. The model decides when to call it and with what arguments; the runtime executes it and feeds the result back into the manager's context.",
      code: PH_CODE,
      whereToStart: PH_WHERE_TO_START,
      commonTraps:
        "Validate tool inputs, since the model can pass malformed or unsafe arguments. Handle failures and timeouts gracefully so one slow tool doesn't block the manager. Keep results concise, because every tool result is read back into the manager's context window. Scope permissions narrowly and give a tool only the access its job requires. Common pitfall: exposing too many tools to one agent, which dilutes tool-choice accuracy.",
      whenToUse: PH_WHEN_TO_USE,
      ourModel: PH_OUR_MODEL,
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
  "plane-outbound": () => ({
    overview: {
      whatItIs:
        "This plane is a task dispatch — the orchestrator handing one domain-sized task to a manager. The plane's color matches the manager it's headed to.",
      whatItDoes:
        "It carries the orchestrator's instruction down to a manager, who will then work through it using its own tools.",
      connector: PH_CONNECTOR,
      example:
        "The orchestrator sends a 'analyze Q3 financials' task to the finance manager — that flight is this plane.",
    },
    advanced: {
      howItWorks:
        "In code this is the orchestrator calling a manager subagent (or tool) with a scoped task message. The 'flight' is one dispatch in the orchestrator's fan-out; the orchestrator awaits the manager's result before synthesizing.",
      code: PH_CODE,
      whereToStart: PH_WHERE_TO_START,
      commonTraps:
        "Make dispatches independent so managers can run in parallel. Include only the context a manager needs, since over-stuffing the payload wastes tokens. Tag each dispatch with an id so its returning result can be matched back.",
      whenToUse: PH_WHEN_TO_USE,
      ourModel: PH_OUR_MODEL,
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
  "plane-inbound": () => ({
    overview: {
      whatItIs:
        "This plane is a result returning — a manager handing its finished work back up to the orchestrator. Inbound flights are purple, the orchestrator's color.",
      whatItDoes:
        "It carries a manager's synthesized result home, where the orchestrator will combine it with the other managers' results.",
      connector: PH_CONNECTOR,
      example:
        "The finance manager finishes its analysis and sends the summary back up — that return trip is this plane.",
    },
    advanced: {
      howItWorks:
        "In code this is a manager subagent returning its result to the orchestrator. The orchestrator collects all manager results, then runs its final synthesis pass.",
      code: PH_CODE,
      whereToStart: PH_WHERE_TO_START,
      commonTraps:
        "Return structured results, not free text, so synthesis is reliable. Surface partial or failed results explicitly instead of silently dropping them. Keep results concise, since the orchestrator pays to read every one.",
      whenToUse: PH_WHEN_TO_USE,
      ourModel: PH_OUR_MODEL,
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
  "car-outbound": () => ({
    overview: {
      whatItIs:
        "This car is a tool call — a manager invoking one of its tools with a focused input. Its color matches the manager that made the call.",
      whatItDoes:
        "It carries a focused input from a manager to one of its tools, which will run and return a result.",
      connector: PH_CONNECTOR,
      example:
        "The data-analysis manager calls its database tool with 'pull the revenue table for Q3' — that trip is this car.",
    },
    advanced: {
      howItWorks:
        "In code this is a manager invoking a tool with a narrow input. It's one edge of the manager's fan-out; the manager awaits all tool results before synthesizing.",
      code: PH_CODE,
      whereToStart: PH_WHERE_TO_START,
      commonTraps:
        "Keep tool calls focused so tools stay simple and parallelizable. Throttle concurrent calls per tool to avoid overload, mirrored here as the road's car cap. Tag each call so its returning result can be matched back.",
      whenToUse: PH_WHEN_TO_USE,
      ourModel: PH_OUR_MODEL,
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
  "car-inbound": () => ({
    overview: {
      whatItIs:
        "This car is a tool result — a tool returning its output to the manager that called it. It's tinted the tool's lighter shade.",
      whatItDoes:
        "It carries a tool's output back to the manager, who will combine it with the other tool results.",
      connector: PH_CONNECTOR,
      example:
        "The database tool returns the Q3 revenue table to the data-analysis manager — that return trip is this car.",
    },
    advanced: {
      howItWorks:
        "In code this is a tool returning its result to the manager that called it. Once all of a manager's outstanding tool calls report back, the manager runs its synthesis pass and returns upward.",
      code: PH_CODE,
      whereToStart: PH_WHERE_TO_START,
      commonTraps:
        "Return structured, schema-validated results so manager synthesis is reliable. Make tools retry-safe so a manager can re-issue a failed call. Surface errors explicitly rather than returning empty results.",
      whenToUse: PH_WHEN_TO_USE,
      ourModel: PH_OUR_MODEL,
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
};
