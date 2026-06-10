"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  FLIGHT_PATHS,
  MANAGERS,
  ROADS,
  WORKERS,
  WORKER_LABELS,
} from "@/lib/world-layout";
import { palette } from "@/lib/palette";
import {
  createPausableTimeouts,
  type PausableTimeouts,
} from "@/lib/pausable-timeouts";
import { usePause } from "./PauseContext";
import { getPlaceholderContent } from "./element-content";
import type { PanelContent } from "./InfoPanel";
import GridBackground from "./GridBackground";
import Airport from "./Airport";
import Car from "./Car";
import FlightPath from "./FlightPath";
import Manager from "./Manager";
import Plane from "./Plane";
import Road from "./Road";
import Worker from "./Worker";

type ActivePlane = {
  id: string;
  d: string;
  color: string;
  duration: number;
  direction: "outbound" | "inbound";
  managerId: string;
  pathId: string;
};

type ActiveCar = {
  id: string;
  d: string;
  bodyColor: string;
  accentColor: string;
  duration: number;
  laneOffset: number;
  direction: "outbound" | "inbound";
  roadId: string;
  cycleId: string;
};

type Cycle = {
  cycleId: string;
  managerId: string;
  outstandingCars: number;
  totalCars: number;
  triggeredByPlaneId: string;
};

const PLANE_DURATION = 6;
const CAR_DURATION = 4;
const MAX_OUTBOUND_PLANES = 8;
const MAX_INBOUND_PLANES = 12;
const MAX_CARS_PER_DIRECTION = 12;
const MAX_PER_PATH_OR_ROAD = 2;
const MAX_INBOUND_RETRIES = 10;

const OUTBOUND_PATHS = FLIGHT_PATHS.filter((f) => f.direction === "outbound");

function pickBurstSize(): number {
  const r = Math.random();
  if (r < 0.5) return 1;
  if (r < 0.8) return 2;
  return 3;
}

function tryAddPlane(prev: ActivePlane[], plane: ActivePlane): ActivePlane[] {
  const cap =
    plane.direction === "outbound" ? MAX_OUTBOUND_PLANES : MAX_INBOUND_PLANES;
  if (prev.filter((p) => p.direction === plane.direction).length >= cap)
    return prev;
  if (
    prev.filter((p) => p.pathId === plane.pathId).length >= MAX_PER_PATH_OR_ROAD
  )
    return prev;
  return [...prev, plane];
}

type MapProps = {
  onElementClick: (content: PanelContent) => void;
  onBackgroundClick: () => void;
};

