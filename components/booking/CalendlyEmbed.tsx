"use client";

import Script from "next/script";

/** Real Calendly inline widget — "Know more about Agentronics". */
export function CalendlyEmbed() {
  return (
    <>
      <div
        className="calendly-inline-widget overflow-hidden rounded-xl border border-border"
        data-url="https://calendly.com/agentronics/know-more-about-agentronics?hide_event_type_details=1&hide_gdpr_banner=1"
        style={{ minWidth: 320, height: 700 }}
      />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
    </>
  );
}
