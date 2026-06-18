"use client";

import { useCallback, useRef } from "react";
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
};

// Owns the single <svg> + pan/zoom (via Map). The drop handler lives on this container (HTML5
// drag-and-drop), so it never captures pointer pan/zoom gestures. Screen->SVG conversion uses
// the forwarded svgRef's getScreenCTM, which composes the live pan/zoom transform.
export default function SandboxCanvas({
  mode,
  liveLayout,
  snapshot,
  playId,
  onDropPiece,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const noop = useCallback(() => {}, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData(PIECE_MIME) as PieceKind | "";
      if (!kind) return;
      const svg = svgRef.current;
      const ctm = svg?.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      onDropPiece(kind, { cx: p.x, cy: p.y });
    },
    [onDropPiece],
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
    >
      {mode === "build" ? (
        <Map
          key="build"
          layout={liveLayout}
          running={false}
          svgRef={svgRef}
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
