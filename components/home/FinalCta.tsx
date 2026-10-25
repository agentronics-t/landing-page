"use client";

import { useState } from "react";
import { BackgroundTraces } from "@/components/brand/Traces";
import { ScanForm } from "@/components/scan/ScanForm";
import { ScoreGauge } from "@/components/scan/ScoreGauge";

/**
 * Spec v3 §3.13 — Final CTA, PCB Black. The "?" returns, larger; traces
 * converge into the input. Truthful stakes, one action.
 */
export function FinalCta() {
  const [pulse, setPulse] = useState(0);
  const [lit, setLit] = useState(false);
  return (
    <section className="tone-dark relative overflow-hidden px-4 py-24 sm:px-[clamp(20px,5vw,48px)] md:py-32">
      <BackgroundTraces converge lit={lit} />
      <div className="relative mx-auto max-w-[760px] text-center">
        <ScoreGauge value={null} pulseKey={pulse} size={240} className="mx-auto" />
        <h2 className="mt-6 font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
          What&apos;s your Agent Readiness Score?
        </h2>
        <p className="mx-auto mt-5 max-w-[60ch] text-lg text-content-secondary">
          A low score means AI agents can&apos;t read your prices or finish a sign-up, so they send your customers to a
          competitor whose site works. As more buying runs through agents, that&apos;s a growing share of sales you never see.
          Find out where you stand in 30 seconds.
        </p>
        <ScanForm
          id="scan-bottom"
          source="final"
          className="mx-auto mt-10 max-w-[600px] text-left"
          microcopy="Score out of 100 · Free · No signup · If it's low, Agent Nick writes the agent tools, sitemap, llms.txt and structured data for you."
          onFocus={() => {
            setLit(true);
            setPulse((n) => n + 1);
          }}
        />
      </div>
    </section>
  );
}
