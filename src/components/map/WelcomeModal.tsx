"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// One screen of orientation copy. Length is intentionally data-driven: a single entry
// renders as one screen, several entries render as a walkthrough with Back/Next. The
// final wording and the single-vs-walkthrough call are a later content pass — this is
// placeholder draft text.
type WelcomeStep = { title: string; body: string; points?: string[] };

const STEPS: WelcomeStep[] = [
  {
    title: "Welcome to Routes",
    body: "Routes is a living map of how modern AI agent systems are built. Instead of one model trying to do everything, the work is split across a team. A central coordinator plans the job and hands pieces to specialists, and each specialist reaches for the tools it needs. This world shows that structure in motion.",
  },
  {
    title: "How to read the world",
    body: "Every building and vehicle stands for one real part of an agent system.",
    points: [
      "The airport at the center is the orchestrator, the lead agent that plans the work.",
      "The four colored buildings around it are managers, each a specialist in its own domain.",
      "The small buildings are tools, the concrete capabilities a manager can call.",
      "Planes carry tasks between the airport and managers. Cars carry tool calls between a manager and its tools.",
    ],
  },
  {
    title: "How to explore",
    body: "The world runs on its own, and you can dig into any part of it.",
    points: [
      "Click anything to pause the world and read what it is and how to build it.",
      "Drag to pan, and scroll or pinch to zoom.",
      "Close a panel to let the world pick up where it left off.",
    ],
  },
];

type Props = {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
  // Seeds the "don't show again" checkbox so a manual reopen reflects the saved
  // preference instead of always defaulting to unchecked.
  initialDontShowAgain?: boolean;
};

export default function WelcomeModal({
  open,
  onClose,
  initialDontShowAgain = false,
}: Props) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(initialDontShowAgain);

  // Reset to the first step and sync the checkbox to the persisted preference each
  // time the modal opens (fresh visit, or reopened via the "?" button).
  useEffect(() => {
    if (open) {
      setStep(0);
      setDontShowAgain(initialDontShowAgain);
    }
  }, [open, initialDontShowAgain]);

  // ESC closes — listener only active while open. Mirrors InfoPanel's pattern. Depends
  // on dontShowAgain so the close reports the current checkbox value.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(dontShowAgain);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dontShowAgain, onClose]);

  const multi = STEPS.length > 1;
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleClose = () => onClose(dontShowAgain);

  return (
    <AnimatePresence>
      {open && (
        // Backdrop: dimmed, blurred scrim over the frozen world. Clicking it closes.
        <motion.div
          key="welcome-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          onClick={handleClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
        >
          {/* Card: stops click propagation so clicking inside doesn't dismiss. */}
          <motion.div
            key="welcome-card"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Welcome to Routes"
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-night-800 bg-night-950 shadow-2xl"
          >
            {/* Close (X) */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-4 top-4 text-xl leading-none text-ink-400 transition-colors hover:text-ink-100"
            >
              ×
            </button>

            {/* Step body — fades between steps */}
            <div className="px-7 pt-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                >
                  <h2 className="pr-8 font-mono text-lg tracking-wide text-ink-100">
                    {current.title}
                  </h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-terminal">
                    {current.body}
                  </p>
                  {current.points && (
                    <ul className="mt-4 space-y-2.5">
                      {current.points.map((point, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-[13px] leading-relaxed text-terminal"
                        >
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-orchestrator" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step dots (multi-step only) */}
            {multi && (
              <div className="mt-6 flex justify-center gap-1.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === step ? "w-4 bg-orchestrator" : "w-1.5 bg-night-800"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Footer: don't-show-again + navigation */}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-night-800 px-7 py-4">
              <label className="flex cursor-pointer select-none items-center gap-2 text-[12px] text-ink-400">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-3.5 w-3.5 accent-orchestrator"
                />
                Don&apos;t show again
              </label>

              <div className="flex items-center gap-2">
                {multi && !isLast && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-2 py-1.5 text-[13px] text-ink-400 transition-colors hover:text-ink-100"
                  >
                    Skip
                  </button>
                )}
                {multi && step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="rounded-md border border-night-800 px-3.5 py-1.5 text-[13px] text-ink-100 transition-colors hover:bg-night-900"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={isLast ? handleClose : () => setStep((s) => s + 1)}
                  className="rounded-md bg-orchestrator px-4 py-1.5 text-[13px] font-medium text-ink-100 transition-colors hover:bg-orchestratorLight"
                >
                  {isLast ? "Explore →" : "Next →"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
