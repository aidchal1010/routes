import { palette } from "@/lib/palette";

type Props = {
  d: string;
};

export default function Road({ d }: Props) {
  return (
    <path
      d={d}
      stroke={palette.roadGrey}
      strokeWidth={80}
      strokeLinecap="round"
      fill="none"
    />
  );
}
