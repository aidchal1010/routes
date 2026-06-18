"use client";

import { useCallback, useMemo, useState } from "react";
import TopBar from "@/components/ui/TopBar";
import { usePause } from "@/components/map/PauseContext";
import type { WorldLayout } from "@/lib/world-layout";
import SandboxCanvas from "./SandboxCanvas";
import SandboxPalette from "./SandboxPalette";
import {
  EMPTY_SANDBOX,
  MAX_MANAGERS,
  buildLayout,
  canPlay,
  makeId,
  nearestManagerId,
  validateLayout,
  type PieceKind,
  type Point,
  type SandboxLayout,
} from "./sandbox-layout";

type Mode = "build" | "play";

export default function SandboxShell() {
  const [sandbox, setSandbox] = useState<SandboxLayout>(EMPTY_SANDBOX);
  const [mode, setMode] = useState<Mode>("build");
  const [snapshot, setSnapshot] = useState<WorldLayout | null>(null);
  const [playId, setPlayId] = useState(0);
  const { paused, pause, resume } = usePause();

  const liveLayout = useMemo(() => buildLayout(sandbox), [sandbox]);
  const playable = canPlay(sandbox);

  // Add a piece at the dropped point, enforcing the build order as a double-guard (the palette
  // already gates the drag sources).
  const handleDropPiece = useCallback((kind: PieceKind, point: Point) => {
    setSandbox((s) => {
      if (kind === "orchestrator") {
        if (s.orchestrator) return s; // single orchestrator
        return { ...s, orchestrator: { position: point } };
      }
      if (kind === "manager") {
        if (!s.orchestrator || s.managers.length >= MAX_MANAGERS) return s;
        return {
          ...s,
          managers: [
            ...s.managers,
            { id: makeId("mgr"), position: point, domainIndex: s.managers.length },
          ],
        };
      }
      // tool
      const managerId = nearestManagerId(s.managers, point);
      if (!managerId) return s; // needs at least one manager
      return {
        ...s,
        tools: [...s.tools, { id: makeId("tool"), position: point, managerId }],
      };
    });
  }, []);

  // Play: from build, snapshot the layout (deep copy so the engine's data can't change under
  // it) and run on a freshly-keyed Map; from paused, just resume. Always resume on entry so a
  // Pause -> Stop -> add -> Play sequence is never frozen (paused survives the Map remount).
  const handlePlay = useCallback(() => {
    if (mode === "build") {
      if (!playable) return;
      const snap = structuredClone(buildLayout(sandbox));
      if (process.env.NODE_ENV !== "production") {
        const problems = validateLayout(snap);
        if (problems.length) console.warn("[sandbox] invalid layout:", problems);
      }
      setSnapshot(snap);
      setPlayId((n) => n + 1);
      setMode("play");
    }
    resume();
  }, [mode, playable, sandbox, resume]);

  const handlePause = useCallback(() => pause(), [pause]);

  // Stop: leave play, keep the placed pieces (the snapshot was a deep copy, so liveLayout is
  // intact) so the user can add a piece and Play again.
  const handleStop = useCallback(() => {
    setMode("build");
    setSnapshot(null);
  }, []);

  // Restart: the explicit destructive wipe back to a blank build canvas.
  const handleRestart = useCallback(() => {
    setSandbox(EMPTY_SANDBOX);
    setSnapshot(null);
    setMode("build");
  }, []);

  return (
    <div className="flex h-full flex-col">
      <TopBar />

      {/* Toolbar strip — reserves its own height so it never occludes the canvas. */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-night-800 bg-night-950 px-4">
        {mode === "build" ? (
          <>
            <ToolbarButton onClick={handlePlay} disabled={!playable} primary>
              Play
            </ToolbarButton>
            <ToolbarButton onClick={handleRestart}>Restart</ToolbarButton>
            {!playable && (
              <span className="ml-1 text-[11px] text-ink-400">
                Place an orchestrator, a manager, and a tool for every manager to Play.
              </span>
            )}
          </>
        ) : (
          <>
            {paused ? (
              <ToolbarButton onClick={handlePlay} primary>
                Resume
              </ToolbarButton>
            ) : (
              <ToolbarButton onClick={handlePause}>Pause</ToolbarButton>
            )}
            <ToolbarButton onClick={handleStop}>Stop</ToolbarButton>
            <ToolbarButton onClick={handleRestart}>Restart</ToolbarButton>
            <span className="ml-1 text-[11px] text-ink-400">
              {paused ? "Paused" : "Running"} the built system.
            </span>
          </>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <SandboxCanvas
          mode={mode}
          liveLayout={liveLayout}
          snapshot={snapshot}
          playId={playId}
          onDropPiece={handleDropPiece}
        />
        <SandboxPalette sandbox={sandbox} mode={mode} />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  disabled,
  primary,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3.5 py-1.5 font-mono text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        primary
          ? "bg-orchestrator text-ink-100 hover:bg-orchestratorLight"
          : "border border-night-800 text-ink-100 hover:bg-night-900"
      }`}
    >
      {children}
    </button>
  );
}
