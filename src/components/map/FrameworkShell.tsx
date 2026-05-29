"use client";

import { useState } from "react";
import { usePause } from "./PauseContext";
import InfoPanel, { type PanelContent } from "./InfoPanel";
import Map from "./Map";

export default function FrameworkShell() {
  const [panelContent, setPanelContent] = useState<PanelContent | null>(null);
  const { pause, resume } = usePause();

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

  return (
    <>
      <Map onElementClick={showElement} onBackgroundClick={handleBackground} />
      <InfoPanel content={panelContent} onClose={close} />
    </>
  );
}
