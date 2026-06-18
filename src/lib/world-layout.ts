import { palette } from "./palette";

export const WORLD_VIEWBOX = { x: -50, y: -100, width: 4500, height: 3000 } as const;

export type IconShape = "circle" | "triangle" | "square" | "diamond";

export type ManagerConfig = {
  id: string;
  position: { cx: number; cy: number };
  colorBase: string;
  colorMid: string;
  colorDeep: string;
  colorIcon: string;
  iconShape: IconShape;
  domain: string;
};

export const MANAGERS: readonly ManagerConfig[] = [
  {
    id: "manager-a",
    position: { cx: 2200, cy: 350 },
    colorBase: palette.managerABase,
    colorMid: palette.managerAMid,
    colorDeep: palette.managerADeep,
    colorIcon: palette.managerALight,
    iconShape: "circle",
    domain: "RESEARCH",
  },
  {
    id: "manager-b",
    position: { cx: 3850, cy: 1400 },
    colorBase: palette.managerBBase,
    colorMid: palette.managerBMid,
    colorDeep: palette.managerBDeep,
    colorIcon: palette.managerBLight,
    iconShape: "triangle",
    domain: "DATA-ANALYSIS",
  },
  {
    id: "manager-c",
    position: { cx: 2200, cy: 2450 },
    colorBase: palette.managerCBase,
    colorMid: palette.managerCMid,
    colorDeep: palette.managerCDeep,
    colorIcon: palette.managerCLight,
    iconShape: "square",
    domain: "CODE",
  },
  {
    id: "manager-d",
    position: { cx: 550, cy: 1400 },
    colorBase: palette.managerDBase,
    colorMid: palette.managerDMid,
    colorDeep: palette.managerDDeep,
    colorIcon: palette.managerDLight,
    iconShape: "diamond",
    domain: "COMM-ACTION",
  },
] as const;

export type WorkerConfig = {
  id: string;
  position: { cx: number; cy: number };
  managerId: string;
};

export type WorkerLabelConfig = {
  managerId: string;
  position: { cx: number; cy: number };
};

export const WORKERS: readonly WorkerConfig[] = [
  { id: "worker-a1", position: { cx: 1745, cy: 77 }, managerId: "manager-a" },
  { id: "worker-a2", position: { cx: 2200, cy: -27 }, managerId: "manager-a" },
  { id: "worker-a3", position: { cx: 2655, cy: 77 }, managerId: "manager-a" },
  { id: "worker-b1", position: { cx: 4370, cy: 1179 }, managerId: "manager-b" },
  { id: "worker-b2", position: { cx: 4370, cy: 1621 }, managerId: "manager-b" },
  { id: "worker-b3", position: { cx: 4370, cy: 1400 }, managerId: "manager-b" },
  { id: "worker-c1", position: { cx: 1550, cy: 2801 }, managerId: "manager-c" },
  { id: "worker-c2", position: { cx: 1875, cy: 2684 }, managerId: "manager-c" },
  { id: "worker-c3", position: { cx: 2525, cy: 2684 }, managerId: "manager-c" },
  { id: "worker-c4", position: { cx: 2850, cy: 2801 }, managerId: "manager-c" },
  { id: "worker-d1", position: { cx: 30, cy: 1179 }, managerId: "manager-d" },
  { id: "worker-d2", position: { cx: 30, cy: 1621 }, managerId: "manager-d" },
  { id: "worker-d3", position: { cx: 30, cy: 1400 }, managerId: "manager-d" },
] as const;

export const WORKER_LABELS: readonly WorkerLabelConfig[] = [
  { managerId: "manager-a", position: { cx: 2200, cy: -150 } },
  { managerId: "manager-b", position: { cx: 4310, cy: 1055 } },
  { managerId: "manager-c", position: { cx: 2200, cy: 2841 } },
  { managerId: "manager-d", position: { cx: 90, cy: 1055 } },
] as const;

export type FlightPathConfig = {
  id: string;
  managerId: string;
  direction: "outbound" | "inbound";
  d: string;
  color: string;
};

export type RoadConfig = {
  id: string;
  managerId: string;
  workerId: string;
  d: string;
};

