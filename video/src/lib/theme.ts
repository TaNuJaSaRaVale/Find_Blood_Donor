import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily } = loadFont("normal", { weights: ["400", "500", "700", "800"], subsets: ["latin"] });
export const { fontFamily: monoFamily } = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });

export const C = {
  bg: "#12070a",
  bg2: "#1f0c12",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.12)",
  red: "#e11d48",
  redDeep: "#9f1239",
  redSoft: "#fecdd3",
  amber: "#f59e0b",
  green: "#10b981",
  violet: "#8b5cf6",
  blue: "#38bdf8",
  text: "#fff1f2",
  muted: "#fda4af",
  dim: "rgba(255,241,242,0.65)",
};
