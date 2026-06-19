"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Persistent top bar shared by the world view and the Build Guide. It reserves vertical
// space (the world fills the area below it; the guide scrolls below it) rather than
// overlaying content. It is pure chrome: it never calls usePause(), so it renders on the
// guide route, which has no PauseProvider. World-only controls (the "?" button) are passed
// in as children from FrameworkShell, which lives under PauseProvider.

const TABS = [
  { href: "/framework", label: "World" },
  { href: "/framework/build-guide", label: "Build Guide" },
  { href: "/framework/sandbox", label: "Sandbox" },
] as const;

type Props = { children?: React.ReactNode };

export default function TopBar({ children }: Props) {
  const pathname = usePathname();
  // Tap-toggle for the teaser tooltip — on touch there's no hover, so a tap reveals it.
  const [teaserOpen, setTeaserOpen] = useState(false);

  return (
    <header className="relative z-40 flex h-12 shrink-0 items-center justify-between border-b border-night-800 bg-night-950 px-4">
      <nav className="flex min-w-0 items-center gap-1">
        {/* Real route tabs. They scroll horizontally on narrow screens so the teaser stays
            pinned and visible after them (and the teaser's tooltip isn't clipped — a scroll
            container would clip a dropdown). */}
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-[13px] transition-colors ${
                  active
                    ? "bg-night-900 text-ink-100"
                    : "text-ink-400 hover:text-ink-100"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Coming-soon teaser for the advisor feature. NOT a route: no Link/href, aria-disabled,
            a click only toggles the tooltip. The always-visible "Soon" pill carries the tease on
            touch; the tooltip adds detail on hover / keyboard focus / tap. */}
        <span className="group relative shrink-0">
          <button
            type="button"
            aria-disabled="true"
            onClick={() => setTeaserOpen((o) => !o)}
            className="flex cursor-default items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-[13px] text-ink-400"
          >
            Draft your Agent
            <span className="rounded bg-orchestrator/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-orchestrator">
              Soon
            </span>
          </button>
          <span
            role="tooltip"
            className={`pointer-events-none absolute right-0 top-full z-50 mt-1 w-max max-w-[92vw] rounded border border-night-800 bg-night-900 px-2 py-1 text-[11px] text-ink-100 shadow transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:left-0 sm:right-auto sm:max-w-none ${
              teaserOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            Coming soon. Describe your idea and get an architecture.
          </span>
        </span>
      </nav>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </header>
  );
}
