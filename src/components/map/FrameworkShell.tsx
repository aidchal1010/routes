"use client";

import { useState } from "react";
import { palette } from "@/lib/palette";
import { usePause } from "./PauseContext";
import InfoPanel, { type PanelContent } from "./InfoPanel";
import Map from "./Map";

// TEMP — remove when click handlers land (Step 5–6). Realistic Manager C copy so the
// real feel of the panel is judgeable before Layer 2 writes content for every element.
const PLACEHOLDER_MANAGER_C: PanelContent = {
  elementName: "MANAGER C",
  accentColor: palette.managerCBase,
  overview: {
    whatItIs:
      "A manager is a domain-specific sub-orchestrator — a specialized agent that owns one slice of the problem. Manager C handles its domain end to end, the way a team lead owns a project area.",
    whatItDoes:
      "It receives a task dispatched from the orchestrator, breaks it into smaller subtasks, sends those to its own workers, and synthesizes their results into a single answer it hands back up.",
    example:
      "Asked to 'summarize last quarter's support tickets,' Manager C might dispatch one worker to pull the tickets, one to cluster them by theme, and one to draft the summary — then stitch the three results together.",
  },
  advanced: {
    components: [
      "Model — the LLM that runs the manager's reasoning (a capable model, since it plans and synthesizes)",
      "System prompt — defines the manager's domain, its workers, and its decomposition strategy",
      "Decomposition logic — turns an incoming task into a set of worker subtasks",
      "Worker registry — the set of workers this manager may dispatch to",
      "Result synthesis prompt — merges worker outputs into one coherent result",
    ],
    implementation:
      "Build it as its own orchestrator-workers loop: the manager agent calls worker tools/subagents, collects their structured results, and runs a synthesis pass. Managers never talk to peer managers — they only fan out to their own workers and report back to the orchestrator. This is the no-peer-coordination rule, kept deliberately to avoid tangled cross-team dependencies.",
    production: [
      "Cache the system prompt — it's stable across calls and large",
      "Add retries with backoff on worker failures so one flaky worker doesn't sink the cycle",
      "Set a synthesis timeout / safety cap so a stuck worker can't block the manager forever",
      "Log dispatch → result per worker for observability and debugging",
      "Common pitfall: over-decomposing trivial tasks — spawning workers adds latency and cost",
    ],
    references: [
      {
        label: "Anthropic — Building Effective Agents",
        url: "https://www.anthropic.com/research/building-effective-agents",
      },
    ],
  },
};

export default function FrameworkShell() {
  const [panelContent, setPanelContent] = useState<PanelContent | null>(null);
  const { pause, resume } = usePause();

  const open = () => {
    setPanelContent(PLACEHOLDER_MANAGER_C);
    pause();
  };
  const close = () => {
    setPanelContent(null);
    resume();
  };

  return (
    <>
      <Map />
      <InfoPanel content={panelContent} onClose={close} />

      {/* TEMP — remove when click handlers land (Step 5–6). Stand-in trigger so the
          panel can be opened/closed before element click wiring exists. */}
      <button
        type="button"
        onClick={() => (panelContent ? close() : open())}
        className="fixed bottom-4 left-4 z-30 rounded-md border border-night-800 bg-night-900 px-3 py-2 font-mono text-xs uppercase tracking-widest text-ink-400 transition-colors hover:text-ink-100"
      >
        Test Panel
      </button>
    </>
  );
}
