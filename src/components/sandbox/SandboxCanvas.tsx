"use client";

import { useCallback, useRef, type ReactNode } from "react";
import Map from "@/components/map/Map";
import type { WorldLayout } from "@/lib/world-layout";
import { PIECE_MIME, type PieceKind, type Point } from "./sandbox-layout";

type Props = {
  mode: "build" | "play";
  // Built live from the placed pieces (build mode) — rendered static, no vehicles.
  liveLayout: WorldLayout;
  // Frozen at Play; the motion engine runs on this. Falls back to live if absent.
  snapshot: WorldLayout | null;
  // Bumped each Play so the engine remounts fresh on a stable layout.
  playId: number;
  onDropPiece: (kind: PieceKind, point: Point) => void;
  // Double-click in build mode, reported in SVG world coords (for rename hit-testing).
  onCanvasDoubleClick?: (point: Point) => void;
  // SVG-space rename editor, rendered inside Map's <svg> so it tracks pan/zoom.
  overlay?: ReactNode;
};

// Owns the single <svg> + pan/zoom (via Map). Drop + double-click handlers live on this
// container (HTML5 drag and native dblclick), so they never capture pointer pan/zoom
// gestures. Screen->SVG conversion uses the forwarded svgRef's getScreenCTM, which composes
// the live pan/zoom transform.
export default function SandboxCanvas({
  mode,
  liveLayout,
  snapshot,
  playId,
  onDropPiece,
  onCanvasDoubleClick,
  overlay,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const noop = useCallback(() => {}, []);

  const clientToWorld = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const ctm = svgRef.current?.getScreenCTM();
      if (!ctm) return null;
      const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
      return { cx: p.x, cy: p.y };
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData(PIECE_MIME) as PieceKind | "";
      if (!kind) return;
      const p = clientToWorld(e.clientX, e.clientY);
      if (p) onDropPiece(kind, p);
    },
    [clientToWorld, onDropPiece],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const p = clientToWorld(e.clientX, e.clientY);
      if (p) onCanvasDoubleClick?.(p);
    },
    [clientToWorld, onCanvasDoubleClick],
  );

  return (
    <div
      className="absolute inset-0"
      onDragOver={
        mode === "build"
          ? (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }
          : undefined
      }
      onDrop={mode === "build" ? handleDrop : undefined}
      onDoubleClick={mode === "build" ? handleDoubleClick : undefined}
    >
      {mode === "build" ? (
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
