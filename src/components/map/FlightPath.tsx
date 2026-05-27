type Props = {
  d: string;
  color: string;
};

export default function FlightPath({ d, color }: Props) {
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={3}
      strokeDasharray="10 8"
      strokeOpacity={0.55}
      strokeLinecap="round"
      fill="none"
    />
  );
}
