"use client";

import { GitMerge } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { ScoreGauge } from "@/components/scan/ScoreGauge";
import { useInView } from "@/lib/useInView";

/**
 * Spec v3 §3.8 — Proof, Bone. A labelled anchor: our own site, scored by the
 * same scanner before and after one pull request (landing-page#10). Measured,
 * not made up: re-run /scan on agentronics.dev to check. Replace with
 * customer before/after scores as soon as there are some.
 */
const OWN_SITE = { host: "agentronics.dev", before: 85, after: 100 };

export function Proof() {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <Section>
      <div className="max-w-[720px]">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
          Proof
        </p>
        <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
          We scanned our own site first.
        </h2>
        <p className="mt-4 text-lg text-content-secondary">
          Same scan, same 12 checks. It found 3 gaps: a sitemap, an llms.txt guide for AI tools, and structured data. We
          fixed them in one pull request.
        </p>
      </div>

      <div ref={ref} className="mt-12 rounded-xl border border-border bg-surface p-6 sm:p-10">
        <p className="font-mono text-xs uppercase tracking-caps text-content-muted">
          Agent Readiness Score · {OWN_SITE.host}
        </p>
        <div className="mt-6 grid items-center gap-8 sm:grid-cols-[1fr_auto_1fr]">
          <div className="text-center">
            <ScoreGauge value={OWN_SITE.before} start={inView} sweepMs={900} size={200} label="Before" showBand={false} className="mx-auto" />
            <p className="mt-2 text-sm text-content-secondary">Agent-ready, with gaps</p>
          </div>
          <div className="flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-pill border border-border bg-bone-200 px-3 py-1.5 font-mono text-xs text-content"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateX(-16px)",
                transition: "opacity 600ms var(--ease-out) 900ms, transform 600ms var(--ease-out) 900ms",
              }}
            >
              <GitMerge size={14} className="text-success" />
              PR merged
            </span>
          </div>
          <div className="text-center">
            <ScoreGauge value={OWN_SITE.after} from={OWN_SITE.before} start={inView} sweepMs={900} size={200} label="After" showBand={false} className="mx-auto" />
            <p className="mt-2 text-sm font-semibold text-success">Fully agent-ready</p>
          </div>
        </div>
        <p className="mt-8 text-center font-display text-xl font-semibold text-content">
          +15 points after one pull request <span className="font-sans text-base font-normal text-content-muted">· October 2026</span>
        </p>
        <p className="mt-2 text-center text-sm text-content-muted">Most sites start much lower. Our sample report for example.com scored 39.</p>
      </div>
    </Section>
  );
}
