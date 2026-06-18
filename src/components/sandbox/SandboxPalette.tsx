"use client";

import { palette } from "@/lib/palette";
import {
  DOMAINS,
  MAX_MANAGERS,
  PIECE_MIME,
  type PieceKind,
  type SandboxLayout,
} from "./sandbox-layout";

type Props = {
  sandbox: SandboxLayout;
  mode: "build" | "play";
};

// Right-side overlay of draggable pieces. Gating mirrors the build order: orchestrator first,
// then managers (cycling through the four fixed domains/colors), then tools (which attach to
// the nearest manager on drop). Disabled in play mode.
export default function SandboxPalette({ sandbox, mode }: Props) {
  const build = mode === "build";
  const orchestratorPlaced = sandbox.orchestrator !== null;
  const managersCount = sandbox.managers.length;
  const nextDomain =
    managersCount < MAX_MANAGERS ? DOMAINS[managersCount] : null;

  const orchestratorEnabled = build && !orchestratorPlaced;
  const managerEnabled = build && orchestratorPlaced && nextDomain !== null;
  const toolEnabled = build && managersCount >= 1;

  const dragProps = (kind: PieceKind, enabled: boolean) =>
    enabled
      ? {
          draggable: true,
          onDragStart: (e: React.DragEvent) => {
            e.dataTransfer.setData(PIECE_MIME, kind);
            e.dataTransfer.effectAllowed = "copy";
          },
        }
      : {};

  return (
    <aside className="pointer-events-auto absolute right-4 top-4 z-30 w-64 rounded-xl border border-night-800 bg-night-950/95 p-3 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-1 font-mono text-[11px] uppercase tracking-widest text-ink-400">
        Palette
      </h2>
      <p className="mb-3 text-[11px] leading-snug text-ink-400">
        {build
          ? "Drag pieces onto the grid."
          : "Stop to edit the layout."}
      </p>

      <PaletteItem
        enabled={orchestratorEnabled}
        kind="orchestrator"
        dragProps={dragProps}
        swatch={palette.orchestrator}
        swatchShape="rounded"
        title="Orchestrator"
        subtitle={orchestratorPlaced ? "Placed" : "Place this first"}
      />

      <PaletteItem
        enabled={managerEnabled}
        kind="manager"
        dragProps={dragProps}
        swatch={nextDomain ? nextDomain.colorBase : palette.night800}
        swatchShape="rounded"
        title={nextDomain ? `Manager · ${nextDomain.domain}` : "Manager"}
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
        kind="tool"
        dragProps={dragProps}
        swatch={palette.ink400}
        swatchShape="square"
        title="Tool"
        subtitle={
          managersCount >= 1 ? "Attaches to nearest manager" : "Add a manager first"
        }
      />
    </aside>
  );
}

function PaletteItem({
  enabled,
  kind,
  dragProps,
  swatch,
  swatchShape,
  title,
  subtitle,
}: {
  enabled: boolean;
  kind: PieceKind;
  dragProps: (kind: PieceKind, enabled: boolean) => Record<string, unknown>;
  swatch: string;
  swatchShape: "rounded" | "square";
  title: string;
  subtitle: string;
}) {
  return (
    <div
      {...dragProps(kind, enabled)}
      className={`mb-2 flex items-center gap-3 rounded-lg border border-night-800 px-3 py-2.5 transition-opacity ${
        enabled
          ? "cursor-grab bg-night-900 opacity-100 active:cursor-grabbing"
          : "cursor-not-allowed opacity-40"
      }`}
    >
      <span
        className={`h-7 w-7 shrink-0 ${swatchShape === "rounded" ? "rounded-md" : "rounded-sm"}`}
        style={{ backgroundColor: swatch }}
      />
      <span className="min-w-0">
        <span className="block truncate font-mono text-[12px] text-ink-100">
          {title}
        </span>
        <span className="block truncate text-[11px] text-ink-400">{subtitle}</span>
      </span>
    </div>
  );
}
