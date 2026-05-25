"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function IntroScreen() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-night-950 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        <h1 className="bg-gradient-to-r from-orchestrator via-signal to-worker bg-clip-text text-7xl font-semibold tracking-tight text-transparent sm:text-8xl">
          Routes
        </h1>

        <p className="max-w-xl text-lg text-ink-400 sm:text-xl">
          A visual guide to how agentic systems are built
        </p>

        <Link
          href="/framework"
          className="mt-4 inline-flex items-center rounded-full bg-orchestrator px-8 py-3 text-base font-medium text-ink-100 shadow-lg shadow-orchestrator/20 transition-colors duration-200 hover:bg-signal"
        >
          Let&apos;s explore how workflows are built
        </Link>
      </motion.div>
    </main>
  );
}
