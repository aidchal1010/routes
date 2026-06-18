# Build Guide

How to build the whole system the world shows: one orchestrator, a set of managers that each own a domain, and the tools beneath them. The element panels explain each piece on its own. This guide is the assembly manual for putting them together.

## What you're building

At the top is a single orchestrator. It receives the request, breaks it into independent tasks, and hands each one to a manager. Each manager is a specialized agent with its own context window and its own tools, and it works its task without talking to the other managers. Tools sit at the bottom: plain functions a manager calls to touch the real world. Results flow back up, manager to orchestrator, where they are combined into one answer.

## How a request flows

The file layout shows where the pieces sit. This is what happens when a request runs through them, and it is the motion the world animates the whole time.

A request arrives at the orchestrator. Its first job is to plan: read the request and break it into a few independent tasks, one for each domain it needs. It then dispatches those tasks, sending each to the manager that owns that domain. In the world this is the planes leaving the airport, one Task Dispatch per manager.

Each manager works its task alone. To get real information it calls its tools, one at a time: a search, a query, a file read. Every tool call is a car leaving the manager for a tool building, and every result is a car coming back. The manager keeps calling tools until it has what it needs, then writes a short summary of its findings.

When a manager finishes, it sends that summary back up to the orchestrator, the return plane flying inbound as a Result Return. The orchestrator waits until every manager it dispatched has reported back.

With all the results in hand, the orchestrator does its second hard job: synthesis. It combines the separate summaries into one answer, resolves anything that overlaps or conflicts, and returns the final response. The run is complete, and the world settles until the next request starts the cycle again.

Two things are worth holding onto. The managers never wait on each other, only on their own tools, which is why their work can run at the same time. And the orchestrator is the only piece that sees the request end to end: it plans at the top and synthesizes at the bottom, and everything between is delegation.

## File layout

```
agent-system/
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
    └── manager_research.txt    (one prompt per domain)
```

`manager.py` is a single file, not four. It takes a domain prompt and a toolset and runs the same loop for any domain, so the four manager buildings in the world are four instances of this one definition, exactly as the world renders one Manager component four times. Adding a domain means adding a prompt and a toolset, not a new file.

## The prompts

The `prompts/` directory is small, and it is where a lot of the system's behavior actually lives. The architecture decides who calls whom; the prompts decide how well each step is done.

There are three kinds. The planning prompt teaches the orchestrator how to split a request into clean, independent tasks and how to write each task so a manager can act on it without asking follow-up questions. The synthesis prompt teaches it how to fold the returned summaries into one answer rather than stapling them together. The domain prompts, one per manager, tell each manager what it is responsible for, which tools it has, and when to stop.

A domain prompt is short and direct. The research manager's might read:

```text
You are the research manager. Your job is to gather and verify
information for one task handed to you by the orchestrator.

You have three tools: web search, document retrieval, and a source
reader. Use them to find evidence; do not guess from memory.

Work only on the task you were given. Do not take on other domains.
When you have enough to answer, stop and return a short summary with
the sources you used.
```

Notice what the prompt fixes in place: the manager's role, its tools, its boundary (one domain, no wandering), and its stopping condition. Keeping this in a text file, separate from the code, lets you tune behavior by editing prose instead of logic, which is where most of the improvement comes from once the wiring works.

## Order of assembly

Build from the bottom up. Each step works on its own before the next one wraps it.

1. **Start with one tool.** Define a single capability, a web search for example, with a clear name, a description, and an input shape, and wire it to one model call. Watch the model decide when to reach for it.
2. **Wrap it in one manager.** Give a single manager a domain prompt and that one tool, and get the loop working: receive a task, call the tool, return a short summary.
3. **Add the orchestrator, sequentially.** Have it break a request into two or three subtasks and call your one manager once per subtask, one after another, then combine the answers.
4. **Parallelize the dispatch.** Once the sequential version works end to end, run the manager calls at the same time instead of in series. This is an optimization, not the core pattern.
5. **Add the other domains.** Reuse `manager.py` with new prompts and toolsets for Data-Analysis, Code, and Communication-Action.
6. **Add plan memory.** For longer runs, save the plan before dispatching so the orchestrator does not lose track of it as its context fills.

## Making it run

Everything above is structure. This is the single piece of real code under all of it: one model call, with one tool the model can choose to use. A manager calling a tool is exactly this loop, run inside a domain. Get it working once by hand and the rest of the system is repetition and coordination.

The example below uses one provider to keep it concrete. The shape is the same across providers: you set a key, create a client, send messages, and pass tools. Swap the SDK, the client, and the model name for the ones your provider documents and the rest reads the same.

First, the setup. Install your provider's SDK, and get an API key from its console, the web dashboard where you sign up and create one.

```shell
pip install anthropic
```

Treat the key like a password: load it from an environment variable, never paste it into your source, and never commit it. Most SDKs read it from the environment, so you set it once and the client picks it up. The line below sets it for the current terminal only, so opening a new terminal means setting it again, or you add it to your shell profile to make it stick.

```shell
export ANTHROPIC_API_KEY=your-key-here
```

Then the simplest possible call, to confirm the key works and you can reach the model:

```python
# Illustrative example with one provider. Check your provider's current SDK.
import anthropic

client = anthropic.Anthropic()       # reads the key from the environment

reply = client.messages.create(
    model="claude-opus-4-8",         # swap in your provider's model name
    max_tokens=1024,
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)
print(reply.content)
```

