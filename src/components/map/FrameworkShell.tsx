"use client";

import { useEffect, useState } from "react";
import { usePause } from "./PauseContext";
import InfoPanel, { type PanelContent } from "./InfoPanel";
import Map from "./Map";
import WelcomeModal from "./WelcomeModal";

// localStorage flag set when the visitor checks "don't show again". Absent = the
// welcome auto-shows on entering /framework.
const WELCOME_DISMISSED_KEY = "routes-welcome-dismissed";

export default function FrameworkShell() {
  const [panelContent, setPanelContent] = useState<PanelContent | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const { pause, resume } = usePause();

  // On mount, decide whether the welcome auto-shows. The world starts paused (see
  // PauseContext) so motion is frozen before the user is oriented. If they opted out
  // via "don't show again", skip the welcome and resume the world immediately. Read in
  // an effect (client only) to avoid a hydration mismatch on the localStorage value.
  useEffect(() => {
    const dismissed =
      window.localStorage.getItem(WELCOME_DISMISSED_KEY) === "true";
    setWelcomeDismissed(dismissed);
    if (dismissed) {
      resume();
    } else {
      setWelcomeOpen(true);
    }
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open or swap: a fresh content object pauses the world (idempotent if already
  // paused) and updates the panel in place when one is already open.
  const showElement = (content: PanelContent) => {
    setPanelContent(content);
    pause();
  };
  const close = () => {
    setPanelContent(null);
    resume();
  };
  // Background (empty world / road) clicks close — no-op when nothing is open, so the
  // pause state isn't touched on ordinary world clicks.
  const handleBackground = () => {
    if (panelContent) close();
  };

  // Closing the welcome resumes the world and persists the checkbox choice: opting out
  // writes the flag; leaving it unchecked clears the flag so it shows again next visit.
  const closeWelcome = (dontShowAgain: boolean) => {
    setWelcomeOpen(false);
    resume();
    setWelcomeDismissed(dontShowAgain);
    if (dontShowAgain) {
      window.localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    } else {
      window.localStorage.removeItem(WELCOME_DISMISSED_KEY);
    }
  };

  // Manual reopen, always available. Provisional placement (top-left); this folds into
  // the Layer 1b top bar when that is built. Pauses the world like any panel open.
  const openWelcome = () => {
    setWelcomeOpen(true);
    pause();
  };

  return (
    <>
      <Map onElementClick={showElement} onBackgroundClick={handleBackground} />
      <InfoPanel content={panelContent} onClose={close} />
      <button
        type="button"
        onClick={openWelcome}
        aria-label="About Routes"
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-night-800 bg-night-950/80 font-mono text-base text-ink-400 shadow-lg backdrop-blur-sm transition-colors hover:text-ink-100"
      >
        ?
      </button>
      <WelcomeModal
        open={welcomeOpen}
        onClose={closeWelcome}
        initialDontShowAgain={welcomeDismissed}
      />
    </>
  );
}
