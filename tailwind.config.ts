import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: {
          800: "#3A3E45",
          900: "#2A2D33",
          950: "#161B22",
        },
        ink: {
          100: "#F2F3F5",
          400: "#9BA1AB",
        },
        terminal: "#E8E4DA",
        grid: "#4A5566",
        orchestrator: "#9325F0",
        orchestratorBase: "#5B14A8",
        orchestratorDeep: "#3A0A6C",
        orchestratorLight: "#A742F0",
        manager: "#E0844A",
        worker: "#4DA9CE",
        tool: "#9DC141",
        signal: "#BD3052",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
