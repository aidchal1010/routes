type Props = {
  size: number;
  color: string;
  x?: number;
  y?: number;
};

export default function PlaneIcon({ size, color, x = 0, y = 0 }: Props) {
  const scale = size / 100;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M 0 -50 L -3 -30 L -5 -10 L -48 5 L -48 12 L -4 15 L -4 28 L -22 38 L -22 44 L -3 42 L 0 48 L 3 42 L 22 44 L 22 38 L 4 28 L 4 15 L 48 12 L 48 5 L 5 -10 L 3 -30 Z"
        fill={color}
      />
    </g>
  );
}
