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

const BODY: Record<ElementKind, (name: string) => Body> = {
  orchestrator: () => ({
    overview: {
      whatItIs:
        "The orchestrator is the lead agent — the one that receives the user's request and owns the overall plan, the way a project lead scopes a brief before delegating.",
      whatItDoes:
        "It decomposes the request into domain-sized tasks, dispatches each to the right manager, and synthesizes the managers' results into one final answer.",
      example:
        "Asked to 'put together a competitor report,' the orchestrator might send market research to one manager, financial analysis to another, and a summary task to a third — then stitch their results together.",
    },
    advanced: {
      components: [
        "Model — a capable LLM, since the orchestrator plans and synthesizes across domains",
        "System prompt — defines the available managers and the orchestrator's planning strategy",
        "Task decomposition — turns the request into manager-sized dispatches",
        "Manager registry — the set of managers it can dispatch to",
        "Final synthesis prompt — merges manager results into one coherent answer",
      ],
      implementation:
        "Build it as the top of an orchestrator-workers hierarchy: it calls managers (themselves sub-orchestrators), collects their structured results, and runs a synthesis pass. It never does atomic work itself — it plans, dispatches, and composes.",
      production: [
        "Cache the system prompt — it's large and stable across requests",
        "Add retries/backoff so one failing manager doesn't sink the whole request",
        "Set an overall timeout and a partial-results fallback",
        "Log every dispatch → result for observability",
        "Common pitfall: decomposing trivial requests that a single agent could answer directly",
      ],
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
  manager: (name) => ({
    overview: {
      whatItIs: `${name} is a domain-specific sub-orchestrator — a specialized agent that owns one slice of the problem, the way a team lead owns a project area.`,
      whatItDoes:
        "It receives a task dispatched from the orchestrator, works through it step by step, calls whichever of its tools it needs along the way, and synthesizes the results into a single answer it hands back up.",
      example:
        "Asked to 'summarize last quarter's support tickets,' it might call a database tool to pull the tickets, an analysis tool to cluster them by theme, then draft the summary itself — combining the tool results into one answer.",
    },
    advanced: {
      components: [
        "Model — the LLM that runs the manager's reasoning (capable, since it plans and synthesizes)",
        "System prompt — defines the manager's domain, its tools, and how to use them",
        "Tool-use logic — decides which tools to call, with what inputs, and in what order",
        "Tool registry — the set of tools this manager may call",
        "Result synthesis prompt — merges tool outputs into one coherent result",
      ],
      implementation:
        "Build it as a tool-using agent loop: the manager calls its tools, collects their structured results, and runs a synthesis pass. Managers never talk to peer managers — they only call their own tools and report back to the orchestrator (the no-peer-coordination rule, kept deliberately to avoid tangled cross-team dependencies).",
      production: [
        "Cache the system prompt — it's stable across calls and large",
        "Add retries with backoff on tool failures so one flaky tool doesn't sink the cycle",
        "Set a synthesis timeout / safety cap so a stuck tool call can't block the manager forever",
        "Log call → result per tool for observability",
        "Common pitfall: over-calling tools on trivial tasks — every tool call adds latency and cost",
      ],
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
      example:
        "A research manager hands its web-search tool the query 'recent EU AI regulation,' and the tool returns a list of source links — nothing more.",
    },
    advanced: {
      components: [
        "Interface — a name plus an input schema the model can read and fill in",
        "Capability — the underlying thing it does (an API call, a DB query, code execution)",
        "Output contract — the structured result it hands back to the caller",
        "Error handling — how failures and timeouts are surfaced to the manager",
      ],
      implementation:
        "Build it as a well-described function the agent runtime can call: a clear name, a typed input schema, and a structured return value. The model decides when to call it and with what arguments; the runtime executes it and feeds the result back into the manager's context.",
      production: [
        "Validate tool inputs — the model can pass malformed or unsafe arguments",
        "Handle failures and timeouts gracefully so one slow tool doesn't block the manager",
        "Keep results concise — every tool result is read back into the manager's context window",
        "Scope permissions narrowly — give a tool only the access its job requires",
        "Common pitfall: exposing too many tools to one agent — it dilutes tool-choice accuracy",
      ],
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
      example:
        "The orchestrator sends a 'analyze Q3 financials' task to the finance manager — that flight is this plane.",
    },
    advanced: {
      components: [
        "Payload — the task description + any context the manager needs",
        "Routing — which manager handles this domain (encoded here as the destination)",
        "Contract — the structured task shape the manager expects",
      ],
      implementation:
        "In code this is the orchestrator calling a manager subagent (or tool) with a scoped task message. The 'flight' is one dispatch in the orchestrator's fan-out; the orchestrator awaits the manager's result before synthesizing.",
      production: [
        "Make dispatches independent so managers can run in parallel",
        "Include only the context a manager needs — over-stuffing the payload wastes tokens",
        "Tag each dispatch with an id so its returning result can be matched back",
      ],
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
      example:
        "The finance manager finishes its analysis and sends the summary back up — that return trip is this plane.",
    },
    advanced: {
      components: [
        "Result — the manager's synthesized output for its domain",
        "Correlation id — ties this result back to the dispatch that triggered it",
        "Status — success / partial / error, so the orchestrator can react",
      ],
      implementation:
        "In code this is a manager subagent returning its result to the orchestrator. The orchestrator collects all manager results, then runs its final synthesis pass.",
      production: [
        "Return structured results, not free text, so synthesis is reliable",
        "Surface partial/failed results explicitly instead of silently dropping them",
        "Keep results concise — the orchestrator pays to read every one",
      ],
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
      example:
        "The data-analysis manager calls its database tool with 'pull the revenue table for Q3' — that trip is this car.",
    },
    advanced: {
      components: [
        "Input — the focused argument passed to the tool",
        "Target tool — which capability is being called",
        "Contract — the result shape the manager expects back",
      ],
      implementation:
        "In code this is a manager invoking a tool with a narrow input. It's one edge of the manager's fan-out; the manager awaits all tool results before synthesizing.",
      production: [
        "Keep tool calls focused so tools stay simple and parallelizable",
        "Throttle concurrent calls per tool to avoid overload (mirrored here as the road's car cap)",
        "Tag each call so its returning result can be matched back",
      ],
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
      example:
        "The database tool returns the Q3 revenue table to the data-analysis manager — that return trip is this car.",
    },
    advanced: {
      components: [
        "Result — the tool's output",
        "Correlation id — ties this result back to the tool call that triggered it",
        "Status — success / error, so the manager can retry if needed",
      ],
      implementation:
        "In code this is a tool returning its result to the manager that called it. Once all of a manager's outstanding tool calls report back, the manager runs its synthesis pass and returns upward.",
      production: [
        "Return structured, schema-validated results so manager synthesis is reliable",
        "Make tools retry-safe so a manager can re-issue a failed call",
        "Surface errors explicitly rather than returning empty results",
      ],
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
};
