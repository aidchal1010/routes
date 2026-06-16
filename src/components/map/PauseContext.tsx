"use client";

import { createContext, useContext, useMemo, useState } from "react";

// Carries only the global paused boolean + setters. It knows nothing about
// framer-motion controls or the timeout manager — vehicles and Map each subscribe
// to `paused` and freeze their own surface. Closing a popup (later step) calls
// resume(); the legend/key must never touch this.
type PauseContextValue = {
  paused: boolean;
  pause: () => void;
  resume: () => void;
};

const PauseContext = createContext<PauseContextValue | null>(null);

export function PauseProvider({ children }: { children: React.ReactNode }) {
  // Start paused so the world is frozen on first paint, before the user is oriented.
  // FrameworkShell resumes once it knows the welcome won't auto-show (or when it's
  // dismissed). PauseProvider is only mounted on /framework, so nothing else relies on
  // the prior `false` default.
  const [paused, setPaused] = useState(true);
  const value = useMemo<PauseContextValue>(
    () => ({
      paused,
      pause: () => setPaused(true),
      resume: () => setPaused(false),
    }),
    [paused],
  );
  return <PauseContext.Provider value={value}>{children}</PauseContext.Provider>;
}

export function usePause(): PauseContextValue {
  const ctx = useContext(PauseContext);
  if (!ctx) throw new Error("usePause must be used within a PauseProvider");
  return ctx;
}
