import { ImageResponse } from "next/og";

export const alt = "Agentronics — Make your website ready for AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// PCB Black card: copper traces into the mark, headline in Bone, "AI agents" in Verdigris.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0D1A16", padding: 72, position: "relative" }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          <path d="M760 120 H940 L1000 180 H1200" stroke="#E8763A" strokeWidth="3" fill="none" />
          <path d="M760 300 H1060 L1110 250 H1200" stroke="#E8763A" strokeWidth="3" fill="none" />
          <path d="M760 480 H900 L960 540 H1200" stroke="#E8763A" strokeWidth="3" fill="none" />
          <circle cx="1000" cy="180" r="8" fill="#2BB39A" />
          <circle cx="1110" cy="250" r="8" fill="#2BB39A" />
          <circle cx="960" cy="540" r="8" fill="#2BB39A" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="63" height="60" viewBox="0 0 835 800">
            <path fill="#E8763A" d="M458 0L835 660L317 660L368 570L664 570L458 209L119 800L0 800Z" />
          </svg>
          <span style={{ color: "#F5F1E8", fontSize: 40, fontWeight: 700 }}>agentronics</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div style={{ display: "flex", flexWrap: "wrap", color: "#F5F1E8", fontSize: 68, fontWeight: 700, lineHeight: 1.08 }}>
            Make your website ready for&nbsp;<span style={{ color: "#2BB39A" }}>AI agents.</span>
          </div>
          <div style={{ color: "#8E9B95", fontSize: 28, marginTop: 24 }}>Free check · no signup · 30 seconds</div>
        </div>
      </div>
    ),
    size,
  );
}
