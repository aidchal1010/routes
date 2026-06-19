"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TopBar from "@/components/ui/TopBar";
import { usePause } from "@/components/map/PauseContext";
import WelcomeModal from "@/components/map/WelcomeModal";
import { palette } from "@/lib/palette";
import type { WorldLayout } from "@/lib/world-layout";
import SandboxCanvas from "./SandboxCanvas";
import SandboxPalette from "./SandboxPalette";
import {
  DEFAULT_NAME,
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

// In-memory flag: the intro shows once per page load. It resets on a full reload (a fresh
// visit or refresh shows it again) but persists across in-app navigation (World <-> Sandbox)
// while the app stays loaded. Set on dismiss, not on open, so React StrictMode's dev
// double-mount doesn't eat the first show.
let introShownThisLoad = false;

const SANDBOX_INTRO = [
  {
    title: "The Sandbox",
    body: "This is your space to build an agent system and watch it run. Drag an orchestrator onto the grid, then add managers, then tools. The roads and flight paths draw themselves, and a manager can only connect up to the orchestrator and down to its tools, never sideways. Double-click any piece to rename it to whatever you are building. When every manager has at least one tool, press Play and watch the requests flow through the system you made.",
  },
];

export default function SandboxShell() {
  const [sandbox, setSandbox] = useState<SandboxLayout>(EMPTY_SANDBOX);
  const [mode, setMode] = useState<Mode>("build");
  const [snapshot, setSnapshot] = useState<WorldLayout | null>(null);
  const [playId, setPlayId] = useState(0);
  // Inline-rename target (build mode). id is null for the singleton orchestrator.
  const [editing, setEditing] = useState<{
    kind: PieceKind;
    id: string | null;
    value: string;
  } | null>(null);
  const [introOpen, setIntroOpen] = useState(false);
  // Armed palette piece: a tap on the grid places it. null = nothing armed.
  const [armed, setArmed] = useState<PieceKind | null>(null);
  // Coarse pointer / narrow screen => show the "better on desktop" note (dismissible).
  const [coarse, setCoarse] = useState(false);
  const [noteDismissed, setNoteDismissed] = useState(false);
  const { paused, pause, resume } = usePause();

  const liveLayout = useMemo(() => buildLayout(sandbox), [sandbox]);
  const playable = canPlay(sandbox);

  // Release the global pause on mount. PauseProvider starts paused=true (it is shared with
  // the world, which relies on that for its welcome flow); the sandbox has no welcome and
  // must not sit frozen, or the first Play would mount its engine paused. Build mode is
  // inert (running=false), so this only matters once Play runs. Run once on mount.
  useEffect(() => {
    resume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open the intro once per page load. Don't mark it shown here — only on dismiss — so
  // StrictMode's dev double-mount (and any remount) still shows it the first time.
  useEffect(() => {
    if (!introShownThisLoad) setIntroOpen(true);
  }, []);

  const handleIntroClose = useCallback(() => {
    setIntroOpen(false);
    introShownThisLoad = true;
  }, []);

  // Touch / narrow screen detection for the "better on desktop" note. Read in an effect
  // (client only) to avoid a hydration mismatch.
  useEffect(() => {
    setCoarse(
      window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(max-width: 820px)").matches,
    );
  }, []);

  // Add a piece at the dropped point, enforcing the build order as a double-guard (the palette
  // already gates the drag sources).
  const handleDropPiece = useCallback((kind: PieceKind, point: Point) => {
    setSandbox((s) => {
      if (kind === "orchestrator") {
        if (s.orchestrator) return s; // single orchestrator
        return {
          ...s,
          orchestrator: { position: point, name: DEFAULT_NAME.orchestrator },
        };
      }
      if (kind === "manager") {
        if (!s.orchestrator || s.managers.length >= MAX_MANAGERS) return s;
        return {
          ...s,
          managers: [
            ...s.managers,
            {
              id: makeId("mgr"),
              position: point,
              domainIndex: s.managers.length,
              name: DEFAULT_NAME.manager,
            },
          ],
        };
      }
      // tool
      const managerId = nearestManagerId(s.managers, point);
      if (!managerId) return s; // needs at least one manager
      return {
        ...s,
        tools: [
          ...s.tools,
          { id: makeId("tool"), position: point, managerId, name: DEFAULT_NAME.tool },
        ],
      };
    });
  }, []);

  // Arm/disarm a palette piece (toggle). The palette only calls this for enabled chips, so
  // gating/cap are respected.
  const handleArm = useCallback((kind: PieceKind) => {
    setArmed((a) => (a === kind ? null : kind));
  }, []);

  // Tap-to-place: drop the armed piece at the tapped point. Tools stay armed (drop several);
  // orchestrator/manager disarm after one placement.
  const handlePlace = useCallback(
    (point: Point) => {
      if (!armed) return;
      handleDropPiece(armed, point);
      if (armed !== "tool") setArmed(null);
    },
    [armed, handleDropPiece],
  );

  // Play: from build, snapshot the layout (deep copy so the engine's data can't change under
  // it) and run on a freshly-keyed Map; from paused, just resume. Always resume on entry so a
  // Pause -> Stop -> add -> Play sequence is never frozen (paused survives the Map remount).
  const handlePlay = useCallback(() => {
    if (mode === "build") {
      if (!playable) return;
      // A fresh buildLayout() result is already a new object disconnected from future edits
      // (the palette is disabled in play mode), so no structuredClone is needed — and
      // dropping it removes any chance of the Play handler throwing before it runs.
      const snap = buildLayout(sandbox);
      if (process.env.NODE_ENV !== "production") {
        const problems = validateLayout(snap);
        if (problems.length) console.warn("[sandbox] invalid layout:", problems);
      }
      setSnapshot(snap);
      setPlayId((n) => n + 1);
      setMode("play");
      setEditing(null);
      setArmed(null);
    }
    resume();
  }, [mode, playable, sandbox, resume]);

  const handlePause = useCallback(() => pause(), [pause]);

  // Stop: leave play, keep the placed pieces so the user can add a piece and Play again.
  // resume() so paused returns to a clean state — a Pause -> Stop -> add -> Play sequence
  // must not mount the next engine frozen.
  const handleStop = useCallback(() => {
    setMode("build");
    setSnapshot(null);
    setArmed(null);
    resume();
  }, [resume]);

  // Restart: the explicit destructive wipe back to a blank build canvas. resume() for the
  // same clean-state reason as Stop.
  const handleRestart = useCallback(() => {
    setSandbox(EMPTY_SANDBOX);
    setSnapshot(null);
    setMode("build");
    setEditing(null);
    setArmed(null);
    resume();
  }, [resume]);

  // Double-click a placed piece (build mode) to rename it. Hit-test smallest first; the
  // half-extents match the components' drawn geometry (tool 64px body, manager 140px body,
  // orchestrator's 390x210 non-square body).
  const handleCanvasDoubleClick = useCallback(
    (p: Point) => {
      for (const t of sandbox.tools) {
        if (Math.abs(t.position.cx - p.cx) <= 40 && Math.abs(t.position.cy - p.cy) <= 40) {
          setEditing({ kind: "tool", id: t.id, value: t.name });
          return;
        }
      }
      for (const m of sandbox.managers) {
        if (Math.abs(m.position.cx - p.cx) <= 95 && Math.abs(m.position.cy - p.cy) <= 95) {
          setEditing({ kind: "manager", id: m.id, value: m.name });
          return;
        }
      }
      if (sandbox.orchestrator) {
        const o = sandbox.orchestrator.position;
        if (Math.abs(o.cx - p.cx) <= 195 && Math.abs(o.cy - p.cy) <= 105) {
          setEditing({
            kind: "orchestrator",
            id: null,
            value: sandbox.orchestrator.name,
          });
        }
      }
    },
    [sandbox],
  );

  // Commit the edit (Enter / blur): write the trimmed value, or fall back to the type
  // default if empty.
  const commitEdit = useCallback(() => {
    if (!editing) return;
    const e = editing;
    const name = e.value.trim() || DEFAULT_NAME[e.kind];
    setSandbox((s) => {
      if (e.kind === "orchestrator") {
        return s.orchestrator
          ? { ...s, orchestrator: { ...s.orchestrator, name } }
          : s;
      }
      if (e.kind === "manager") {
        return {
          ...s,
          managers: s.managers.map((m) => (m.id === e.id ? { ...m, name } : m)),
        };
      }
      return {
        ...s,
        tools: s.tools.map((t) => (t.id === e.id ? { ...t, name } : t)),
      };
    });
    setEditing(null);
  }, [editing]);

  const cancelEdit = useCallback(() => setEditing(null), []);

  // The rename editor lives in SVG space (inside Map's <svg> via the `overlay` prop) so it
  // tracks pan/zoom. Anchor it at the edited piece's label position.
  const editAnchor = ((): Point | null => {
    if (!editing) return null;
    if (editing.kind === "orchestrator") {
      return sandbox.orchestrator
        ? {
            cx: sandbox.orchestrator.position.cx,
            cy: sandbox.orchestrator.position.cy + 195,
          }
        : null;
    }
    if (editing.kind === "manager") {
      const m = sandbox.managers.find((m) => m.id === editing.id);
      return m ? { cx: m.position.cx, cy: m.position.cy + 150 } : null;
    }
    const t = sandbox.tools.find((t) => t.id === editing.id);
    return t ? { cx: t.position.cx, cy: t.position.cy + 64 } : null;
  })();

  const overlay =
    editing && editAnchor ? (
      <foreignObject
        x={editAnchor.cx - 260}
        y={editAnchor.cy - 40}
        width={520}
        height={80}
      >
        <input
          autoFocus
          value={editing.value}
          onChange={(ev) =>
            setEditing((e) => (e ? { ...e, value: ev.target.value } : e))
          }
          onFocus={(ev) => ev.currentTarget.select()}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") commitEdit();
            else if (ev.key === "Escape") cancelEdit();
          }}
          onBlur={commitEdit}
          // Don't let the input's pointer-down start a pan.
          onPointerDown={(ev) => ev.stopPropagation()}
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            textAlign: "center",
            fontFamily: "monospace",
            fontSize: 34,
            letterSpacing: 2,
            color: palette.ink100,
            background: palette.night950,
            border: `2px solid ${palette.orchestrator}`,
            borderRadius: 8,
            outline: "none",
            padding: "0 16px",
          }}
        />
      </foreignObject>
    ) : null;

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
          isArmed={armed !== null}
          onPlace={handlePlace}
          onCanvasDoubleClick={handleCanvasDoubleClick}
          overlay={overlay}
        />
        <SandboxPalette
          sandbox={sandbox}
          mode={mode}
          armed={armed}
          onArm={handleArm}
        />

        {coarse && !noteDismissed && (
          <div className="pointer-events-auto absolute left-4 top-4 z-30 flex max-w-[260px] items-start gap-2 rounded-lg border border-night-800 bg-night-950/95 px-3 py-2 text-[11px] leading-snug text-ink-400 shadow-lg backdrop-blur-sm">
            <span>
              Heads up — the sandbox is richer on a desktop, with a mouse and
              pan/zoom.
            </span>
            <button
              type="button"
              onClick={() => setNoteDismissed(true)}
              aria-label="Dismiss"
              className="shrink-0 text-base leading-none text-ink-400 transition-colors hover:text-ink-100"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <WelcomeModal
        open={introOpen}
        steps={SANDBOX_INTRO}
        ctaLabel="Start building"
        showDontShowAgain={false}
        ariaLabel="The Sandbox"
        onClose={handleIntroClose}
      />
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
