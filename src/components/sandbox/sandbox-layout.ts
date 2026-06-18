import {
  MANAGERS,
  type FlightPathConfig,
  type ManagerConfig,
  type RoadConfig,
  type WorkerConfig,
  type WorkerLabelConfig,
  type WorldLayout,
} from "@/lib/world-layout";
import { palette } from "@/lib/palette";

// A point in SVG world units. Mirrors the {cx, cy} shape buildings already use.
export type Point = { cx: number; cy: number };

// The pieces the visitor has dropped. This is the editable source of truth; buildLayout()
// derives the renderable/animatable WorldLayout from it. `id` strings are the join keys the
// motion engine matches on — deriving everything from one set of ids is what keeps the
// fragile dispatchCycle string-join consistent.
export type PlacedOrchestrator = { position: Point };
export type PlacedManager = { id: string; position: Point; domainIndex: number };
export type PlacedTool = { id: string; position: Point; managerId: string };

export type SandboxLayout = {
  orchestrator: PlacedOrchestrator | null;
  managers: PlacedManager[];
  tools: PlacedTool[];
};

export const EMPTY_SANDBOX: SandboxLayout = {
  orchestrator: null,
  managers: [],
  tools: [],
};

export type PieceKind = "orchestrator" | "manager" | "tool";
// Shared between the palette (drag source) and the canvas (drop target).
export const PIECE_MIME = "application/x-sandbox-piece";

// The four fixed domains, in placement order, sourced from the world managers so a sandbox
// manager looks identical to its world counterpart (color family, icon shape, domain label).
// The palette advances through these by index as managers are placed.
export const DOMAINS: readonly ManagerConfig[] = MANAGERS;
export const MAX_MANAGERS = DOMAINS.length;

// Session-unique ids. A full reload (which also clears the layout) resets the counter.
let idCounter = 0;
export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

// Emit EXACTLY the one-cubic form parseBezier accepts: "M x0 y0 C x1 y1, x2 y2, x3 y3"
// (single cubic, comma between points, plain decimals — no exponents). Anything else makes
// parseBezier throw "bad bezier d" and breaks vehicle motion.
export function cubicPath(p0: Point, p1: Point, p2: Point, p3: Point): string {
  return (
    `M ${round(p0.cx)} ${round(p0.cy)} ` +
    `C ${round(p1.cx)} ${round(p1.cy)}, ` +
    `${round(p2.cx)} ${round(p2.cy)}, ` +
    `${round(p3.cx)} ${round(p3.cy)}`
  );
}

// A gentle curved cubic from A to B, bowed perpendicular to the A->B line. `bowFrac` is the
// bow as a fraction of the A->B distance, applied to the left of the travel direction; the
// reverse-direction path (B->A) therefore bows to the opposite geometric side, giving the
// outbound/inbound flight pair two visible lanes like the world's hand-placed paths.
export function bowedCubic(a: Point, b: Point, bowFrac: number): string {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const dist = Math.hypot(dx, dy) || 1;
  const px = -dy / dist; // unit perpendicular (direction rotated +90°)
  const py = dx / dist;
  const bow = bowFrac * dist;
  const c1: Point = { cx: a.cx + dx / 3 + px * bow, cy: a.cy + dy / 3 + py * bow };
  const c2: Point = {
    cx: a.cx + (2 * dx) / 3 + px * bow,
    cy: a.cy + (2 * dy) / 3 + py * bow,
  };
  return cubicPath(a, c1, c2, b);
}

const ROAD_BOW = 0.12;
const FLIGHT_BOW = 0.2;
const TOOLS_LABEL_RISE = 120; // nudge the "TOOLS" label above the cluster centroid

// Find the placed manager nearest a point (a dropped tool attaches to it). null if none.
export function nearestManagerId(
  managers: PlacedManager[],
  point: Point,
): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const m of managers) {
    const d =
      (m.position.cx - point.cx) ** 2 + (m.position.cy - point.cy) ** 2;
    if (d < bestD) {
      bestD = d;
      best = m.id;
    }
  }
  return best;
}

