"use client";

import { palette } from "@/lib/palette";
import {
  DOMAINS,
  MAX_MANAGERS,
  type PieceKind,
  type SandboxLayout,
} from "./sandbox-layout";

type Props = {
  sandbox: SandboxLayout;
  mode: "build" | "play";
  armed: PieceKind | null;
  onArm: (kind: PieceKind) => void;
};

// Right-side overlay of placeable pieces. Tap a chip to arm it, then tap the grid to place
// (works on mouse and touch). Gating mirrors the build order: orchestrator first, then
// managers (cycling through the four fixed colors), then tools. Disabled in play mode.
export default function SandboxPalette({ sandbox, mode, armed, onArm }: Props) {
  const build = mode === "build";
  const orchestratorPlaced = sandbox.orchestrator !== null;
  const managersCount = sandbox.managers.length;
  const nextDomain =
    managersCount < MAX_MANAGERS ? DOMAINS[managersCount] : null;

  const orchestratorEnabled = build && !orchestratorPlaced;
  const managerEnabled = build && orchestratorPlaced && nextDomain !== null;
  const toolEnabled = build && managersCount >= 1;

  return (
    <aside className="pointer-events-auto absolute inset-x-2 bottom-2 z-30 w-auto rounded-xl border border-night-800 bg-night-950/95 p-3 shadow-2xl backdrop-blur-sm sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-4 sm:w-64">
      <h2 className="mb-1 hidden font-mono text-[11px] uppercase tracking-widest text-ink-400 sm:block">
        Palette
      </h2>
      <p className="mb-3 hidden text-[11px] leading-snug text-ink-400 sm:block">
        {!build
          ? "Stop to edit the layout."
          : armed
            ? "Tap the grid to place. Tap the chip again to stop."
            : "Tap a piece, then tap the grid to place."}
      </p>

      <div className="flex gap-2 sm:block">
        <PaletteItem
        enabled={orchestratorEnabled}
        armed={armed === "orchestrator"}
        onArm={() => onArm("orchestrator")}
        swatch={palette.orchestrator}
        swatchShape="rounded"
        title="Orchestrator"
        subtitle={orchestratorPlaced ? "Placed" : "Place this first"}
      />

      <PaletteItem
        enabled={managerEnabled}
        armed={armed === "manager"}
        onArm={() => onArm("manager")}
        swatch={nextDomain ? nextDomain.colorBase : palette.night800}
        swatchShape="rounded"
        title="Manager"
        subtitle={
          nextDomain === null
            ? "All four placed"
            : !orchestratorPlaced
              ? "Place the orchestrator first"
              : `${managersCount}/${MAX_MANAGERS} placed`
        }
      />

      <PaletteItem
        enabled={toolEnabled}
        armed={armed === "tool"}
        onArm={() => onArm("tool")}
        swatch={palette.ink400}
        swatchShape="square"
        title="Tool"
        subtitle={
          managersCount >= 1 ? "Attaches to nearest manager" : "Add a manager first"
        }
        />
      </div>
    </aside>
  );
}

function PaletteItem({
  enabled,
  armed,
  onArm,
  swatch,
  swatchShape,
  title,
  subtitle,
}: {
  enabled: boolean;
  armed: boolean;
  onArm: () => void;
  swatch: string;
  swatchShape: "rounded" | "square";
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={enabled ? onArm : undefined}
      disabled={!enabled}
      className={`mb-2 flex w-full flex-1 select-none items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition sm:flex-none ${
        enabled
          ? "cursor-pointer bg-night-900 opacity-100"
          : "cursor-not-allowed border-night-800 opacity-40"
      } ${armed ? "border-orchestrator ring-2 ring-orchestrator" : "border-night-800"}`}
    >
      <span
        className={`h-7 w-7 shrink-0 ${swatchShape === "rounded" ? "rounded-md" : "rounded-sm"}`}
        style={{ backgroundColor: swatch }}
      />
      <span className="min-w-0">
        <span className="block truncate font-mono text-[12px] text-ink-100">
          {title}
        </span>
        <span className="hidden truncate text-[11px] text-ink-400 sm:block">{subtitle}</span>
      </span>
    </button>
  );
}
