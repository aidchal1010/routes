"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import Map from "@/components/map/Map";
import type { WorldLayout } from "@/lib/world-layout";
import type { Point } from "./sandbox-layout";

// Movement (px) under which a pointer up counts as a tap, not a pan.
const TAP_SLOP = 10;
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_SLOP = 40;

type Props = {
  mode: "build" | "play";
  // Built live from the placed pieces (build mode) — rendered static, no vehicles.
  liveLayout: WorldLayout;
  // Frozen at Play; the motion engine runs on this. Falls back to live if absent.
  snapshot: WorldLayout | null;
  // Bumped each Play so the engine remounts fresh on a stable layout.
  playId: number;
  // True when a palette piece is armed: a clean tap places it.
  isArmed: boolean;
  // Place the armed piece at the tapped point (SVG world coords).
  onPlace: (point: Point) => void;
  // Not-armed double-tap, in world coords (rename hit-testing).
  onCanvasDoubleClick?: (point: Point) => void;
  // SVG-space rename editor, rendered inside Map's <svg> so it tracks pan/zoom.
  overlay?: ReactNode;
};

// Owns the single <svg> + pan/zoom (via Map). Placement and rename use a pointer-based tap
// model (works on mouse and touch) layered over react-zoom-pan-pinch (rzpp): capture-phase
// listeners observe the gesture without preventDefault, so rzpp still pans/pinches. A tap with
// no significant movement places (or, when not armed, a double-tap renames); a drag is a pan.
export default function SandboxCanvas({
  mode,
  liveLayout,
  snapshot,
  playId,
  isArmed,
  onPlace,
  onCanvasDoubleClick,
  overlay,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const noop = useCallback(() => {}, []);

  // Gesture tracking. `pointers` reconciles active ids as a Set (idempotent deletes, and a
  // stale id self-heals when the same id comes down again — the mouse missed-up case). `down`
  // is the current single-pointer start; `lastTap` drives double-tap detection.
  const pointers = useRef<Set<number>>(new Set());
  const down = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef<{ x: number; y: number; t: number } | null>(null);

  const clientToWorld = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const ctm = svgRef.current?.getScreenCTM();
      if (!ctm) return null;
      const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
      return { cx: p.x, cy: p.y };
    },
    [],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Self-heal: the same id reappearing means its previous up was missed (mouse has no
    // implicit capture, e.g. released off-canvas). Start clean so it isn't read as a pinch.
    if (pointers.current.has(e.pointerId)) pointers.current.clear();
    pointers.current.add(e.pointerId);
    // A second active pointer is a pinch — invalidate any pending tap.
    down.current =
      pointers.current.size > 1 ? null : { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const start = down.current;
      pointers.current.delete(e.pointerId);
      down.current = null;
      if (!start) return;

      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (moved > TAP_SLOP) {
        // A pan, not a tap. Never place; reset the double-tap timer.
        lastTap.current = null;
        return;
      }

      const p = clientToWorld(e.clientX, e.clientY);
      if (!p) return;

      if (isArmed) {
        onPlace(p);
        lastTap.current = null;
        return;
      }

      // Not armed: pointer-based double-tap -> rename.
      const prev = lastTap.current;
      if (
        prev &&
        e.timeStamp - prev.t < DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < DOUBLE_TAP_SLOP
      ) {
        lastTap.current = null;
        onCanvasDoubleClick?.(p);
      } else {
        lastTap.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      }
    },
    [clientToWorld, isArmed, onPlace, onCanvasDoubleClick],
  );

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    down.current = null;
  }, []);

  // Safety net: a pointer released off the canvas (over the toolbar/palette or out of the
  // window) never fires the canvas's own up. A window listener clears the refs so the next
  // tap isn't read as a pinch. Cleanup-only — no tap logic, no preventDefault — so rzpp's pan/
  // pinch is unaffected, and it's idempotent with the capture handler. Build mode only.
  useEffect(() => {
    if (mode !== "build") return;
    const reset = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      down.current = null;
    };
    window.addEventListener("pointerup", reset);
    window.addEventListener("pointercancel", reset);
    return () => {
      window.removeEventListener("pointerup", reset);
      window.removeEventListener("pointercancel", reset);
    };
  }, [mode]);

  const build = mode === "build";

  return (
    <div
      className="absolute inset-0"
      style={{ touchAction: "none" }}
      onPointerDownCapture={build ? handlePointerDown : undefined}
      onPointerUpCapture={build ? handlePointerUp : undefined}
      onPointerCancelCapture={build ? handlePointerCancel : undefined}
    >
      {build ? (
        <Map
          key="build"
          layout={liveLayout}
          running={false}
          svgRef={svgRef}
          overlay={overlay}
          onElementClick={noop}
          onBackgroundClick={noop}
        />
      ) : (
        <Map
          key={`play-${playId}`}
          layout={snapshot ?? liveLayout}
          running
          svgRef={svgRef}
          onElementClick={noop}
          onBackgroundClick={noop}
        />
      )}
    </div>
  );
}