// Derive the renderable + animatable layout from the placed pieces. Pure; defined for every
// partial state (empty, orchestrator-only, managers without tools). Every road/flight join
// key is taken from the same manager.id / tool.id used to build managers/workers, so the
// dispatchCycle string-join cannot desync.
export function buildLayout(sandbox: SandboxLayout): WorldLayout {
  const airport = sandbox.orchestrator ? sandbox.orchestrator.position : null;

  const managers: ManagerConfig[] = sandbox.managers.map((m) => {
    const style = DOMAINS[m.domainIndex];
    return {
      id: m.id,
      position: m.position,
      colorBase: style.colorBase,
      colorMid: style.colorMid,
      colorDeep: style.colorDeep,
      colorIcon: style.colorIcon,
      iconShape: style.iconShape,
      domain: style.domain,
    };
  });

  const workers: WorkerConfig[] = sandbox.tools.map((t) => ({
    id: t.id,
    position: t.position,
    managerId: t.managerId,
  }));

  // Roads: authored manager -> tool (the inbound Car reuses the same `d` and reverses).
  const roads: RoadConfig[] = [];
  for (const tool of sandbox.tools) {
    const mgr = sandbox.managers.find((m) => m.id === tool.managerId);
    if (!mgr) continue;
    roads.push({
      id: makeRoadId(tool.id),
      managerId: mgr.id,
      workerId: tool.id,
      d: bowedCubic(mgr.position, tool.position, ROAD_BOW),
    });
  }

  // Flight paths: outbound (airport -> manager, manager color) + inbound (manager -> airport,
  // purple) per manager, authored in travel direction; the Plane animates 0->1 along each.
  const flightPaths: FlightPathConfig[] = [];
  if (airport) {
    for (const m of managers) {
      flightPaths.push({
        id: `flight-${m.id}-out`,
        managerId: m.id,
        direction: "outbound",
        d: bowedCubic(airport, m.position, FLIGHT_BOW),
        color: m.colorBase,
      });
      flightPaths.push({
        id: `flight-${m.id}-in`,
        managerId: m.id,
        direction: "inbound",
        d: bowedCubic(m.position, airport, FLIGHT_BOW),
        color: palette.orchestrator,
      });
    }
  }

  // One "TOOLS" label per manager that has tools, at the cluster centroid nudged upward.
  const workerLabels: WorkerLabelConfig[] = [];
  for (const m of managers) {
    const mgrTools = sandbox.tools.filter((t) => t.managerId === m.id);
    if (mgrTools.length === 0) continue;
    const cx =
      mgrTools.reduce((s, t) => s + t.position.cx, 0) / mgrTools.length;
    const cy =
      mgrTools.reduce((s, t) => s + t.position.cy, 0) / mgrTools.length;
    workerLabels.push({ managerId: m.id, position: { cx, cy: cy - TOOLS_LABEL_RISE } });
  }

  return { airport, managers, workers, workerLabels, roads, flightPaths };
}

function makeRoadId(toolId: string): string {
  return `road-${toolId}`;
}

// Play is allowed only for a complete, teachable layout: an orchestrator, at least one
// manager, and every manager holding at least one tool (a tool-less manager would hit the
// engine's N===0 early-return and never send a return plane, which reads as broken).
export function canPlay(sandbox: SandboxLayout): boolean {
  if (!sandbox.orchestrator) return false;
  if (sandbox.managers.length === 0) return false;
  return sandbox.managers.every((m) =>
    sandbox.tools.some((t) => t.managerId === m.id),
  );
}

// Dev-only backstop: returns a list of structural problems with a built layout. Catches a
// generator bug before it manifests as a silent zero-car cycle.
export function validateLayout(layout: WorldLayout): string[] {
  const problems: string[] = [];
  const managerIds = new Set(layout.managers.map((m) => m.id));
  const workerIds = new Set(layout.workers.map((w) => w.id));

  for (const r of layout.roads) {
    if (!managerIds.has(r.managerId))
      problems.push(`road ${r.id} references missing manager ${r.managerId}`);
    if (!workerIds.has(r.workerId))
      problems.push(`road ${r.id} references missing tool ${r.workerId}`);
  }
  for (const m of layout.managers) {
    const out = layout.flightPaths.filter(
      (f) => f.managerId === m.id && f.direction === "outbound",
    ).length;
    const inb = layout.flightPaths.filter(
      (f) => f.managerId === m.id && f.direction === "inbound",
    ).length;
    if (out !== 1 || inb !== 1)
      problems.push(
        `manager ${m.id} should have 1 outbound + 1 inbound flight (has ${out}/${inb})`,
      );
    if (!layout.workers.some((w) => w.managerId === m.id))
      problems.push(`manager ${m.id} has no tools`);
  }
  return problems;
}
