// Content for the Build Guide page. Structured like element-content.ts so the prose is
// data, consumed by a dumb presentational component (BuildGuide.tsx). Voice follows the
// locked Layer 2 rules: model-neutral, no em-dashes, no "But" openers, no product names.
// The per-element panels teach each piece on its own; this guide is the system-wide
// assembly manual and deliberately consolidates (one model table, one vocabulary table)
// rather than repeating per element.

export type ModelRow = { layer: string; model: string; why: string };
export type VocabRow = { ours: string; theirs: string; note: string };
export type Reference = { label: string; url: string };

// Ordered block for the prose-plus-code sections (How a request flows, The prompts, Making
// it run, From one loop to the system). The renderer routes by `lang`: "python" goes through
// highlightCode (the established palette.syntax colors); "text" and "shell" render as a plain
// <pre>, never through the highlighter.
export type Block =
  | { kind: "p"; text: string }
  | { kind: "code"; lang: "python" | "text" | "shell"; code: string };

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

// Domain prompt example (The prompts). Plain text fence -> renders as a plain <pre>.
const PROMPT_EXAMPLE = `You are the research manager. Your job is to gather and verify
information for one task handed to you by the orchestrator.

You have three tools: web search, document retrieval, and a source
reader. Use them to find evidence; do not guess from memory.

Work only on the task you were given. Do not take on other domains.
When you have enough to answer, stop and return a short summary with
the sources you used.`;

// Setup commands (Making it run). Shell fences -> plain <pre>, never highlighted.
const PIP_CMD = `pip install anthropic`;
const EXPORT_CMD = `export ANTHROPIC_API_KEY=your-key-here`;

// The following python snippets render through highlightCode. No "#" inside any string
// literal: the highlighter treats the first "#" on a line as a comment.
const HELLO_CODE = `# Illustrative example with one provider. Check your provider's current SDK.
import anthropic

client = anthropic.Anthropic()       # reads the key from the environment

reply = client.messages.create(
    model="claude-opus-4-8",         # swap in your provider's model name
    max_tokens=1024,
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)
print(reply.content)`;

const WEATHER_TOOL_CODE = `# Illustrative example with one provider. Check your provider's current SDK.
weather_tool = {
    "name": "get_weather",
    "description": "Get the current weather for a city.",
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    },
}`;

const TOOL_LOOP_CODE = `# Illustrative example with one provider. Check your provider's current SDK.
def get_weather(city):
    return "18 degrees and clear"        # your real implementation goes here

messages = [{"role": "user", "content": "What is the weather in Bogota?"}]

while True:
    reply = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=1024,
        tools=[weather_tool],
        messages=messages,
    )
    messages.append({"role": "assistant", "content": reply.content})

    calls = [b for b in reply.content if b.type == "tool_use"]
    if not calls:
        break                            # no tool wanted: the answer is final

    results = []
    for call in calls:
        output = get_weather(call.input["city"])
        results.append({
            "type": "tool_result",
            "tool_use_id": call.id,
            "content": output,
        })
    messages.append({"role": "user", "content": results})

print(reply.content)`;

const MANAGER_SKELETON = `# manager.py. Illustrative skeleton. Check your provider's current SDK.
def run_manager(domain_prompt, tools, task):
    messages = [{"role": "user", "content": task}]
    while True:
        reply = client.messages.create(
            model="claude-sonnet-4-6",       # a capable, cost-efficient model
            max_tokens=1024,
            system=domain_prompt,            # the domain prompt from prompts/
            tools=tools,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": reply.content})
        calls = [b for b in reply.content if b.type == "tool_use"]
        if not calls:
            return text_of(reply)            # no tool wanted: this is the summary
        messages.append({"role": "user", "content": run_tools(calls)})`;

const ORCHESTRATOR_SKELETON = `# orchestrator.py. Illustrative skeleton. Check your provider's current SDK.
def plan(request):
    reply = client.messages.create(
        model="claude-opus-4-8",             # your strongest model
        max_tokens=1024,
        system=PLANNING_PROMPT,
        messages=[{"role": "user", "content": request}],
    )
    return parse_tasks(reply)                 # the planning prompt returns a parseable list

def synthesize(request, summaries):
    reply = client.messages.create(
        model="claude-opus-4-8",             # your strongest model
        max_tokens=2048,
        system=SYNTHESIS_PROMPT,
        messages=[{"role": "user", "content": combine(request, summaries)}],
    )
    return text_of(reply)

def run_orchestrator(request):
    subtasks = plan(request)                 # e.g. a list of (domain, task) pairs
    summaries = []
    for domain, task in subtasks:            # step 3: one manager at a time
        summaries.append(run_manager(PROMPTS[domain], TOOLS[domain], task))
    return synthesize(request, summaries)`;

