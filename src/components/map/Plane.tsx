"use client";

import { useEffect, useMemo } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { evaluate, parseBezier } from "@/lib/bezier";
import PlaneIcon from "./PlaneIcon";

type Props = {
  d: string;
  color: string;
  duration: number;
  onComplete: () => void;
};

export default function Plane({ d, color, duration, onComplete }: Props) {
  const progress = useMotionValue(0);
  const bezier = useMemo(() => parseBezier(d), [d]);

  const fadeInEnd = 0.4 / duration;
  const fadeOutStart = 1 - 0.5 / duration;

  const x = useTransform(progress, (t) => evaluate(bezier, t).x);
  const y = useTransform(progress, (t) => evaluate(bezier, t).y);
  const rotate = useTransform(progress, (t) => evaluate(bezier, t).rotation + 90);
  const opacity = useTransform(progress, (t) => {
    if (t < fadeInEnd) return t / fadeInEnd;
    if (t > fadeOutStart) return (1 - t) / (1 - fadeOutStart);
    return 1;
  });

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration,
      ease: "linear",
      onComplete,
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.g style={{ x, y, rotate, opacity }}>
      <PlaneIcon size={100} color={color} />
    </motion.g>
  );
}
