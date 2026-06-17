"use client";

import { useEffect, useState } from "react";
import { usePause } from "./PauseContext";
import InfoPanel, { type PanelContent } from "./InfoPanel";
import Map from "./Map";
import WelcomeModal from "./WelcomeModal";
import Legend from "../ui/Legend";
import TopBar from "../ui/TopBar";

// localStorage flag: set when the visitor checks "don't show again" — suppresses the
// welcome across sessions. sessionStorage flag: set whenever the welcome closes — so the
// welcome auto-shows only once per browser session, not on every mount. Without it,
// navigating World -> Build Guide -> World would re-trigger the welcome each time.
const WELCOME_DISMISSED_KEY = "routes-welcome-dismissed";
const WELCOME_SEEN_SESSION_KEY = "routes-welcome-seen-session";

export default function FrameworkShell() {
  const [panelContent, setPanelContent] = useState<PanelContent | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const { pause, resume } = usePause();

  // On mount, decide whether the welcome auto-shows. The world starts paused (see
  // PauseContext) so motion is frozen before the user is oriented. Skip it if the visitor
  // opted out ("don't show again") OR has already seen it this session, and resume at
  // once. Read in an effect (client only) to avoid a hydration mismatch.
  useEffect(() => {
    const dismissed =
      window.localStorage.getItem(WELCOME_DISMISSED_KEY) === "true";
    const seenThisSession =
      window.sessionStorage.getItem(WELCOME_SEEN_SESSION_KEY) === "true";
    setWelcomeDismissed(dismissed);
    if (dismissed || seenThisSession) {
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

  // Closing the welcome resumes the world, marks it seen for this session, and persists
  // the checkbox choice: opting out writes the flag; leaving it unchecked clears it.
  const closeWelcome = (dontShowAgain: boolean) => {
    setWelcomeOpen(false);
    resume();
    setWelcomeDismissed(dontShowAgain);
    window.sessionStorage.setItem(WELCOME_SEEN_SESSION_KEY, "true");
    if (dontShowAgain) {
      window.localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    } else {
      window.localStorage.removeItem(WELCOME_DISMISSED_KEY);
    }
  };

  // Manual reopen from the top bar. Pauses the world like any panel open.
  const openWelcome = () => {
    setWelcomeOpen(true);
    pause();
  };

  return (
    // Flex column: the top bar reserves space and the world fills the area below it, so
    // the bar never covers world content (e.g. the north Research manager + its label).
    <div className="flex h-full flex-col">
      <TopBar>
        <button
          type="button"
          onClick={openWelcome}
          aria-label="About Routes"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-night-800 font-mono text-base text-ink-400 transition-colors hover:text-ink-100"
        >
          ?
        </button>
      </TopBar>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <Map onElementClick={showElement} onBackgroundClick={handleBackground} />
      </div>

      <Legend onElementClick={showElement} />
      <InfoPanel content={panelContent} onClose={close} />
      <WelcomeModal
        open={welcomeOpen}
        onClose={closeWelcome}
        initialDontShowAgain={welcomeDismissed}
      />
    </div>
  );
}
