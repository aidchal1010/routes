import { palette } from "@/lib/palette";

type Props = {
  size: number;
  bodyColor: string;
  accentColor: string;
  x?: number;
  y?: number;
  rotation?: number;
};

export default function CarIcon({
  size,
  bodyColor,
  accentColor,
  x = 0,
  y = 0,
  rotation = 0,
}: Props) {
  const scale = size / 16;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}>
      <rect x={-15} y={-8} width={30} height={16} rx={4} fill={bodyColor} />
      <rect x={2} y={-6} width={8} height={12} rx={2} fill={accentColor} />
      <rect x={11} y={-3} width={3} height={6} rx={1} fill={palette.terminal} />
    </g>
  );
}
