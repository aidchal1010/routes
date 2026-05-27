"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  FLIGHT_PATHS,
  MANAGERS,
  ROADS,
  WORKERS,
  WORKER_LABELS,
} from "@/lib/world-layout";
import { palette } from "@/lib/palette";
import GridBackground from "./GridBackground";
import Airport from "./Airport";
import CarIcon from "./CarIcon";
import FlightPath from "./FlightPath";
import Manager from "./Manager";
import Road from "./Road";
import Worker from "./Worker";

// DEBUG: extract bezier midpoint from a road's d-string — remove in Phase F.2
function getBezierMidpoint(d: string): { x: number; y: number } {
  const m = d.match(
    /M\s+([\d.-]+)\s+([\d.-]+)\s+C\s+([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+)/,
  );
  if (!m) throw new Error(`bad d: ${d}`);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = m.slice(1).map(parseFloat);
  return {
    x: 0.125 * x0 + 0.375 * x1 + 0.375 * x2 + 0.125 * x3,
    y: 0.125 * y0 + 0.375 * y1 + 0.375 * y2 + 0.125 * y3,
  };
}

export default function Map() {
  return (
    <TransformWrapper
      minScale={0.9}
      maxScale={4}
      initialScale={0.9}
      centerOnInit
      limitToBounds={false}
      doubleClick={{ disabled: true }}
    >
      <TransformComponent
        wrapperStyle={{ width: "100%", height: "100%" }}
        contentStyle={{ width: "100%", height: "100%" }}
      >
        <svg
          viewBox="-200 -300 4900 3600"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          <GridBackground />
          {ROADS.map((r) => (
            <Road key={r.id} d={r.d} />
          ))}
          {FLIGHT_PATHS.map((f) => (
            <FlightPath key={f.id} d={f.d} color={f.color} />
          ))}
          <Airport />
          {MANAGERS.map(({ id, ...config }) => (
            <Manager key={id} {...config} />
          ))}
          {WORKERS.map((worker) => {
            const manager = MANAGERS.find((m) => m.id === worker.managerId)!;
            return (
              <Worker
                key={worker.id}
                position={worker.position}
                colorBase={manager.colorIcon}
                colorMid={manager.colorBase}
                colorDeep={manager.colorMid}
              />
            );
          })}
          {WORKER_LABELS.map((l) => (
            <text
              key={l.managerId}
              x={l.position.cx}
              y={l.position.cy}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize={28}
              letterSpacing={2}
              fill={palette.ink400}
            >
              WORKERS
            </text>
          ))}
          {/* DEBUG: 2 cars per road (outbound + inbound lanes) — Phase F.1 iter 1, removed in F.2 */}
          {ROADS.map((road) => {
            const manager = MANAGERS.find((m) => m.id === road.managerId)!;
            const worker = WORKERS.find((w) => w.id === road.workerId)!;
            const { x, y } = getBezierMidpoint(road.d);
            const angle =
              (Math.atan2(
                worker.position.cy - manager.position.cy,
                worker.position.cx - manager.position.cx,
              ) *
                180) /
              Math.PI;
            const perpAngleRad = (angle * Math.PI) / 180 + Math.PI / 2;
            const offX = Math.cos(perpAngleRad) * 22;
            const offY = Math.sin(perpAngleRad) * 22;
            return (
              <g key={road.id}>
                <CarIcon
                  x={x + offX}
                  y={y + offY}
                  size={32}
                  rotation={angle}
                  bodyColor={manager.colorBase}
                  accentColor={manager.colorDeep}
                />
                <CarIcon
                  x={x - offX}
                  y={y - offY}
                  size={32}
                  rotation={angle + 180}
                  bodyColor={manager.colorIcon}
                  accentColor={manager.colorBase}
                />
              </g>
            );
          })}
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
}
