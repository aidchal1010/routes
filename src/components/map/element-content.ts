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

// The four manager buildings. The shared manager entry selects one Specific Domain
// block by the clicked building's id, threaded through from Map.tsx.
type ManagerId = "manager-a" | "manager-b" | "manager-c" | "manager-d";
type SpecificDomain = {
  domainName: string; // short label for the tab, e.g. "Research", "Comm-Action"
  domain: string;
  tools: string;
  whenToRoute: string;
  example: string;
};

export function getPlaceholderContent(
  kind: ElementKind,
  elementName: string,
  accentColor: string,
  elementId?: string, // only managers use this — selects the per-domain block
): PanelContent {
  return { elementName, accentColor, ...BODY[kind](elementName, elementId) };
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

// MANAGER CONTENT — FINAL LOCKED (TODO.md "MANAGER CONTENT — FINAL LOCKED").
// One shared entry serves all four managers: a shared Overview and a shared Advanced,
// plus a per-manager Specific Domain block selected by the clicked building's id.
// Prose is the locked text verbatim. `code` is a clearly-marked placeholder — paste
// the final run_manager pseudo-code here (NO '#' inside string literals — highlighter
// treats '#' as a line comment).
const MANAGER_OVERVIEW = {
  whatItIs: `In this world, the managers are the four colored buildings around the airport, one in each direction. Each one represents a specialized subagent: an AI model that the orchestrator hands a whole slice of the problem to. A manager works the same way the orchestrator does, just at a smaller scale. It takes the task it was given, breaks it into concrete steps, and reaches for the tools it needs to carry them out. The difference is focus. The orchestrator sees the entire request, while a manager sees only its piece and goes deep on it.`,
  whatItDoes: `When a task arrives from the orchestrator, the manager reads it and decides which of its tools to use. It sends those tools out to do the concrete work, waits for them to report back, and gathers the results. Once it has what it needs, it does its own small synthesis, combining the tool results into a single clean answer, and sends that answer back to the orchestrator. A manager never passes raw tool output straight up the chain. Its job is to do the work of its domain and return something digested and useful.`,
  connector: `Watch the cars driving out from a manager to the smaller buildings around it. Each car is the manager calling one of its tools, and each returning car is a result coming back. When the manager has everything it needs, it sends a plane back to the airport carrying its finished answer.`,
};

// Swaps by manager id. Labels (Domain / Its tools / When to route here / Example) are
// supplied by the panel, so the prose here drops the inline "Domain:" style prefixes.
const MANAGER_DOMAINS: Record<ManagerId, SpecificDomain> = {
  "manager-a": {
    domainName: "Research",
    domain: `The Research manager gathers and makes sense of information. It is the one you send out into the world to find things: facts, sources, context, anything the system does not already know. Its work is mostly about breadth, casting a wide net and then narrowing down to what actually matters.`,
    tools: `Web search, document retrieval, and a source reader. Search finds candidate sources, retrieval pulls the promising ones in full, and the reader digests them into usable notes.`,
    whenToRoute: `Send a task to the Research manager when the answer lives outside the system and has to be found before anything else can happen. Questions that start with "find out," "look into," or "what is the current state of" belong here.`,
    example: `Given the task "find the top three electric vehicle makers by sales," the Research manager runs several searches at once, pulls in the most credible sources, reads through them, and returns a short ranked list with the figures that back it up. The orchestrator never sees the dozens of pages it skimmed, only the clean findings.`,
  },
  "manager-b": {
    domainName: "Data-Analysis",
    domain: `The Data-Analysis manager works with structured data and numbers. Where Research finds information, this manager computes on it: querying, calculating, comparing, and turning raw figures into something a person can actually read.`,
    tools: `A database query tool, a code execution environment, and a chart generator. It pulls the data, runs analysis code over it, and renders the result into a visual when that makes the answer clearer.`,
    whenToRoute: `Send a task to the Data-Analysis manager when the work involves real numbers that need to be fetched, computed, or compared. Anything that sounds like "calculate," "compare the figures," or "show the trend" belongs here.`,
    example: `Given the task "compare these three companies by revenue growth," the Data-Analysis manager queries a database for the raw figures, runs code to compute the growth rates, generates a chart of the comparison, and returns the finished analysis. It hands back the conclusion and the chart, not the thousands of rows it started with.`,
  },
  "manager-c": {
    domainName: "Code",
    domain: `The Code manager reads and changes software. It is the one that touches a real codebase: understanding what is there, making edits, and checking that its changes actually work before reporting back.`,
    tools: `File read and write, a test runner, repository search, and a linter or type checker. It finds the relevant files, edits them, runs the tests, and checks its work for errors, often looping through these until the change holds.`,
    whenToRoute: `Send a task to the Code manager when the work means reading or modifying an actual codebase. Tasks like "fix the failing test," "add this feature," or "find where this function is used" belong here.`,
    example: `Given the task "fix the failing login test," the Code manager searches the repository for the relevant files, reads them, makes an edit, runs the test suite, and checks the result. If the test still fails, it tries again with its tools until it passes, then reports back whether the fix worked.`,
  },
  "manager-d": {
    domainName: "Comm-Action",
    domain: `The Communication-Action manager interacts with the outside world on your behalf. The other managers find, compute, and build. This one acts: it sends, schedules, and updates real systems, the steps that actually change something rather than just producing information.`,
    tools: `Email and messaging, a calendar, and a records system such as a CRM. It can reach out, find or book a time, and update the system of record to reflect what happened.`,
    whenToRoute: `Send a task to the Communication-Action manager when the work ends in a real action rather than an answer. Anything phrased as "send," "schedule," "notify," or "update the record" belongs here.`,
    example: `Given the task "schedule a follow-up with the client," the Communication-Action manager checks the calendar for an open slot, drafts and sends the invitation, updates the client's record to log the follow-up, and returns confirmation that it is done. The result is not a report, it is a change in the real world.`,
  },
};

const MANAGER_ADVANCED = {
  howItWorks: `A manager is a separate AI model call with its own independent context window, running a prompt scoped to its domain. It receives a task description from the orchestrator: an objective, an expected output format, and the boundaries of what it should and should not do. From there it operates like a small orchestrator of its own. It decides which tools to call, often calls several at once, reads what they return, and may call more before it is finished. When the work is done, it condenses everything into a summary for the orchestrator, the digested result rather than the raw tool output. That separate context window is the whole point. A manager can work through a large volume of tool results without ever crowding the orchestrator's context.`,
  code: `# Illustrative pseudo-code. Check your AI provider's current SDK for exact API.

# A manager runs in its OWN context window and calls tools to do real work.
def run_manager(task):
    # A capable, cost-efficient model is fine here. The orchestrator already
    # did the heavy planning; the manager handles focused, scoped work.
    response = ai.create(
        model="a capable, cost-efficient model",   # e.g. a mid-tier frontier model
        system=MANAGER_PROMPT_FOR_DOMAIN,          # a prompt scoped to this domain
        tools=DOMAIN_TOOLS,                        # the tools this manager is allowed to call
        input=task.description,                    # objective, output format, boundaries
    )
    # The model chooses which tools to call. The loop runs each one, feeds the
    # results back, and repeats until the manager is done, then returns a summary.
    return run_tool_loop(response)`,
  whereToStart: `Build one manager before you build four. Pick a single domain, write a focused prompt for it, give it one or two tools, and get the basic loop working on its own: receive a task, call a tool, return a summary. Do this before any orchestrator exists above it. A manager is really just a scoped agent with a small set of tools, and once one of them works end to end, the orchestrator is simply the thing that calls several of them at once. AI coding assistants are good at wiring up the tool-calling loop, but get one tool working by hand first so the call-and-result cycle is clear to you.`,
  commonTraps: `The most common mistake is letting a manager return everything its tools produced. When a manager passes raw output straight up to the orchestrator, it floods the orchestrator's context and erases the benefit of giving the manager its own context window in the first place. A manager has to summarize before it reports back. The second trap is a fuzzy task description. A manager given a vague assignment will wander outside its lane, so the task it receives needs clear boundaries about what belongs to it and what does not.

The other trap is tool sprawl. It is tempting to give a capable manager a large pile of tools, but more tools make its choices harder and its mistakes more frequent. A focused manager with a few well-chosen, domain-relevant tools is more reliable than one holding everything. Keep each manager's toolset tight.`,
  whenToUse: `You add a layer of managers when a single agent can no longer hold all the work in one context window, or when the problem splits into clear domains that each benefit from focused handling. If your task is small enough for one agent with a few tools, you do not need this layer at all. Reach for it only when the size of the work or the separation of domains makes the split worth the coordination it costs.`,
  ourModel: `What we call a "manager" is what Anthropic calls a subagent in their multi-agent research system. We use "manager" because it captures the role well: it manages a domain and the tools beneath it. Giving our managers their own tools is how we show the orchestrator-workers pattern composed, a subagent that is itself a small orchestrator over its own tools. The underlying idea is general and works with any capable model.`,
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
};

const BODY: Record<ElementKind, (name: string, id?: string) => Body> = {
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
  // All four managers share this one entry. The clicked building's id (threaded from
  // Map.tsx) selects the Specific Domain block; the `id in MANAGER_DOMAINS` guard
  // degrades to undefined on a missing/unknown id rather than indexing past the map.
  manager: (_name, id) => ({
    overview: MANAGER_OVERVIEW,
    specificDomain:
      id && id in MANAGER_DOMAINS ? MANAGER_DOMAINS[id as ManagerId] : undefined,
    advanced: MANAGER_ADVANCED,
  }),
  // TOOL CONTENT — FINAL LOCKED (TODO.md "TOOL CONTENT — FINAL LOCKED"). Prose verbatim.
  // No `example` — the tool's overview is What it is / What it does / Connector only.
  // `code` is a clearly-marked placeholder — paste the final search_tool dict +
  // execute_tool fn block here (NO '#' inside string literals — highlighter limitation).
  tool: () => ({
    overview: {
      whatItIs: `In this world, the tools are the small buildings clustered around each manager, the lighter-colored ones at the end of every road. A tool is a single, concrete capability that a manager can use: a web search, a database query, a code run, an email send. Tools are the simplest pieces in the system and the only ones that touch the world outside it. A tool does not think, plan, or make decisions. It does one well-defined job and hands back the result, which is exactly what makes it dependable.`,
      whatItDoes: `When a manager needs something real, a fact it does not have, a calculation it cannot do in its head, a file, an action in another system, it calls one of its tools. The tool takes the specific request, does its single job, and returns the result. A tool has no memory of the larger task and never talks to other tools. It answers the one call it was given and nothing more. That narrowness is the point: because a tool does exactly one thing, you can trust what it returns and reason about it easily.`,
      connector: `Watch the cars arriving at a tool from its manager. Each one is the manager asking the tool to do its job, and each car heading back is the tool returning a result. The tool itself never moves. It waits to be called, does its work, and answers.`,
    },
    advanced: {
      howItWorks: `A tool is a function the AI model is allowed to call. You define it with a name, a description of what it does, and the shape of the input it expects. During a run, when the model decides it needs that capability, it produces a structured request to call the tool with specific arguments. Your code receives that request, runs the real function behind it, hitting a search API, querying a database, executing code, and returns the result to the model. The model never runs anything itself. It asks for the call, your code does the work, and the result comes back into the model's context. How well a tool works depends heavily on how clearly you describe it, since the model decides when and how to use it based entirely on that description.`,
      // PLACEHOLDER — paste the final search_tool dict + execute_tool fn block here.
      code: `# Final search_tool + execute_tool pseudo-code pending — paste the locked block here.
# Check your AI provider's current SDK for exact API.`,
      whereToStart: `Tools are the easiest part to build first, and a good place to begin the whole system. Pick one real capability, a web search, a calculator, a database lookup, and define it with a precise name and a clear description. Wire it to a single AI call and watch the model decide when to reach for it. Get one tool working in a plain back-and-forth before you build any managers or an orchestrator above it. Everything higher in the system is just the coordination of tool calls like this one. AI coding assistants are especially helpful here, but write one tool definition by hand first so the call-and-result shape is clear to you.`,
      commonTraps: `The most frequent mistake is a weak description. The model only knows what a tool does from how you describe it, so a vague description leads to a misused tool. Write the description the way you would document a function for a new teammate, plainly and completely. Anthropic found they spent more time refining their tool descriptions than tuning the main prompt, which is a good sign of where the effort actually pays off. A close second is an ambiguous input format. If a tool can be called in two slightly different ways, the model will eventually pick the wrong one, so make the input hard to misread.

The last trap is asking a single tool to do too much. A tool that tries to handle several jobs is harder for the model to use correctly than a few focused tools that each do one thing. When a tool starts growing extra responsibilities, that is usually a sign it should be split. Keep each tool narrow and predictable.`,
      whenToUse: `You reach for a tool whenever an agent has to touch something real: get live information, run an exact calculation, read or change a file, or take an action in another system. If a task can be answered from the model's own knowledge, it may need no tools at all. The moment it needs something current, exact, or external, that is the moment a tool earns its place.`,
      ourModel: `What we show as "tools" are exactly what the source material calls tools: the concrete capabilities an agent calls to get something done. In some diagrams these leaf capabilities are drawn as another layer of small agents, but we follow the way real systems are built and treat them as tools, defined functions the model invokes rather than independent reasoners. The idea is general and works with any capable model.`,
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
