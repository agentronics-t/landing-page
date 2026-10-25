import type { Config } from "tailwindcss";

/**
 * Pages are styled with the design system's own classes
 * (public/home-assets/styles.css). Tailwind is only for the small bits outside
 * it (sign-in, the WebMCP badge); its colours resolve to the same tokens.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        lime: "var(--lime)",
        amber: "var(--amber)",
        red: "var(--red)",
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        content: "var(--content)",
        "content-secondary": "var(--content-secondary)",
        "content-muted": "var(--content-muted)",
      },
      fontFamily: {
        sans: ["var(--f-sans)"],
        display: ["var(--f-display)"],
        mono: ["var(--f-mono)"],
      },
      boxShadow: {
        hard: "4px 4px 0 var(--ink)",
      },
    },
  },
  plugins: [],
};

export default config;
