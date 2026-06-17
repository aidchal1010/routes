"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MANAGERS } from "@/lib/world-layout";
import { palette } from "@/lib/palette";
import { getPlaceholderContent } from "../map/element-content";
import type { PanelContent } from "../map/InfoPanel";

// Always-visible key, fixed to the viewport top-right. Doubles as a table of contents:
// each row opens the same info panel a real world click opens, by calling the shared
// getPlaceholderContent + the onElementClick path (which pauses the world). The legend
// never touches pause directly. The open info panel (z-50) covers this card (z-40).

type Props = { onElementClick: (content: PanelContent) => void };

const rowClass =
  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-night-900";

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="h-3 w-3 shrink-0 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
}

// "DATA-ANALYSIS" -> "Data-Analysis" for the sub-row label (world-layout stores domains
// uppercase; this matches the friendlier casing used in the panel's domain tab).
const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");

type SimpleRow = {
  name: string;
  desc: string;
  color: string;
  make: () => PanelContent;
};

const ORCHESTRATOR_ROW: SimpleRow = {
  name: "Orchestrator",
  desc: "Lead agent that plans the work",
  color: palette.orchestrator,
  make: () =>
    getPlaceholderContent("orchestrator", "ORCHESTRATOR", palette.orchestrator),
};

const TOOL_ROW: SimpleRow = {
  name: "Tool",
  desc: "A capability a manager calls",
  color: palette.tool,
  make: () => getPlaceholderContent("tool", "TOOL", palette.tool),
};

// Vehicle swatch colors are representative: a real vehicle's color encodes its specific
// route, but the panel shows the right copy regardless of the seed color. Inbound planes
// are always the orchestrator's purple, so that one is exact.
const VEHICLE_ROWS: SimpleRow[] = [
  {
    name: "Task Dispatch",
    desc: "Orchestrator → manager",
    color: palette.managerABase,
    make: () =>
      getPlaceholderContent("plane-outbound", "TASK DISPATCH", palette.managerABase),
  },
  {
    name: "Result Return",
    desc: "Manager → orchestrator",
    color: palette.orchestrator,
    make: () =>
      getPlaceholderContent("plane-inbound", "RESULT RETURN", palette.orchestrator),
  },
  {
    name: "Tool Call",
    desc: "Manager → tool",
    color: palette.managerABase,
    make: () =>
      getPlaceholderContent("car-outbound", "TOOL CALL", palette.managerABase),
  },
  {
    name: "Tool Result",
    desc: "Tool → manager",
    color: palette.managerALight,
    make: () =>
      getPlaceholderContent("car-inbound", "TOOL RESULT", palette.managerALight),
  },
];

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-2 pb-1 pt-2 text-[10px] uppercase tracking-widest text-ink-400">
      {children}
    </h3>
  );
}

function RowButton({
  row,
  onElementClick,
}: {
  row: SimpleRow;
  onElementClick: (content: PanelContent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onElementClick(row.make())}
      className={rowClass}
    >
      <Swatch color={row.color} />
      <span className="min-w-0">
        <span className="block font-mono text-[12px] leading-tight text-ink-100">
          {row.name}
        </span>
        <span className="block text-[11px] leading-tight text-ink-400">
          {row.desc}
        </span>
      </span>
    </button>
  );
}

export default function Legend({ onElementClick }: Props) {
  const [managerExpanded, setManagerExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = focused || hovered;

  // Opening a panel from a row leaves focus on that row, which would keep the legend open
  // forever (focused stays true). After triggering the open, drop focus + hover so the
  // legend folds back to its resting pill behind the panel (z-50 covers it anyway) and is
  // already at rest when the panel closes.
  const openPanel = (content: PanelContent) => {
    onElementClick(content);
    (document.activeElement as HTMLElement | null)?.blur();
    setHovered(false);
    setFocused(false);
  };

  return (
    // Single hover container wrapping header + folding body, so moving the cursor from the
    // header into the revealed body never crosses an un-hovered gap (no flicker collapse).
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        // Keep open while focus stays inside the card; collapse only when it leaves.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
      className="fixed right-4 top-16 z-40 w-72 rounded-xl border border-night-800 bg-night-950 shadow-2xl"
    >
      {/* Header: always visible. Focusable so Tab opens the body; hover opens it too. */}
      <button
        type="button"
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <h2 className="font-mono text-sm tracking-wide text-ink-100">KEY</h2>
        <span className="text-[10px] text-ink-400">{open ? "▾" : "▸"}</span>
      </button>

      {/* Folding body: smooth height + opacity fold. overflow-hidden clips during the
          fold; once open, height settles to auto and reflows (so expanding a manager row
          inside is never clipped). */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="legend-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-night-800">
              <p className="px-4 pt-2.5 text-[11px] text-ink-400">
                Click any row to explore.
              </p>

              <div className="px-2 pb-2 pt-1">
                <GroupLabel>Buildings</GroupLabel>
                <RowButton row={ORCHESTRATOR_ROW} onElementClick={openPanel} />

                {/* Manager: expandable parent (2x2 swatch of the four manager colors) that
                    reveals one sub-row per domain. The sub-rows mirror Map.tsx's click
                    output exactly by reusing MANAGERS (id/domain/colorBase). */}
                <button
                  type="button"
                  onClick={() => setManagerExpanded((v) => !v)}
                  aria-expanded={managerExpanded}
                  className={rowClass}
                >
                  <span className="grid h-3 w-3 shrink-0 grid-cols-2 grid-rows-2 gap-px overflow-hidden rounded-sm">
                    {MANAGERS.map((m) => (
                      <span key={m.id} style={{ backgroundColor: m.colorBase }} />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[12px] leading-tight text-ink-100">
                      Manager
                    </span>
                    <span className="block text-[11px] leading-tight text-ink-400">
                      Specialists, one per domain
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-ink-400">
                    {managerExpanded ? "▾" : "▸"}
                  </span>
                </button>

                {managerExpanded && (
                  <div className="ml-3 border-l border-night-800 pl-2">
                    {MANAGERS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          openPanel(
                            getPlaceholderContent(
                              "manager",
                              `MANAGER · ${m.domain}`,
                              m.colorBase,
                              m.id,
                            ),
                          )
                        }
                        className={rowClass}
                      >
                        <Swatch color={m.colorBase} />
                        <span className="font-mono text-[12px] leading-tight text-ink-100">
                          {titleCase(m.domain)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <RowButton row={TOOL_ROW} onElementClick={openPanel} />

                <GroupLabel>Vehicles</GroupLabel>
                {VEHICLE_ROWS.map((row) => (
                  <RowButton key={row.name} row={row} onElementClick={openPanel} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
