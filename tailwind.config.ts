import type { Config } from "tailwindcss";

/**
 * Agentronics "Circuit Copper" tokens. Colors resolve to CSS vars in
 * app/globals.css; `.tone-dark` remaps them for PCB Black sections, so every
 * utility works on both. Never hardcode hex in components.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
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
        "brand-soft": "var(--brand-soft)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-content": "var(--accent-content)",
        ring: "var(--ring)",
        success: "var(--success)",
        "success-bg": "var(--success-bg)",
        warning: "var(--warning)",
        "warning-bg": "var(--warning-bg)",
        danger: "var(--danger)",
        "danger-bg": "var(--danger-bg)",
        "code-bg": "var(--code-bg)",
        "code-fg": "var(--code-fg)",
        pcb: "var(--pcb-black)",
        bone: "var(--bone)",
        copper: "var(--copper)",
        verdigris: "var(--verdigris)",
        "verdigris-deep": "var(--verdigris-deep)",
        fog: "var(--fog)",
        seam: "var(--seam)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      // Guide type scale: hero 56–64, sections 36–40, body 17–18, subtext 14–15, code 14.
      fontSize: {
        xs: ["12px", "1.5"],
        sm: ["14px", "1.5"],
        base: ["15px", "1.55"],
        md: ["17px", "1.6"],
        lg: ["18px", "1.6"],
        xl: ["22px", "1.35"],
        "2xl": ["28px", "1.25"],
        "3xl": ["38px", "1.2"],
        "4xl": ["56px", "1.1"],
        "5xl": ["64px", "1.1"],
      },
      letterSpacing: {
        display: "-0.025em",
        title: "-0.015em",
        caps: "0.1em",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "999px",
      },
      boxShadow: {
        raise: "var(--shadow-raise)",
      },
      maxWidth: {
        content: "1120px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2,0,0,1)",
      },
    },
  },
  plugins: [],
};

export default config;
