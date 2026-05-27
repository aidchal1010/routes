export type CubicBezier = {
  p0: { x: number; y: number };
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
};

export function parseBezier(d: string): CubicBezier {
  const m = d.match(
    /M\s+([\d.-]+)\s+([\d.-]+)\s+C\s+([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+),\s*([\d.-]+)\s+([\d.-]+)/,
  );
  if (!m) throw new Error(`bad bezier d: ${d}`);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = m.slice(1).map(parseFloat);
  return {
    p0: { x: x0, y: y0 },
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
    p3: { x: x3, y: y3 },
  };
}

export function evaluate(
  b: CubicBezier,
  t: number,
): { x: number; y: number; rotation: number } {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  const x =
    mt3 * b.p0.x + 3 * mt2 * t * b.p1.x + 3 * mt * t2 * b.p2.x + t3 * b.p3.x;
  const y =
    mt3 * b.p0.y + 3 * mt2 * t * b.p1.y + 3 * mt * t2 * b.p2.y + t3 * b.p3.y;

  const dx =
    3 * mt2 * (b.p1.x - b.p0.x) +
    6 * mt * t * (b.p2.x - b.p1.x) +
    3 * t2 * (b.p3.x - b.p2.x);
  const dy =
    3 * mt2 * (b.p1.y - b.p0.y) +
    6 * mt * t * (b.p2.y - b.p1.y) +
    3 * t2 * (b.p3.y - b.p2.y);
  const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

  return { x, y, rotation };
}