export const FLIGHT_PATHS: readonly FlightPathConfig[] = [
  {
    id: "flight-a-out",
    managerId: "manager-a",
    direction: "outbound",
    d: "M 2715 1400 C 3000 1300, 2400 700, 2200 350",
    color: palette.managerABase,
  },
  {
    id: "flight-a-in",
    managerId: "manager-a",
    direction: "inbound",
    d: "M 2200 350 C 1700 700, 1500 1100, 1725 1400",
    color: palette.orchestrator,
  },
  {
    id: "flight-b-out",
    managerId: "manager-b",
    direction: "outbound",
    d: "M 2715 1400 C 3100 1200, 3500 1200, 3850 1400",
    color: palette.managerBBase,
  },
  {
    id: "flight-b-in",
    managerId: "manager-b",
    direction: "inbound",
    d: "M 3850 1400 C 3850 2500, 1725 2500, 1725 1400",
    color: palette.orchestrator,
  },
  {
    id: "flight-c-out",
    managerId: "manager-c",
    direction: "outbound",
    d: "M 2715 1400 C 3000 1500, 2400 2100, 2200 2450",
    color: palette.managerCBase,
  },
  {
    id: "flight-c-in",
    managerId: "manager-c",
    direction: "inbound",
    d: "M 2200 2450 C 1700 2100, 1500 1700, 1725 1400",
    color: palette.orchestrator,
  },
  {
    id: "flight-d-out",
    managerId: "manager-d",
    direction: "outbound",
    d: "M 2715 1400 C 2715 300, 550 300, 550 1400",
    color: palette.managerDBase,
  },
  {
    id: "flight-d-in",
    managerId: "manager-d",
    direction: "inbound",
    d: "M 550 1400 C 950 1600, 1325 1600, 1725 1400",
    color: palette.orchestrator,
  },
] as const;

// The complete set of data the Map renders + animates. Map reads everything through a
// value of this shape (defaulting to WORLD_LAYOUT below), so the same motion engine can run
// on the hand-placed world OR on a layout the Sandbox builds at runtime. `airport` is
// nullable so a partially-built sandbox layout (no orchestrator yet) is representable.
export type WorldLayout = {
  airport: { cx: number; cy: number } | null;
  managers: readonly ManagerConfig[];
  workers: readonly WorkerConfig[];
  workerLabels: readonly WorkerLabelConfig[];
  roads: readonly RoadConfig[];
  flightPaths: readonly FlightPathConfig[];
};

export const ROADS: readonly RoadConfig[] = [
  { id: "road-a-a1", managerId: "manager-a", workerId: "worker-a1",
    d: "M 2200 350 C 2005 220, 1810 155, 1745 77" },
  { id: "road-a-a2", managerId: "manager-a", workerId: "worker-a2",
    d: "M 2200 350 C 2265 220, 2200 90, 2200 -27" },
  { id: "road-a-a3", managerId: "manager-a", workerId: "worker-a3",
    d: "M 2200 350 C 2395 220, 2590 155, 2655 77" },
  { id: "road-b-b1", managerId: "manager-b", workerId: "worker-b1",
    d: "M 3850 1400 C 4110 1400, 4305 1270, 4370 1179" },
  { id: "road-b-b2", managerId: "manager-b", workerId: "worker-b2",
    d: "M 3850 1400 C 4110 1400, 4305 1530, 4370 1621" },
  { id: "road-b-b3", managerId: "manager-b", workerId: "worker-b3",
    d: "M 3850 1400 C 4110 1400, 4240 1400, 4370 1400" },
  { id: "road-c-c1", managerId: "manager-c", workerId: "worker-c1",
    d: "M 2200 2450 C 1875 2580, 1615 2710, 1550 2801" },
  { id: "road-c-c2", managerId: "manager-c", workerId: "worker-c2",
    d: "M 2200 2450 C 2070 2580, 1914 2645, 1875 2684" },
  { id: "road-c-c3", managerId: "manager-c", workerId: "worker-c3",
    d: "M 2200 2450 C 2330 2580, 2486 2645, 2525 2684" },
  { id: "road-c-c4", managerId: "manager-c", workerId: "worker-c4",
    d: "M 2200 2450 C 2525 2580, 2785 2710, 2850 2801" },
  { id: "road-d-d1", managerId: "manager-d", workerId: "worker-d1",
    d: "M 550 1400 C 290 1400, 95 1270, 30 1179" },
  { id: "road-d-d2", managerId: "manager-d", workerId: "worker-d2",
    d: "M 550 1400 C 290 1400, 95 1530, 30 1621" },
  { id: "road-d-d3", managerId: "manager-d", workerId: "worker-d3",
    d: "M 550 1400 C 290 1400, 160 1400, 30 1400" },
] as const;

// The default layout the Map renders: the hand-placed world. Map's `layout` prop defaults to
// this, so /framework behaves exactly as before. The Sandbox passes its own WorldLayout. This
// is a stable module-level reference so layout-dependent effects in Map don't re-run.
export const WORLD_LAYOUT: WorldLayout = {
  airport: { cx: 2200, cy: 1400 },
  managers: MANAGERS,
  workers: WORKERS,
  workerLabels: WORKER_LABELS,
  roads: ROADS,
  flightPaths: FLIGHT_PATHS,
};
