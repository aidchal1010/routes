type Props = {
  position: { cx: number; cy: number };
  colorBase: string;
  colorMid: string;
  colorDeep: string;
};

export default function Worker({
  position: { cx, cy },
  colorBase,
  colorMid,
  colorDeep,
}: Props) {
  return (
    <g>
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
    </g>
  );
}
