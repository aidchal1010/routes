"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { evaluate, parseBezier } from "@/lib/bezier";
import { usePause } from "./PauseContext";
import CarIcon from "./CarIcon";

type Props = {
  d: string;
  bodyColor: string;
  accentColor: string;
  duration: number;
  laneOffset: number;
  direction: "outbound" | "inbound";
  onComplete: () => void;
  onSelect?: () => void;
};

export default function Car({
  d,
  bodyColor,
  accentColor,
  duration,
  laneOffset,
  direction,
  onComplete,
  onSelect,
}: Props) {
  const { paused } = usePause();
  const isInbound = direction === "inbound";
  const progress = useMotionValue(isInbound ? 1 : 0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const bezier = useMemo(() => parseBezier(d), [d]);

  const fadeInEnd = 0.4 / duration;
  const fadeOutStart = 1 - 0.5 / duration;

  const x = useTransform(progress, (t) => {
    const p = evaluate(bezier, t);
    const perpX = -Math.sin((p.rotation * Math.PI) / 180) * laneOffset;
    return p.x + perpX;
  });
  const y = useTransform(progress, (t) => {
    const p = evaluate(bezier, t);
    const perpY = Math.cos((p.rotation * Math.PI) / 180) * laneOffset;
    return p.y + perpY;
  });
  const rotate = useTransform(progress, (t) => {
    return evaluate(bezier, t).rotation + (isInbound ? 180 : 0);
  });
  // Inbound progress runs 1 → 0, so map to canonical 0 → 1 for fade math.
  const opacity = useTransform(progress, (raw) => {
    const t = isInbound ? 1 - raw : raw;
    if (t < fadeInEnd) return t / fadeInEnd;
    if (t > fadeOutStart) return (1 - t) / (1 - fadeOutStart);
    return 1;
  });
  // Ignore clicks while the car is faint (the brief fade tails).
  const pointerEvents = useTransform(opacity, (o) => (o < 0.4 ? "none" : "auto"));

  useEffect(() => {
    const controls = animate(progress, isInbound ? 0 : 1, {
      duration,
      ease: "linear",
      onComplete,
    });
    controlsRef.current = controls;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Freeze/resume this vehicle's own animation in step with the global pause flag.
  useEffect(() => {
    if (paused) controlsRef.current?.pause();
    else controlsRef.current?.play();
  }, [paused]);

  return (
    <motion.g
      style={{ x, y, rotate, opacity, pointerEvents, cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* Enlarged invisible hit area — the car icon is a small, moving target. */}
      <rect x={-28} y={-28} width={56} height={56} fill="transparent" />
      <CarIcon size={32} bodyColor={bodyColor} accentColor={accentColor} />
    </motion.g>
  );
}
