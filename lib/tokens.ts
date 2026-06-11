/**
 * TS-side token constants. Components style with Tailwind/CSS-var utilities;
 * this is only for places that need raw values in JS (Three.js, canvas, SVG fills
 * that can't read CSS vars at construction time).
 */
export const COLORS = {
  brand: "#736ced",
  brandSolid: "#5a4fd9",
  accent: "#ff9e1c",
  accentDark: "#ffae33",
  neutral300: "#bcc2ce",
  neutral400: "#939bac",
  neutral500: "#6c7588",
  neutral950: "#06070e",
  info: "#2081c3",
  success: "#18935a",
} as const;
