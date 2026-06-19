import { ImageResponse } from "next/og";
import { palette } from "@/lib/palette";

// Favicon, generated as a 32x32 PNG: a tiny brand mark — the purple orchestrator at the
// center with four manager dots (N/E/S/W) in the world's colors. Pure geometric divs (no
// text, so no font is needed; no SVG). App Router auto-injects <link rel="icon"> from this
// file, so layout.tsx needs no change.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const dot = (color: string) => ({
    position: "absolute" as const,
    width: 6,
    height: 6,
    borderRadius: 2,
    background: color,
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        {/* Orchestrator center */}
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 4,
            backgroundImage: `linear-gradient(135deg, ${palette.orchestrator}, ${palette.orchestratorDeep})`,
          }}
        />

        {/* Four manager dots, each centered on its axis via translate */}
        <div
          style={{
            ...dot(palette.managerABase),
            top: 1,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            ...dot(palette.managerBBase),
            right: 1,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <div
          style={{
            ...dot(palette.managerCBase),
            bottom: 1,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          style={{
            ...dot(palette.managerDBase),
            left: 1,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
