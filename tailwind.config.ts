import type { Config } from "tailwindcss";

/**
 * Agentronics design tokens (BUILD_SPEC §4.2).
 * Colors resolve to CSS vars defined in app/globals.css (:root + .dark),
 * so every utility is theme-aware. Never hardcode hex in components.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        content: "var(--content)",
        "content-secondary": "var(--content-secondary)",
        "content-muted": "var(--content-muted)",
        brand: "var(--brand)",
        "brand-solid": "var(--brand-solid)",
        "brand-soft": "var(--brand-soft)",
        accent: "var(--accent)",
        "accent-content": "var(--accent-content)",
        ring: "var(--ring)",
        success: "var(--success)",
        "success-bg": "var(--success-bg)",
        warning: "var(--warning)",
        "warning-bg": "var(--warning-bg)",
        danger: "var(--danger)",
        "danger-bg": "var(--danger-bg)",
        info: "var(--info)",
        "info-bg": "var(--info-bg)",
        "code-bg": "var(--code-bg)",
        "code-fg": "var(--code-fg)",
        // raw near-black for the dark "infrastructure" bands
        "neutral-950": "#06070e",
        "neutral-900": "#0e1017",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        xs: ["11px", "1.4"],
        sm: ["12px", "1.4"],
        base: ["14px", "1.5"],
        md: ["15px", "1.4"],
        lg: ["18px", "1.3"],
        xl: ["22px", "1.3"],
        "2xl": ["28px", "1.2"],
        "3xl": ["40px", "1.1"],
        "4xl": ["56px", "1.05"],
        "5xl": ["72px", "1.02"],
      },
      letterSpacing: {
        display: "-0.02em",
        title: "-0.01em",
        caps: "0.08em",
      },
      borderRadius: {
        sm: "7px",
        md: "9px",
        lg: "12px",
        xl: "14px",
        pill: "999px",
      },
      boxShadow: {
        card: "none",
        raise: "0 8px 24px -12px rgba(14,16,23,.18)",
        glow: "0 8px 24px -10px var(--brand)",
      },
      maxWidth: {
        content: "1080px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2,0,0,1)",
      },
    },
  },
  plugins: [],
};

export default config;
