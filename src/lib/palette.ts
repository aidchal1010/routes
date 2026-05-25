export const palette = {
  night950: "#1B1D22",
  night900: "#2A2D33",
  night800: "#3A3E45",
  ink100: "#F2F3F5",
  ink400: "#9BA1AB",
  terminal: "#E8E4DA",
  orchestrator: "#9325F0",
  manager: "#E0844A",
  worker: "#4DA9CE",
  tool: "#9DC141",
  signal: "#BD3052",
} as const;

export type PaletteKey = keyof typeof palette;
