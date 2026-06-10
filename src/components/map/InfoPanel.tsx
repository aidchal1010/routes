"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { highlightCode } from "./highlightCode";

// Content shape for a single element's popup. Mirrors the locked two-tier structure
// (TODO.md "Popup content structure"). Exported so the shell and the future content
// module share one type.
export type PanelContent = {
  elementName: string; // e.g. "MANAGER C"
  accentColor: string; // the element's color — header swatch + active-tab underline
  overview: {
    whatItIs: string;
    whatItDoes: string;
    connector: string; // italic line rendered after whatItDoes, inside "What it does"
    example?: string; // optional — managers omit it (their example lives in specificDomain)
  };
  // Manager-only: the per-domain block that swaps based on which manager was clicked.
  // Renders as a dedicated "Domain Specific" tab. Absent for all other elements.
  specificDomain?: {
    domainName: string; // short label shown in the tab, e.g. "Research", "Comm-Action"
    domain: string;
    tools: string;
    whenToRoute: string;
    example: string;
  };
  advanced: {
    howItWorks: string;
    code?: string; // optional — vehicles have no code; section skipped when absent
    whereToStart?: string; // optional — vehicles have no build step; skipped when absent
    commonTraps: string; // flowing prose; paragraphs split on blank lines
    whenToUse: string;
    ourModel: string;
    references: { label: string; url: string }[];
  };
};

type Props = {
  content: PanelContent | null; // null = closed
  onClose: () => void;
};

type Tab = "overview" | "domain" | "advanced";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 text-xs uppercase tracking-widest text-ink-400">
      {children}
    </h3>
  );
}

// A labeled sub-part inside the manager-only "Domain Specific" tab. Smaller, dimmer
// label than SectionLabel so it reads as a sub-row, not a peer section heading.
function SubRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-widest text-ink-400">
        {label}
      </span>
      <p className="mt-0.5">{children}</p>
    </div>
  );
}

export default function InfoPanel({ content, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  // Reset to Overview every time the panel opens. `content` is a fresh object per
  // open, so this fires on each open (locked: next click starts on Overview).
  useEffect(() => {
    if (content) setTab("overview");
  }, [content]);

  // ESC closes — listener only active while open.
  useEffect(() => {
    if (!content) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [content, onClose]);

  // Tab set is derived from what content exists: Overview + Advanced always, and the
  // manager-only Domain Specific tab spliced between them when specificDomain is present.
  const tabs: { key: Tab; label: string }[] = content
    ? [
        { key: "overview", label: "Overview" },
        ...(content.specificDomain
          ? [
              {
                key: "domain" as const,
                label: `Domain Specific (${content.specificDomain.domainName})`,
              },
            ]
          : []),
        { key: "advanced", label: "Advanced" },
      ]
    : [];

  // Guard the active tab against an out-of-range key. When content swaps from a 3-tab
  // manager (tab="domain") to a 2-tab element, the reset effect runs *after* this render,
  // so `tab` may still be "domain" while it's no longer available — fall back to Overview
  // for this render so the body never reads a missing block.
  const activeKey: Tab = tabs.some((t) => t.key === tab) ? tab : "overview";

  return (
    <AnimatePresence>
      {content && (
        // Close-on-outside-click is handled by the world (SVG root onClick in Map);
        // building clicks stopPropagation to swap instead of close. The panel is fixed
        // chrome, so the world stays fully visible and remains clickable behind it.
        <motion.aside
          key="info-panel"
          initial={{ x: 480, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 480, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed right-0 top-0 z-50 flex h-screen w-[480px] flex-col border-l border-night-800 bg-night-950 shadow-2xl"
        >
            {/* Header: color swatch + element name + close button */}
            <div className="flex items-center gap-3 px-5 pt-5">
              <span
                className="h-6 w-6 shrink-0 rounded-md"
                style={{ backgroundColor: content.accentColor }}
              />
              <span className="flex-1 font-mono text-base tracking-wide text-ink-100">
                {content.elementName}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="text-xl leading-none text-ink-400 transition-colors hover:text-ink-100"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-5 border-b border-night-800 px-5">
              {tabs.map(({ key, label }) => {
                const active = activeKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`-mb-px whitespace-nowrap border-b-2 pb-2 text-sm transition-colors ${
                      active ? "text-ink-100" : "border-transparent text-ink-400 hover:text-ink-100"
                    }`}
                    style={active ? { borderColor: content.accentColor } : undefined}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-[13px] leading-relaxed text-terminal">
              {activeKey === "overview" && (
                <>
                  <section>
                    <SectionLabel>What it is</SectionLabel>
                    <p>{content.overview.whatItIs}</p>
                  </section>
                  <section>
                    <SectionLabel>What it does</SectionLabel>
                    <p>{content.overview.whatItDoes}</p>
                    <p className="mt-2 italic text-ink-400">
                      {content.overview.connector}
                    </p>
                  </section>
                  {content.overview.example && (
                    <section>
                      <SectionLabel>Example</SectionLabel>
                      <p>{content.overview.example}</p>
                    </section>
                  )}
                </>
              )}
              {activeKey === "domain" && content.specificDomain && (
                // Sub-rows sit directly in the tab — the active tab carries the accent
                // tint, so no bordered box is needed here.
                <div className="space-y-4">
                  <SubRow label="Domain">{content.specificDomain.domain}</SubRow>
                  <SubRow label="Its tools">{content.specificDomain.tools}</SubRow>
                  <SubRow label="When to route here">
                    {content.specificDomain.whenToRoute}
                  </SubRow>
                  <SubRow label="Example">{content.specificDomain.example}</SubRow>
                </div>
              )}
              {activeKey === "advanced" && (
                <>
                  <section>
                    <SectionLabel>How it actually works</SectionLabel>
                    <p>{content.advanced.howItWorks}</p>
                  </section>
                  {content.advanced.code && (
                    <section>
                      <SectionLabel>Code</SectionLabel>
                      <pre className="overflow-x-auto rounded-md border border-night-800 bg-night-900 p-3 font-mono text-[11px] leading-relaxed text-ink-100">
                        <code>{highlightCode(content.advanced.code)}</code>
                      </pre>
                    </section>
                  )}
                  {content.advanced.whereToStart && (
                    <section>
                      <SectionLabel>Where to start</SectionLabel>
                      <p>{content.advanced.whereToStart}</p>
                    </section>
                  )}
                  <section>
                    <SectionLabel>Common traps to watch for</SectionLabel>
                    {content.advanced.commonTraps
                      .split(/\n\s*\n/)
                      .map((para) => para.trim())
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i} className={i > 0 ? "mt-2" : undefined}>
                          {para}
                        </p>
                      ))}
                  </section>
                  <section>
                    <SectionLabel>When to use it</SectionLabel>
                    <p>{content.advanced.whenToUse}</p>
                  </section>
                  <section>
                    <SectionLabel>Our model</SectionLabel>
                    <p>{content.advanced.ourModel}</p>
                  </section>
                  {content.advanced.references.length > 0 && (
                    <section>
                      <SectionLabel>References</SectionLabel>
                      <ul className="space-y-1">
                        {content.advanced.references.map((ref, i) => (
                          <li key={i}>
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                              style={{ color: content.accentColor }}
                            >
                              {ref.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </div>
          </motion.aside>
      )}
    </AnimatePresence>
  );
}
