import { palette } from "./palette";

export const WORLD_VIEWBOX = { width: 4400, height: 2800 } as const;

export type IconShape = "circle" | "triangle" | "square" | "diamond";

export type ManagerConfig = {
  id: string;
  position: { cx: number; cy: number };
  colorBase: string;
  colorMid: string;
  colorDeep: string;
  colorIcon: string;
  iconShape: IconShape;
  label: string;
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
    label: "MANAGER A",
  },
  {
    id: "manager-b",
    position: { cx: 3850, cy: 1400 },
    colorBase: palette.managerBBase,
    colorMid: palette.managerBMid,
    colorDeep: palette.managerBDeep,
    colorIcon: palette.managerBLight,
    iconShape: "triangle",
    label: "MANAGER B",
  },
  {
    id: "manager-c",
    position: { cx: 2200, cy: 2450 },
    colorBase: palette.managerCBase,
    colorMid: palette.managerCMid,
    colorDeep: palette.managerCDeep,
    colorIcon: palette.managerCLight,
    iconShape: "square",
    label: "MANAGER C",
  },
  {
    id: "manager-d",
    position: { cx: 550, cy: 1400 },
    colorBase: palette.managerDBase,
    colorMid: palette.managerDMid,
    colorDeep: palette.managerDDeep,
    colorIcon: palette.managerDLight,
    iconShape: "diamond",
    label: "MANAGER D",
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
  { id: "worker-a1", position: { cx: 1850, cy: 140 }, managerId: "manager-a" },
  { id: "worker-a2", position: { cx: 2200, cy: 60 }, managerId: "manager-a" },
  { id: "worker-a3", position: { cx: 2550, cy: 140 }, managerId: "manager-a" },
  { id: "worker-b1", position: { cx: 4250, cy: 1230 }, managerId: "manager-b" },
  { id: "worker-b2", position: { cx: 4250, cy: 1570 }, managerId: "manager-b" },
  { id: "worker-c1", position: { cx: 1700, cy: 2720 }, managerId: "manager-c" },
  { id: "worker-c2", position: { cx: 1950, cy: 2630 }, managerId: "manager-c" },
  { id: "worker-c3", position: { cx: 2450, cy: 2630 }, managerId: "manager-c" },
  { id: "worker-c4", position: { cx: 2700, cy: 2720 }, managerId: "manager-c" },
  { id: "worker-d1", position: { cx: 150, cy: 1230 }, managerId: "manager-d" },
  { id: "worker-d2", position: { cx: 150, cy: 1570 }, managerId: "manager-d" },
] as const;

export const WORKER_LABELS: readonly WorkerLabelConfig[] = [
  { managerId: "manager-a", position: { cx: 2200, cy: 200 } },
  { managerId: "manager-b", position: { cx: 4250, cy: 1100 } },
  { managerId: "manager-c", position: { cx: 2200, cy: 2790 } },
  { managerId: "manager-d", position: { cx: 150, cy: 1100 } },
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

export const ROADS: readonly RoadConfig[] = [
  { id: "road-a-a1", managerId: "manager-a", workerId: "worker-a1",
    d: "M 2200 350 C 2050 250, 1900 200, 1850 140" },
  { id: "road-a-a2", managerId: "manager-a", workerId: "worker-a2",
    d: "M 2200 350 C 2250 250, 2200 150, 2200 60" },
  { id: "road-a-a3", managerId: "manager-a", workerId: "worker-a3",
    d: "M 2200 350 C 2350 250, 2500 200, 2550 140" },
  { id: "road-b-b1", managerId: "manager-b", workerId: "worker-b1",
    d: "M 3850 1400 C 4050 1400, 4200 1300, 4250 1230" },
  { id: "road-b-b2", managerId: "manager-b", workerId: "worker-b2",
    d: "M 3850 1400 C 4050 1400, 4200 1500, 4250 1570" },
  { id: "road-c-c1", managerId: "manager-c", workerId: "worker-c1",
    d: "M 2200 2450 C 1950 2550, 1750 2650, 1700 2720" },
  { id: "road-c-c2", managerId: "manager-c", workerId: "worker-c2",
    d: "M 2200 2450 C 2100 2550, 1980 2600, 1950 2630" },
  { id: "road-c-c3", managerId: "manager-c", workerId: "worker-c3",
    d: "M 2200 2450 C 2300 2550, 2420 2600, 2450 2630" },
  { id: "road-c-c4", managerId: "manager-c", workerId: "worker-c4",
    d: "M 2200 2450 C 2450 2550, 2650 2650, 2700 2720" },
  { id: "road-d-d1", managerId: "manager-d", workerId: "worker-d1",
    d: "M 550 1400 C 350 1400, 200 1300, 150 1230" },
  { id: "road-d-d2", managerId: "manager-d", workerId: "worker-d2",
    d: "M 550 1400 C 350 1400, 200 1500, 150 1570" },
] as const;