const MAIN_CODE = `# main.py
request = "Compare last quarter's sales to the same quarter last year."
print(run_orchestrator(request))`;

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

  howRequestFlows: {
    blocks: [
      {
        kind: "p",
        text: `The file layout shows where the pieces sit. This is what happens when a request runs through them, and it is the motion the world animates the whole time.`,
      },
      {
        kind: "p",
        text: `A request arrives at the orchestrator. Its first job is to plan: read the request and break it into a few independent tasks, one for each domain it needs. It then dispatches those tasks, sending each to the manager that owns that domain. In the world this is the planes leaving the airport, one Task Dispatch per manager.`,
      },
      {
        kind: "p",
        text: `Each manager works its task alone. To get real information it calls its tools, one at a time: a search, a query, a file read. Every tool call is a car leaving the manager for a tool building, and every result is a car coming back. The manager keeps calling tools until it has what it needs, then writes a short summary of its findings.`,
      },
      {
        kind: "p",
        text: `When a manager finishes, it sends that summary back up to the orchestrator, the return plane flying inbound as a Result Return. The orchestrator waits until every manager it dispatched has reported back.`,
      },
      {
        kind: "p",
        text: `With all the results in hand, the orchestrator does its second hard job: synthesis. It combines the separate summaries into one answer, resolves anything that overlaps or conflicts, and returns the final response. The run is complete, and the world settles until the next request starts the cycle again.`,
      },
      {
        kind: "p",
        text: `Two things are worth holding onto. The managers never wait on each other, only on their own tools, which is why their work can run at the same time. And the orchestrator is the only piece that sees the request end to end: it plans at the top and synthesizes at the bottom, and everything between is delegation.`,
      },
    ] as Block[],
  },

  fileLayout: {
    tree: FILE_TREE,
    note: `manager.py is a single file, not four. It takes a domain prompt and a toolset and runs the same loop for any domain, so the four manager buildings in the world are four instances of this one definition, exactly as the world renders one Manager component four times. Adding a domain means adding a prompt and a toolset, not a new file.`,
  },

  prompts: {
    blocks: [
      {
        kind: "p",
        text: `The prompts/ directory is small, and it is where a lot of the system's behavior actually lives. The architecture decides who calls whom; the prompts decide how well each step is done.`,
      },
      {
        kind: "p",
        text: `There are three kinds. The planning prompt teaches the orchestrator how to split a request into clean, independent tasks and how to write each task so a manager can act on it without asking follow-up questions. The synthesis prompt teaches it how to fold the returned summaries into one answer rather than stapling them together. The domain prompts, one per manager, tell each manager what it is responsible for, which tools it has, and when to stop.`,
      },
      {
        kind: "p",
        text: `A domain prompt is short and direct. The research manager's might read:`,
      },
      { kind: "code", lang: "text", code: PROMPT_EXAMPLE },
      {
        kind: "p",
        text: `Notice what the prompt fixes in place: the manager's role, its tools, its boundary (one domain, no wandering), and its stopping condition. Keeping this in a text file, separate from the code, lets you tune behavior by editing prose instead of logic, which is where most of the improvement comes from once the wiring works.`,
      },
    ] as Block[],
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

  makingItRun: {
    blocks: [
      {
        kind: "p",
        text: `Everything above is structure. This is the single piece of real code under all of it: one model call, with one tool the model can choose to use. A manager calling a tool is exactly this loop, run inside a domain. Get it working once by hand and the rest of the system is repetition and coordination.`,
      },
      {
        kind: "p",
        text: `The example below uses one provider to keep it concrete. The shape is the same across providers: you set a key, create a client, send messages, and pass tools. Swap the SDK, the client, and the model name for the ones your provider documents and the rest reads the same.`,
      },
      {
        kind: "p",
        text: `First, the setup. Install your provider's SDK, and get an API key from its console, the web dashboard where you sign up and create one.`,
      },
      { kind: "code", lang: "shell", code: PIP_CMD },
      {
        kind: "p",
        text: `Treat the key like a password: load it from an environment variable, never paste it into your source, and never commit it. Most SDKs read it from the environment, so you set it once and the client picks it up. The line below sets it for the current terminal only, so opening a new terminal means setting it again, or you add it to your shell profile to make it stick.`,
      },
      { kind: "code", lang: "shell", code: EXPORT_CMD },
      {
        kind: "p",
        text: `Then the simplest possible call, to confirm the key works and you can reach the model:`,
      },
      { kind: "code", lang: "python", code: HELLO_CODE },
      {
        kind: "p",
        text: `That is a plain question and answer. To make the model do something, you give it a tool: a function you wrote, described in plain language so the model knows when to reach for it. You define its name, what it does, and the shape of its input.`,
      },
      { kind: "code", lang: "python", code: WEATHER_TOOL_CODE },
      {
        kind: "p",
        text: `You pass that tool in with the request. The model reads the request and, if the tool fits, hands back a structured call naming the tool and its input. Your code runs the real function, then sends the result back so the model can use it.`,
      },
      { kind: "code", lang: "python", code: TOOL_LOOP_CODE },
      {
        kind: "p",
        text: `That loop is the whole engine. The model asks for a tool, you run it, you send the result back, and it continues until it has a final answer. A manager is this exact loop pointed at one domain with a handful of tools. An orchestrator is the same call again, where the tools it reaches for are the managers. Once the loop is clear to you, you are not learning a new pattern at each layer, you are reusing this one.`,
      },
    ] as Block[],
  },

  fromLoop: {
    blocks: [
      {
        kind: "p",
        text: `The loop in the last section is one manager doing one task. The whole system is that loop wrapped in a function, with an orchestrator above it that plans the tasks and combines the answers. Here is the skeleton, the same pieces as the file tree, small enough to read in one sitting. The lowercase helpers (text_of, run_tools, parse_tasks, combine) are small pieces you fill in; the capitalized names (PROMPTS, TOOLS, and the prompt constants) are your prompt files and toolsets, loaded once.`,
      },
      {
        kind: "p",
        text: `A manager is the loop you already wrote, with its domain prompt and tools passed in. That is all manager.py is.`,
      },
      { kind: "code", lang: "python", code: MANAGER_SKELETON },
      {
        kind: "p",
        text: `The orchestrator does three things: plan, dispatch, synthesize. Plan and synthesize are model calls of their own, which is why the orchestrator runs the strongest model.`,
      },
      { kind: "code", lang: "python", code: ORCHESTRATOR_SKELETON },
      {
        kind: "p",
        text: `The entry point is small. It takes a request and runs the orchestrator.`,
      },
      { kind: "code", lang: "python", code: MAIN_CODE },
      {
        kind: "p",
        text: `That is the whole system in skeleton, and the pieces map straight onto the assembly order. run_manager is steps 1 and 2. The loop inside run_orchestrator is the sequential dispatch of step 3, calling one manager at a time. Step 4 is that same dispatch with the run_manager calls running at the same time instead of one after another, which you do with your language's async or concurrency tools. Plan memory (step 6) drops in as one line: save the result of plan(request) before the dispatch, so a long run can reload it during synthesize.`,
      },
    ] as Block[],
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
        why: "A tool is plain code the manager calls. It runs a function and returns a result, nothing more.",
      },
    ] as ModelRow[],
    example: `Anthropic's multi-agent research system uses this split directly: a stronger lead model with cheaper subagent models beneath it, for example Opus as the lead and Sonnet as the subagents.`,
    tradeoff: `This architecture spends far more tokens than a single call, around fifteen times the tokens of a single chat in Anthropic's reporting. The strong-lead, cheaper-workers split keeps the cost in check while preserving quality where it matters. Reach for the whole pattern only when the work is big enough to justify it.`,
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
    metaNote: `This site itself was built with AI coding assistance, which is a fair example of the balance. The assistant handled much of the construction, and understanding the architecture is what made it work.`,
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
    {
      label: "Tool use with Claude, Anthropic API docs",
      url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview",
    },
  ] as Reference[],
};