That is a plain question and answer. To make the model do something, you give it a tool: a function you wrote, described in plain language so the model knows when to reach for it. You define its name, what it does, and the shape of its input.

```python
# Illustrative example with one provider. Check your provider's current SDK.
weather_tool = {
    "name": "get_weather",
    "description": "Get the current weather for a city.",
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    },
}
```

You pass that tool in with the request. The model reads the request and, if the tool fits, hands back a structured call naming the tool and its input. Your code runs the real function, then sends the result back so the model can use it.

```python
# Illustrative example with one provider. Check your provider's current SDK.
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

print(reply.content)
```

That loop is the whole engine. The model asks for a tool, you run it, you send the result back, and it continues until it has a final answer. A manager is this exact loop pointed at one domain with a handful of tools. An orchestrator is the same call again, where the tools it reaches for are the managers. Once the loop is clear to you, you are not learning a new pattern at each layer, you are reusing this one.

## From one loop to the system

The loop in the last section is one manager doing one task. The whole system is that loop wrapped in a function, with an orchestrator above it that plans the tasks and combines the answers. Here is the skeleton, the same pieces as the file tree, small enough to read in one sitting. The lowercase helpers (`text_of`, `run_tools`, `parse_tasks`, `combine`) are small pieces you fill in; the capitalized names (`PROMPTS`, `TOOLS`, and the prompt constants) are your prompt files and toolsets, loaded once.

A manager is the loop you already wrote, with its domain prompt and tools passed in. That is all `manager.py` is.

```python
# manager.py — illustrative skeleton. Check your provider's current SDK.
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
        messages.append({"role": "user", "content": run_tools(calls)})
```

The orchestrator does three things: plan, dispatch, synthesize. Plan and synthesize are model calls of their own, which is why the orchestrator runs the strongest model.

```python
# orchestrator.py — illustrative skeleton. Check your provider's current SDK.
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
    return synthesize(request, summaries)
```

The entry point is small. It takes a request and runs the orchestrator.

```python
# main.py
request = "Compare last quarter's sales to the same quarter last year."
print(run_orchestrator(request))
```

That is the whole system in skeleton, and the pieces map straight onto the assembly order. `run_manager` is steps 1 and 2. The loop inside `run_orchestrator` is the sequential dispatch of step 3, calling one manager at a time. Step 4 is that same dispatch with the `run_manager` calls running at the same time instead of one after another, which you do with your language's async or concurrency tools. Plan memory (step 6) drops in as one line: save the result of `plan(request)` before the dispatch, so a long run can reload it during synthesize.

## Which models where

Use a strong model where the thinking is hardest and cheaper models for the focused work. One decision, applied across the whole system.

| Layer | Model | Why |
| --- | --- | --- |
| Orchestrator | Your strongest model | It plans the work and synthesizes the results, the two hardest steps. Quality here drives the whole system. |
| Manager | A capable, cost-efficient model | The orchestrator already did the heavy planning. Managers run focused, scoped work, so a mid-tier model is usually enough. |
| Tool | Not a model | A tool is plain code the manager calls. It runs a function and returns a result, nothing more. |

Anthropic's multi-agent research system uses this split directly: a stronger lead model with cheaper subagent models beneath it, for example Opus as the lead and Sonnet as the subagents.

This architecture spends far more tokens than a single call, around fifteen times the tokens of a single chat in Anthropic's reporting. The strong-lead, cheaper-workers split keeps the cost in check while preserving quality where it matters. Reach for the whole pattern only when the work is big enough to justify it.

## Vocabulary map

Friendly names on the left, the terms you will meet in the source material on the right.

| In this world | In the sources | Meaning |
| --- | --- | --- |
| Orchestrator | Lead agent | The central model that plans and synthesizes. |
| Manager | Subagent | A specialized agent with its own context window and tools. |
| Tool | Tool | A defined function the model can call. |

## The no-peer-coordination rule

Managers never talk to each other. Each one receives a task from the orchestrator above it and calls the tools below it, and that is the full extent of its connections. Keeping managers independent is what lets them run in parallel and keeps the system easy to reason about. When two managers seem to need to coordinate, that coordination belongs in the orchestrator, which can sequence their work or pass one manager's result into another's task.

## Memory

The orchestrator's context window is finite. On a long run it fills up, and early content, including the original plan, can fall out. Saving the plan to memory right after it is made keeps it available through the whole run.

```python
# Illustrative pseudo-code. Check your AI provider's current SDK for exact API.

# Save the plan as soon as it is made, before any dispatch.
memory.save("plan", plan)

# Reload it later, during synthesis, even after a long run has filled the context.
final = ai.create(
    model="your strongest model",
    system=SYNTHESIS_PROMPT,
    input=combine(user_query, results, memory.load("plan")),
)
```

Memory has no element in the world yet. It is a code-level concept here, planned as a visible piece later.

## Building with AI assistance

AI coding assistants are good at the boilerplate here: defining a tool, wiring a tool-calling loop, scaffolding the file layout. Let them help, then build the simple version yourself first so you understand what they generated and why. The architecture is the part that has to be yours; the typing is the part you can hand off.

This site itself was built with AI coding assistance, which is a fair example of the balance. The assistant handled much of the construction, and understanding the architecture is what made it work.

## References

- [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents), Anthropic (2024)
- [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system), Anthropic (2025)
- [Tool use with Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview), Anthropic API docs (the API-key and tool-loop example in "Making it run" follows this)
