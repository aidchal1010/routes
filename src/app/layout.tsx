import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Routes",
  description: "A visual guide to how agentic systems are built",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable}`}>
      <body className="min-h-screen bg-night-950 font-sans text-ink-100 antialiased">
        {children}
      </body>
    </html>
  );
}
