import { ImageResponse } from "next/og";

export const alt = "Agentronics: Can AI agents buy from you? Get your Agent Readiness Score.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Ink card in the design system: the logo, the hero question with its lime
// highlight, and the score input's promise in the machine voice.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B0B0C", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="#FF4D1F" />
            <path transform="translate(8 8.33) scale(.019162)" fill="#D4FF3A" d="M458 0L835 660L317 660L368 570L664 570L458 209L119 800L0 800Z" />
          </svg>
          <span style={{ color: "#FFFFFF", fontSize: 42, fontWeight: 700, letterSpacing: -1.5 }}>agentronics</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", color: "#FFFFFF", fontSize: 92, fontWeight: 700, lineHeight: 1.05, letterSpacing: -4 }}>
            <span>Can AI agents&nbsp;</span>
            <span style={{ background: "#D4FF3A", color: "#0B0B0C", borderRadius: 14, padding: "0 14px" }}>buy from</span>
            <span>&nbsp;you?</span>
          </div>
          <div style={{ display: "flex", color: "rgba(255,255,255,.65)", fontSize: 28, marginTop: 30, letterSpacing: 2 }}>
            AGENT READINESS SCORE · FREE · NO SIGNUP · 30 SECONDS
          </div>
        </div>
      </div>
    ),
    size,
  );
}
