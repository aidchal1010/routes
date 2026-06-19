import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  // Absolute base so the file-convention opengraph-image.png / twitter-image.png (in
  // src/app/) resolve to full https URLs — what LinkedIn/Twitter need to fetch them.
  metadataBase: new URL("https://routes-sepia.vercel.app"),
  title: "Routes",
  description: "A visual guide to how agentic systems are built",
  openGraph: {
    title: "Routes",
    description: "A visual guide to how agentic systems are built",
    url: "/",
    siteName: "Routes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Routes",
    description: "A visual guide to how agentic systems are built",
  },
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
