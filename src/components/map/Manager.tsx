import { palette } from "@/lib/palette";
import type { IconShape } from "@/lib/world-layout";

type Props = {
  position: { cx: number; cy: number };
  colorBase: string;
  colorMid: string;
  colorDeep: string;
  colorIcon: string;
  iconShape: IconShape;
  label: string;
  onSelect?: () => void;
};

export default function Manager({
  position: { cx, cy },
  colorBase,
  colorMid,
  colorDeep,
  colorIcon,
  iconShape,
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
        x={cx - 90 + 14}
        y={cy - 90 + 14}
        width={180}
        height={180}
        rx={12}
        fill={colorDeep}
      />
      <rect
        x={cx - 80 + 7}
        y={cy - 80 + 7}
        width={160}
        height={160}
        rx={12}
        fill={colorMid}
      />
      <rect
        x={cx - 70}
        y={cy - 70}
        width={140}
        height={140}
        rx={10}
        fill={colorBase}
      />

      {iconShape === "circle" && (
        <circle cx={cx} cy={cy} r={25} fill={colorIcon} />
      )}
      {iconShape === "square" && (
        <rect
          x={cx - 25}
          y={cy - 25}
          width={50}
          height={50}
          rx={4}
          fill={colorIcon}
        />
      )}
      {iconShape === "triangle" && (
        <polygon
          points={`${cx},${cy - 29} ${cx - 25},${cy + 14} ${cx + 25},${cy + 14}`}
          fill={colorIcon}
        />
      )}
      {iconShape === "diamond" && (
        <polygon
          points={`${cx},${cy - 25} ${cx + 25},${cy} ${cx},${cy + 25} ${cx - 25},${cy}`}
          fill={colorIcon}
        />
      )}

      <text
        x={cx}
        y={cy + 150}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={28}
        letterSpacing={2}
        fill={palette.ink400}
      >
        {label}
      </text>
    </g>
  );
}