export default function Map({ onElementClick, onBackgroundClick }: MapProps) {
  const [activePlanes, setActivePlanes] = useState<ActivePlane[]>([]);
  const [activeCars, setActiveCars] = useState<ActiveCar[]>([]);
  const activeCarsRef = useRef<ActiveCar[]>([]);
  const activeCycles = useRef<globalThis.Map<string, Cycle>>(
    new globalThis.Map(),
  );
  const lastCarSpawnAt = useRef<globalThis.Map<string, number>>(
    new globalThis.Map(),
  );
  const { paused } = usePause();
  const timersRef = useRef<PausableTimeouts | null>(null);
  if (!timersRef.current) timersRef.current = createPausableTimeouts();
  const timers = timersRef.current;

  const setActiveCarsBoth = useCallback(
    (updater: (prev: ActiveCar[]) => ActiveCar[]) => {
      setActiveCars((prev) => {
        const next = updater(prev);
        activeCarsRef.current = next;
        return next;
      });
    },
    [],
  );

  const countCarsOnRoad = useCallback(
    (roadId: string) =>
      activeCarsRef.current.filter((c) => c.roadId === roadId).length,
    [],
  );

  const countCarsByDirection = useCallback(
    (direction: "outbound" | "inbound") =>
      activeCarsRef.current.filter((c) => c.direction === direction).length,
    [],
  );

  const scheduleSynthesisAndReturn = useCallback(
    (managerId: string) => {
      const delay = 1000 + Math.random() * 2000;
      timers.set(() => {
        const inbound = FLIGHT_PATHS.find(
          (f) => f.managerId === managerId && f.direction === "inbound",
        );
        if (!inbound) return;
        setActivePlanes((prev) =>
          tryAddPlane(prev, {
            id: `plane-${Date.now()}-${Math.random()}`,
            d: inbound.d,
            color: inbound.color,
            duration: PLANE_DURATION,
            direction: "inbound",
            managerId,
            pathId: inbound.id,
          }),
        );
      }, delay);
    },
    [timers],
  );

  const spawnInboundCarReturn = useCallback(
    (roadId: string, cycleId: string, retries = 0) => {
      if (retries >= MAX_INBOUND_RETRIES) {
        const cycle = activeCycles.current.get(cycleId);
        if (!cycle) return;
        cycle.outstandingCars--;
        if (cycle.outstandingCars <= 0) {
          activeCycles.current.delete(cycleId);
          scheduleSynthesisAndReturn(cycle.managerId);
        }
        return;
      }

      const road = ROADS.find((r) => r.id === roadId);
      if (!road) return;
      const manager = MANAGERS.find((m) => m.id === road.managerId);
      if (!manager) return;

      if (countCarsByDirection("inbound") >= MAX_CARS_PER_DIRECTION) {
        timers.set(() => {
          spawnInboundCarReturn(roadId, cycleId, retries + 1);
        }, 1000);
        return;
      }

      const key = `${roadId}-inbound`;
      const now = Date.now();
      if (now - (lastCarSpawnAt.current.get(key) ?? 0) < 500) {
        timers.set(() => {
          spawnInboundCarReturn(roadId, cycleId, retries + 1);
        }, 500);
        return;
      }
      lastCarSpawnAt.current.set(key, now);

      setActiveCarsBoth((prev) => [
        ...prev,
        {
          id: `car-${Date.now()}-${Math.random()}`,
          d: road.d,
          bodyColor: manager.colorIcon,
          accentColor: manager.colorBase,
          duration: CAR_DURATION,
          laneOffset: -22,
          direction: "inbound",
          roadId,
          cycleId,
        },
      ]);
    },
    [countCarsByDirection, scheduleSynthesisAndReturn, setActiveCarsBoth, timers],
  );

  const dispatchCycle = useCallback(
    (planeId: string, managerId: string) => {
      const manager = MANAGERS.find((m) => m.id === managerId);
      if (!manager) return;
      const workersForManager = WORKERS.filter(
        (w) => w.managerId === managerId,
      );
      const N = workersForManager.length;
      if (N === 0) return;
      const C = 1 + Math.floor(Math.random() * N);

      const shuffled = [...workersForManager].sort(() => Math.random() - 0.5);
      const chosenWorkers = shuffled.slice(0, C);
      const cycleId = `cycle-${Date.now()}-${Math.random()}`;
      let actuallyDispatched = 0;

      for (const worker of chosenWorkers) {
        const road = ROADS.find(
          (r) => r.managerId === managerId && r.workerId === worker.id,
        );
        if (!road) continue;

        if (countCarsByDirection("outbound") >= MAX_CARS_PER_DIRECTION)
          continue;
        if (countCarsOnRoad(road.id) >= MAX_PER_PATH_OR_ROAD) continue;
        const key = `${road.id}-outbound`;
        const now = Date.now();
        if (now - (lastCarSpawnAt.current.get(key) ?? 0) < 500) continue;
        lastCarSpawnAt.current.set(key, now);

        setActiveCarsBoth((prev) => [
          ...prev,
          {
            id: `car-${Date.now()}-${Math.random()}`,
            d: road.d,
            bodyColor: manager.colorBase,
            accentColor: manager.colorDeep,
            duration: CAR_DURATION,
            laneOffset: 22,
            direction: "outbound",
            roadId: road.id,
            cycleId,
          },
        ]);
        actuallyDispatched++;
      }

      if (actuallyDispatched === 0) {
        scheduleSynthesisAndReturn(managerId);
        return;
      }

      activeCycles.current.set(cycleId, {
        cycleId,
        managerId,
        outstandingCars: actuallyDispatched,
        totalCars: actuallyDispatched,
        triggeredByPlaneId: planeId,
      });

      timers.set(() => {
        const stuck = activeCycles.current.get(cycleId);
        if (stuck) {
          activeCycles.current.delete(cycleId);
          scheduleSynthesisAndReturn(managerId);
        }
      }, 60000);
    },
    [
      countCarsByDirection,
      countCarsOnRoad,
      scheduleSynthesisAndReturn,
      setActiveCarsBoth,
      timers,
    ],
  );

  const handlePlaneComplete = useCallback(
    (id: string, direction: "outbound" | "inbound", managerId: string) => {
      if (direction === "inbound") {
        setActivePlanes((prev) => prev.filter((p) => p.id !== id));
        return;
      }
      setActivePlanes((prev) => prev.filter((p) => p.id !== id));
      const decompositionDelay = 300 + Math.random() * 500;
      timers.set(() => {
        dispatchCycle(id, managerId);
      }, decompositionDelay);
    },
    [dispatchCycle, timers],
  );

  const handleCarComplete = useCallback(
    (
      id: string,
      direction: "outbound" | "inbound",
      roadId: string,
      cycleId: string,
    ) => {
      if (direction === "outbound") {
        setActiveCarsBoth((prev) => prev.filter((c) => c.id !== id));
        const workDelay = 1000 + Math.random() * 2000;
        timers.set(() => {
          spawnInboundCarReturn(roadId, cycleId);
        }, workDelay);
        return;
      }
      setActiveCarsBoth((prev) => prev.filter((c) => c.id !== id));
      const cycle = activeCycles.current.get(cycleId);
      if (!cycle) return;
      cycle.outstandingCars--;
      if (cycle.outstandingCars <= 0) {
        activeCycles.current.delete(cycleId);
        scheduleSynthesisAndReturn(cycle.managerId);
      }
    },
    [setActiveCarsBoth, spawnInboundCarReturn, scheduleSynthesisAndReturn, timers],
  );

  // Mirror the global pause flag onto the timeout manager so the causal chain
  // freezes in lockstep with the vehicle animations (which pause themselves).
  useEffect(() => {
    if (paused) timers.pauseAll();
    else timers.resumeAll();
  }, [paused, timers]);

  // Cleanup on unmount: clear pending timeouts and active cycles.
  useEffect(() => {
    const cycles = activeCycles.current;
    return () => {
      timers.clearAll();
      cycles.clear();
    };
  }, [timers]);

  // Plane spawner: every 1.5–3s, fire a burst of 1–3 staggered outbound planes to
  // distinct managers. Both the stagger and the next-burst reschedule are managed
  // timers, so a global pause freezes the spawner with no separate gate.
  useEffect(() => {
    const spawnBurst = () => {
      const burstSize = pickBurstSize();
      const shuffled = [...OUTBOUND_PATHS].sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, burstSize);
      for (let i = 0; i < chosen.length; i++) {
        const path = chosen[i];
        timers.set(() => {
          setActivePlanes((prev) =>
            tryAddPlane(prev, {
              id: `plane-${Date.now()}-${Math.random()}`,
              d: path.d,
              color: path.color,
              duration: PLANE_DURATION,
              direction: "outbound",
              managerId: path.managerId,
              pathId: path.id,
            }),
          );
        }, i * 150);
      }
      timers.set(spawnBurst, 1500 + Math.random() * 1500);
    };

    spawnBurst();
    // Unmount clearing is handled by the dedicated cleanup effect (timers.clearAll()).
  }, [timers]);

  return (
    <TransformWrapper
      minScale={0.9}
      maxScale={4}
      initialScale={0.9}
      centerOnInit
      limitToBounds
      autoAlignment={{ sizeX: 100, sizeY: 100 }}
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
          onClick={onBackgroundClick}
        >
          <GridBackground />
          {ROADS.map((r) => (
            <Road key={r.id} d={r.d} />
          ))}
          {FLIGHT_PATHS.map((f) => (
            <FlightPath key={f.id} d={f.d} color={f.color} />
          ))}
          <Airport
            onSelect={() =>
              onElementClick(
                getPlaceholderContent(
                  "orchestrator",
                  "ORCHESTRATOR",
                  palette.orchestrator,
                ),
              )
            }
          />
          {MANAGERS.map(({ id, ...config }) => (
            <Manager
              key={id}
              {...config}
              onSelect={() =>
                onElementClick(
                  getPlaceholderContent(
                    "manager",
                    `MANAGER · ${config.domain}`,
                    config.colorBase,
                    id,
                  ),
                )
              }
            />
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
                onSelect={() =>
                  onElementClick(
                    getPlaceholderContent("tool", "TOOL", manager.colorIcon),
                  )
                }
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
              fontSize={36}
              letterSpacing={2}
              fill={palette.ink400}
            >
              TOOLS
            </text>
          ))}
          {activeCars.map((c) => (
            <Car
              key={c.id}
              d={c.d}
              bodyColor={c.bodyColor}
              accentColor={c.accentColor}
              duration={c.duration}
              laneOffset={c.laneOffset}
              direction={c.direction}
              onComplete={() =>
                handleCarComplete(c.id, c.direction, c.roadId, c.cycleId)
              }
              onSelect={() =>
                onElementClick(
                  getPlaceholderContent(
                    c.direction === "outbound" ? "car-outbound" : "car-inbound",
                    c.direction === "outbound" ? "TOOL CALL" : "TOOL RESULT",
                    c.bodyColor,
                  ),
                )
              }
            />
          ))}
          {activePlanes.map((p) => (
            <Plane
              key={p.id}
              d={p.d}
              color={p.color}
              duration={p.duration}
              onComplete={() =>
                handlePlaneComplete(p.id, p.direction, p.managerId)
              }
              onSelect={() =>
                onElementClick(
                  getPlaceholderContent(
                    p.direction === "outbound" ? "plane-outbound" : "plane-inbound",
                    p.direction === "outbound" ? "TASK DISPATCH" : "RESULT RETURN",
                    p.color,
                  ),
                )
              }
            />
          ))}
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
}
