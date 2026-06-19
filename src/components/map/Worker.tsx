import { palette } from "@/lib/palette";

type Props = {
  position: { cx: number; cy: number };
  colorBase: string;
  colorMid: string;
  colorDeep: string;
  // Optional per-tool label rendered below the tool. Unset (the world) renders nothing (the
  // world uses one cluster "TOOLS" label); the Sandbox passes the tool's name.
  label?: string;
  onSelect?: () => void;
};

export default function Worker({
  position: { cx, cy },
  colorBase,
  colorMid,
  colorDeep,
  label,
  onSelect,
}: Props) {
  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      style={onSelect ? { cursor: "pointer" } : undefined}
    >
      <rect
        x={cx - 40 + 8}
        y={cy - 40 + 8}
        width={80}
        height={80}
        rx={8}
        fill={colorDeep}
      />
      <rect
        x={cx - 36 + 4}
        y={cy - 36 + 4}
        width={72}
        height={72}
        rx={8}
        fill={colorMid}
      />
      <rect
        x={cx - 32}
        y={cy - 32}
        width={64}
        height={64}
        rx={6}
        fill={colorBase}
      />

      {label !== undefined && (
        <text
          x={cx}
          y={cy + 86}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize={44}
          letterSpacing={2}
          fill={palette.ink400}
        >
          {label}
        </text>
      )}
    </g>
  );
}
