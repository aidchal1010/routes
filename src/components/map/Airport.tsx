import { palette } from "@/lib/palette";
import PlaneIcon from "./PlaneIcon";

export default function Airport() {
  const cx = 2200;
  const cy = 1400;

  return (
    <g>
      <rect
        x={cx - 195 + 20}
        y={cy - 105 + 20}
        width={390}
        height={210}
        rx={14}
        fill={palette.orchestratorDeep}
      />

      <rect
        x={cx - 175 + 10}
        y={cy - 85 + 10}
        width={350}
        height={170}
        rx={14}
        fill={palette.orchestratorBase}
      />

      <rect
        x={cx - 475}
        y={cy - 15}
        width={300}
        height={30}
        rx={4}
        fill={palette.night800}
      />
      <path
        d={`M ${cx - 455} ${cy} L ${cx - 195} ${cy}`}
        stroke={palette.ink100}
        strokeWidth={2}
        strokeDasharray="40 25"
      />

      <rect
        x={cx + 215}
        y={cy - 15}
        width={300}
        height={30}
        rx={4}
        fill={palette.night800}
      />
      <path
        d={`M ${cx + 235} ${cy} L ${cx + 495} ${cy}`}
        stroke={palette.ink100}
        strokeWidth={2}
        strokeDasharray="40 25"
      />

      <rect
        x={cx - 150}
        y={cy - 50}
        width={300}
        height={100}
        rx={12}
        fill={palette.orchestrator}
      />

      <circle cx={cx - 75} cy={cy} r={40} fill={palette.orchestratorLight} />
      <circle cx={cx + 75} cy={cy} r={40} fill={palette.orchestratorLight} />

      <PlaneIcon x={cx} y={cy} size={50} color={palette.ink100} />

      <text
        x={cx}
        y={cy + 195}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={28}
        letterSpacing={2}
        fill={palette.ink400}
      >
        ORCHESTRATOR
      </text>
    </g>
  );
}
