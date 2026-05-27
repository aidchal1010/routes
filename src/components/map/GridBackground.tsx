import { palette } from "@/lib/palette";
import { WORLD_VIEWBOX } from "@/lib/world-layout";

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
        x={-WORLD_VIEWBOX.width * 10}
        y={-WORLD_VIEWBOX.height * 10}
        width={WORLD_VIEWBOX.width * 20}
        height={WORLD_VIEWBOX.height * 20}
        fill="url(#blueprint-grid)"
      />
    </g>
  );
}
