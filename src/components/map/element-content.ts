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
      connector: `Watch the planes leaving the airport. Each one carries a task to one of the four specialized managers around it: Research, Data-Analysis, Code, and Communication-Action. The purple planes arriving back are the managers reporting their results.`,
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
      code: `# Illustrative pseudo-code. Check your AI provider's current SDK for exact API.

# A tool is DEFINED with a clear name, description, and input shape.
search_tool = {
    "name": "web_search",
    "description": "Search the web for current information. Use this when a fact "
                   "might have changed recently or is not already known.",
    "input_schema": {"query": "string"},
}

# The MODEL decides to call the tool and produces a structured request.
# YOUR code runs the real function and returns the result to the model.
def execute_tool(call):
    if call.name == "web_search":
        return real_search_api(call.query)   # the actual work happens here
    # ...handle the system's other tools the same way`,
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
  // VEHICLE CONTENT — FINAL LOCKED (TODO.md "VEHICLE CONTENT — FINAL LOCKED"). Lighter
  // shape: overview has no example; advanced has no code and no whereToStart (vehicles
  // are operations you don't build). Prose verbatim.
  "plane-outbound": () => ({
    overview: {
      whatItIs: `In this world, the outbound planes are the colored aircraft leaving the airport for a manager. Each one represents a Task Dispatch: the orchestrator handing a single, self-contained piece of work to one of its managers. The plane is not a thing that sits anywhere. It is the moment of delegation itself, one task leaving the center and traveling to the manager chosen to handle it.`,
      whatItDoes: `When the orchestrator finishes planning, it sends one task to each manager it has chosen, and each of those hand-offs is an outbound plane. The plane carries everything the manager needs to begin: the objective, the expected format, and the boundaries of the job. Every task that goes out is answered by a result that comes back, so each outbound plane has a matching return plane later. The dispatch is one half of a round trip.`,
      connector: `Watch a plane leave the airport and fly to a manager. That single flight is one task being handed off. Its answer will return later as a purple plane coming back to the airport.`,
    },
    advanced: {
      howItWorks: `A task dispatch is a single call from the orchestrator to a manager, made in its own context window. The orchestrator usually sends several at once rather than one at a time, firing the whole batch of tasks in parallel so the managers can work simultaneously. Each dispatch carries a clear task description, and that description is the entire basis for the manager's work, so its quality decides how well the manager performs.`,
      commonTraps: `The most frequent mistake is sending a vague task. A dispatch that says only "research competitors" gives the manager too little to work with, and the manager either guesses at the boundaries or wanders off course. A good dispatch names the objective, the format of the answer, and what is in and out of scope.

The second trap is sending too many dispatches at once. Parallel hand-offs are powerful, though each one costs a full manager run, so dispatching more tasks than the request actually needs is a direct waste of tokens and time.`,
      whenToUse: `A task dispatch is the right move whenever the orchestrator has a piece of work that a specialized manager can handle on its own. If a request splits into independent parts, each part becomes a dispatch. If the work cannot be separated, or one small answer would do, there is nothing to dispatch and a single call is enough.`,
      ourModel: `A task dispatch maps to the lead agent calling a subagent in Anthropic's multi-agent research system. The pattern is general: a coordinating model handing a scoped task to a worker model, and it applies to any capable model.`,
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
  "plane-inbound": () => ({
    overview: {
      whatItIs: `In this world, the inbound planes are the purple aircraft flying back to the airport from a manager. Each one represents a Result Return: a manager sending its finished work back to the orchestrator. Where the outbound plane carried a task out, the return plane carries the answer home. It is the second half of every dispatch, the response to a request that went out earlier.`,
      whatItDoes: `When a manager finishes its work, it condenses everything it did into a single clean summary and sends that back to the orchestrator. That return trip is the inbound plane. The summary is deliberately compact. The manager does not send back everything its tools produced, only the digested result the orchestrator actually needs. This compression is quiet but important: it is what keeps the orchestrator's context clear enough to combine many managers' answers without overflowing.`,
      connector: `Watch a purple plane arrive at the airport. That is one manager reporting its finished work. Somewhere earlier, a colored plane left carrying the task this result answers.`,
    },
    advanced: {
      howItWorks: `A result return is the value a manager hands back when its call completes. The important detail is what it contains: a condensed summary, not the manager's full working history. A manager may have made dozens of tool calls and read a great deal of material, and all of that stays in the manager's own context window. What returns to the orchestrator is the distilled conclusion. That selective return is the mechanism that lets the system process far more total information than the orchestrator's context could hold on its own.`,
      commonTraps: `The most frequent mistake is returning too much. When a manager sends back its full output instead of a summary, it floods the orchestrator's context and undoes the benefit of the separate window. A return should be the conclusion, not the transcript.

The second trap is returning too little. A summary so terse that it drops key facts forces the orchestrator to dispatch again to recover them, which is slower than returning the right detail the first time. The skill is in returning exactly what the orchestrator needs and nothing more.`,
      whenToUse: `Every dispatched task ends in a result return, so it is less a choice than a guarantee: any time a manager is given work, its answer comes back this way. The design decision is not whether to return, but how much to include in what comes back.`,
      ourModel: `A result return maps to a subagent returning its findings to the lead agent in Anthropic's multi-agent research system. The principle of returning a condensed result rather than raw work is general and applies to any capable model.`,
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
  "car-outbound": () => ({
    overview: {
      whatItIs: `In this world, the outbound cars are the small vehicles driving from a manager to one of its tools. Each one represents a Tool Call: a manager asking a single tool to do its specific job. If the plane is how the orchestrator delegates to a manager, the car is how a manager reaches for a capability. It is a request traveling a shorter distance, from a manager to the tool right beside it.`,
      whatItDoes: `When a manager decides it needs something concrete, a search, a calculation, a file, it calls the right tool, and that call is the outbound car. The car carries the specific input the tool needs to do its one job. Just like a dispatch, every tool call is answered: each outbound car has a matching car that brings the result back. A manager often sends several at once when it needs more than one tool.`,
      connector: `Watch a car drive from a manager out to one of the smaller buildings. That trip is the manager calling a tool. The car that returns is the tool's answer coming back.`,
    },
    advanced: {
      howItWorks: `A tool call is a structured request the manager's model produces when it decides it needs a tool. The request names the tool and provides the specific arguments to run it with. Your code receives that request, runs the real function behind the tool, and the result returns to the manager. A manager can issue several tool calls at once when its tasks are independent, the same parallel pattern the orchestrator uses, one level down.`,
      commonTraps: `The most frequent mistake is an unclear tool definition, which leads the model to call the tool with the wrong arguments or at the wrong time. The call is only as good as the tool's description and input format.

The second trap is calling tools in sequence when they could run at once. If a manager needs three independent lookups, calling them one after another wastes time that a parallel batch would save. Look for independent calls that can be fired together.`,
      whenToUse: `A tool call is the right move whenever the manager needs something it cannot produce from its own reasoning: live information, an exact computation, a real file, an external action. If the manager can answer from what it already has, no call is needed. The moment it needs the outside world, it makes a call.`,
      ourModel: `A tool call maps directly to tool use in any agent framework: the model emitting a structured request to run a defined function. This is a standard, general capability and works with any capable model that supports tools.`,
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
  "car-inbound": () => ({
    overview: {
      whatItIs: `In this world, the inbound cars are the small vehicles returning from a tool back to a manager. Each one represents a Tool Result: a tool handing back the answer to the call it was given. It is the response half of every tool call, the outcome of the one job the tool was asked to do, traveling back to the manager that asked.`,
      whatItDoes: `When a tool finishes its job, it returns its result, and that return trip is the inbound car. The result is whatever the tool produced: the search hits, the query rows, the output of the code it ran. The manager takes that result, along with the results of any other tools it called, and uses them to do its work. Every tool call ends in one of these returns, which is why you always see cars traveling in both directions along a road.`,
      connector: `Watch a car come back from a tool to its manager. That is a result being delivered. It answers a call that drove out moments earlier.`,
    },
    advanced: {
      howItWorks: `A tool result is the value your code returns to the model after running a tool. The model receives it back into its context and uses it to decide what to do next, whether that is calling another tool or finishing its task. A tool returns raw, factual output: the data it was asked to fetch or produce. It does not interpret or summarize. Making sense of the result is the manager's job, not the tool's, which keeps the tool simple and predictable.`,
      commonTraps: `The most frequent mistake is returning messy or oversized output. If a tool hands back a huge raw blob, it fills the manager's context and makes the model's job harder. Return what is useful, in a form the model can read.

The second trap is hiding failures. When a tool errors, it should return a clear, readable error rather than nothing or a cryptic code, so the model can recognize what happened and react instead of guessing.`,
      whenToUse: `A tool result happens automatically whenever a tool is called, so like the result return, it is a guarantee rather than a choice. The decision that matters is the shape of what comes back: clean and usable, or raw and hard to work with.`,
      ourModel: `A tool result maps to the tool-use response in any agent framework: the output of a function call returning to the model. It is a standard, general mechanism and works with any capable model that supports tools.`,
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
};
