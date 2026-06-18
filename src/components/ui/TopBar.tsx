"use client";

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

  return (
    <header className="relative z-40 flex h-12 shrink-0 items-center justify-between border-b border-night-800 bg-night-950 px-4">
      <nav className="flex items-center gap-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-md px-3 py-1.5 font-mono text-[13px] transition-colors ${
                active
                  ? "bg-night-900 text-ink-100"
                  : "text-ink-400 hover:text-ink-100"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  );
}
