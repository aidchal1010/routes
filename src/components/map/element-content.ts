// PLACEHOLDER content — real educational copy lands in Layer 2 (Step 7–9).
// Builds a PanelContent for a clicked world element, keyed by element kind. The text is
// realistic enough to judge the panel's feel, but is intentionally generic per type
// (not yet per-instance) until Layer 2 writes the real per-element copy.

import type { PanelContent } from "./InfoPanel";

type ElementKind =
  | "orchestrator"
  | "manager"
  | "worker"
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
        "It receives a task dispatched from the orchestrator, breaks it into smaller subtasks, sends those to its own workers, and synthesizes their results into a single answer it hands back up.",
      example:
        "Asked to 'summarize last quarter's support tickets,' it might dispatch one worker to pull the tickets, one to cluster them by theme, and one to draft the summary — then stitch the three results together.",
    },
    advanced: {
      components: [
        "Model — the LLM that runs the manager's reasoning (capable, since it plans and synthesizes)",
        "System prompt — defines the manager's domain, its workers, and its decomposition strategy",
        "Decomposition logic — turns an incoming task into a set of worker subtasks",
        "Worker registry — the set of workers this manager may dispatch to",
        "Result synthesis prompt — merges worker outputs into one coherent result",
      ],
      implementation:
        "Build it as its own orchestrator-workers loop: the manager calls worker subagents, collects their structured results, and runs a synthesis pass. Managers never talk to peer managers — they only fan out to their own workers and report back to the orchestrator (the no-peer-coordination rule, kept deliberately to avoid tangled cross-team dependencies).",
      production: [
        "Cache the system prompt — it's stable across calls and large",
        "Add retries with backoff on worker failures so one flaky worker doesn't sink the cycle",
        "Set a synthesis timeout / safety cap so a stuck worker can't block the manager forever",
        "Log dispatch → result per worker for observability",
        "Common pitfall: over-decomposing trivial tasks — spawning workers adds latency and cost",
      ],
      references: [
        {
          label: "Anthropic — Building Effective Agents",
          url: "https://www.anthropic.com/research/building-effective-agents",
        },
      ],
    },
  }),
  worker: () => ({
    overview: {
      whatItIs:
        "A worker is a leaf agent — it does one atomic unit of work and reports the result back to its manager. It doesn't plan or delegate.",
      whatItDoes:
        "It receives a focused subtask, runs the tools it needs (a search, a query, a calculation, a draft), and returns a structured result.",
      example:
        "A worker might be handed 'fetch the 50 most recent support tickets,' call the database tool, and return the rows — nothing more.",
    },
    advanced: {
      components: [
        "Model — often a smaller/faster LLM, since the task is narrow",
        "System prompt — scopes the worker to its single responsibility",
        "Tools — the specific capabilities it needs (search, DB query, code execution, etc.)",
        "Output contract — the structured shape it returns to its manager",
      ],
      implementation:
        "Build it as a focused tool-using agent: tight system prompt, only the tools it needs, and a clear output schema. Keep it stateless where possible so it's cheap to retry and parallelize.",
      production: [
        "Prefer a smaller model — workers are the high-volume tier, so cost and latency add up",
        "Validate the output against its schema before returning it upward",
        "Make it idempotent/retry-safe so the manager can re-dispatch on failure",
        "Constrain tool access to only what the task needs",
        "Common pitfall: giving a worker too broad a remit — that's a manager's job, not a worker's",
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
        "It carries the orchestrator's instruction down to a manager, who will then break it apart for its own workers.",
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
        "This car is a subtask — a manager handing one atomic piece of work to a worker. Its color matches the manager that dispatched it.",
      whatItDoes:
        "It carries a focused instruction from a manager to one of its workers, who will execute it and return a result.",
      example:
        "The finance manager asks a worker to 'pull the revenue table for Q3' — that trip is this car.",
    },
    advanced: {
      components: [
        "Subtask — the single, focused unit of work for one worker",
        "Tool hint — which capability the worker should use, if relevant",
        "Contract — the result shape the manager expects back",
      ],
      implementation:
        "In code this is a manager calling a worker subagent/tool with a narrow task. It's one edge of the manager's fan-out; the manager awaits all worker results before synthesizing.",
      production: [
        "Keep subtasks atomic so workers stay simple and parallelizable",
        "Throttle concurrent dispatches per worker to avoid overload (mirrored here as the road's car cap)",
        "Tag each subtask so its returning result can be matched back",
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
        "This car is a result — a worker returning its finished piece of work to its manager. It's tinted the worker's lighter shade.",
      whatItDoes:
        "It carries a worker's output back to the manager, who will combine it with the other workers' results.",
      example:
        "The worker returns the Q3 revenue table to the finance manager — that return trip is this car.",
    },
    advanced: {
      components: [
        "Result — the worker's atomic output",
        "Correlation id — ties this result back to the subtask that triggered it",
        "Status — success / error, so the manager can retry if needed",
      ],
      implementation:
        "In code this is a worker subagent returning its result to its manager. Once all of a manager's outstanding workers report back, the manager runs its synthesis pass and returns upward.",
      production: [
        "Return structured, schema-validated results so manager synthesis is reliable",
        "Make workers retry-safe so a manager can re-dispatch a failed subtask",
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
