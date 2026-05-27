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
