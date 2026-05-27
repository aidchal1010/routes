import { palette } from "@/lib/palette";

export default function GridBackground() {
  return (
    <g>
      <defs>
        <pattern
          id="blueprint-grid"
          width={300}
          height={300}
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 300 0 L 0 0 0 300"
            fill="none"
            stroke={palette.grid}
            strokeWidth={2}
            strokeOpacity={0.6}
          />
        </pattern>
      </defs>
      <rect
        x={-50000}
        y={-50000}
        width={100000}
        height={100000}
        fill="url(#blueprint-grid)"
      />
    </g>
  );
}
