"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  FLIGHT_PATHS,
  MANAGERS,
  ROADS,
  WORKERS,
  WORKER_LABELS,
  WORLD_VIEWBOX,
} from "@/lib/world-layout";
import { palette } from "@/lib/palette";
import GridBackground from "./GridBackground";
import Airport from "./Airport";
import FlightPath from "./FlightPath";
import Manager from "./Manager";
import Road from "./Road";
import Worker from "./Worker";

export default function Map() {
  return (
    <TransformWrapper
      minScale={0.3}
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
          viewBox={`0 0 ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.height}`}
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
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
}
