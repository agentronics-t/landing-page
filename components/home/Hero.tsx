"use client";

import { useState } from "react";
import { BackgroundTraces } from "@/components/brand/Traces";
import { ScanForm } from "@/components/scan/ScanForm";
import { ScoreGauge } from "@/components/scan/ScoreGauge";

/**
 * Spec v3 §3.2 — the score hook, PCB Black. In 5 seconds: what we do, that
 * there's a free score out of 100, and that it takes 30 seconds. The gauge
 * shows "?" (an information gap) and pulses once when the input gets focus.
 */
export function Hero() {
  const [focusPulse, setFocusPulse] = useState(0);
  const [focused, setFocused] = useState(false);

  return (
    <section className="tone-dark relative overflow-hidden px-4 pb-20 pt-28 sm:px-[clamp(20px,5vw,48px)] md:pb-28 md:pt-36">
      <BackgroundTraces lit={focused} />
      <div className="relative mx-auto grid max-w-content items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="order-first mx-auto lg:order-last lg:col-span-5">
          <ScoreGauge value={null} pulseKey={focusPulse} size={260} className="hidden lg:flex" />
          <ScoreGauge value={null} pulseKey={focusPulse} size={160} className="lg:hidden" />
        </div>

        <div className="lg:col-span-7">
          <p className="font-mono text-xs uppercase tracking-caps text-verdigris">Free Agent Readiness Score</p>
          <h1 className="mt-4 font-display text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] md:text-6xl">
            Make your website ready for AI agents.
          </h1>
          <p className="mt-6 max-w-[60ch] text-[19px] leading-relaxed text-[color-mix(in_srgb,var(--bone)_80%,transparent)] md:text-[20px]">
            ChatGPT, Claude and Gemini now find, compare and buy for your customers. If they can&apos;t read your site, they
            choose someone else. Agentronics fixes that.
          </p>
          <ScanForm
            id="scan"
            source="hero"
            className="mt-9 max-w-[600px]"
            onFocus={() => {
              setFocused(true);
              setFocusPulse((n) => n + 1);
            }}
          />
          <p className="mt-6 max-w-[60ch] text-sm text-content-secondary">
            Checks 12 things agents need: Can they <span className="text-content">find</span> you?{" "}
            <span className="text-content">Read</span> you? <span className="text-content">Act</span> on your site?
          </p>
        </div>
      </div>
    </section>
  );
}
