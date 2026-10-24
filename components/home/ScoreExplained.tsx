"use client";

import { Section } from "@/components/layout/Section";
import { ScanForm } from "@/components/scan/ScanForm";
import { EXAMPLE_REPORT } from "@/lib/scan/example";
import { AGENT_NICK_FIXES, BAND_COLOR, BAND_TEXT, BANDS, CATEGORY_META, scoreBand } from "@/lib/scan/types";
import { useCountUp, useInView } from "@/lib/useInView";
import { cn } from "@/lib/cn";

/**
 * Spec v3 §3.5 — the score, explained. Bone. Anchor the 0–100 scale and a
 * real 39 (example.com) before the visitor sees their own number.
 */
export function ScoreExplained() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const sample = EXAMPLE_REPORT;
  const counter = useCountUp(sample.score, inView, 1000);
  const band = scoreBand(sample.score);
  const broken = sample.checks
    .filter((c) => c.status === "fail" || c.status === "warn")
    .sort((a, b) => b.max - b.points - (a.max - a.points))
    .slice(0, 3);

  return (
    <Section id="score">
      <div className="max-w-[720px]">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
          The score
        </p>
        <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
          Your Agent Readiness Score, explained.
        </h2>
        <p className="mt-4 text-lg text-content-secondary">We run 12 checks that AI agents depend on, and give you one number out of 100.</p>
      </div>

      <ul className="mt-8 flex flex-wrap gap-3">
        {(Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map((k) => (
          <li key={k} className="rounded-pill border border-border bg-bone-200 px-4 py-2 text-sm">
            <span className="font-semibold text-content">{CATEGORY_META[k].label}:</span>{" "}
            <span className="text-content-secondary">{CATEGORY_META[k].question}</span>
          </li>
        ))}
      </ul>

      <div ref={ref} className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        {/* the scale */}
        <div>
          <div className="relative pt-10">
            {/* marker at 39 */}
            <div
              className="absolute top-0 -translate-x-1/2 text-center"
              style={{
                left: `${sample.score}%`,
                opacity: inView ? 1 : 0,
                transform: `translate(-50%, ${inView ? 0 : -12}px)`,
                transition: "opacity var(--dur-slow) var(--ease-out) 600ms, transform var(--dur-slow) var(--ease-out) 600ms",
              }}
            >
              <span className="font-mono text-sm font-medium text-content">{counter}</span>
              <span className="mx-auto mt-1 block h-3 w-0.5 bg-content" />
            </div>
            <div className="flex h-3 overflow-hidden rounded-pill">
              {BANDS.map((b) => (
                <span
                  key={b.tone}
                  className="h-full origin-left"
                  style={{
                    width: `${b.to - b.from + (b.from === 0 ? 0 : 1)}%`,
                    background: BAND_COLOR[b.tone],
                    transform: inView ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 800ms var(--ease-out)",
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-xs text-content-muted">
              <span>0</span>
              <span>40</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>

          <dl className="mt-8 divide-y divide-border border-y border-border">
            {BANDS.map((b) => (
              <div key={b.tone} className="grid grid-cols-[110px_1fr] gap-4 py-4 sm:grid-cols-[150px_1fr]">
                <dt>
                  <span className="flex items-center gap-2 font-semibold" style={{ color: BAND_TEXT[b.tone] }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: BAND_COLOR[b.tone] }} aria-hidden />
                    {b.label}
                  </span>
                  <span className="font-mono text-xs text-content-muted">
                    {b.from}–{b.to}
                  </span>
                </dt>
                <dd className="text-base text-content-secondary">{b.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* a real sample */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-caps text-content-muted">A real report</p>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <span className="font-mono text-base text-content">{sample.host}</span>
            <span className="font-display text-[34px] font-bold leading-none text-content">
              {sample.score}
              <span className="text-base font-medium text-content-muted">/100</span>
            </span>
          </div>
          <p className="mt-1 text-right text-sm font-semibold" style={{ color: BAND_TEXT[band.tone] }}>
            {band.label}
          </p>
          <div className="mt-5 space-y-3">
            {sample.categories.map((c, i) => (
              <div key={c.id} className="grid grid-cols-[48px_1fr_32px] items-center gap-3 text-sm">
                <span className="font-semibold text-content">{c.label}</span>
                <span className="h-1.5 overflow-hidden rounded-pill bg-border">
                  <span
                    className="block h-full rounded-pill"
                    style={{
                      width: inView ? `${c.score}%` : "0%",
                      background: BAND_COLOR[scoreBand(c.score).tone],
                      transition: `width 700ms var(--ease-out) ${i * 120}ms`,
                    }}
                  />
                </span>
                <span className="text-right font-mono text-content-secondary">{c.score}</span>
              </div>
            ))}
          </div>
          <ul className="mt-6 space-y-3 border-t border-border pt-5">
            {broken.map((c, i) => (
              <li
                key={c.id}
                className="reveal is-in"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "none" : "translateY(12px)",
                  transitionDelay: `${700 + i * 80}ms`,
                }}
              >
                <p className="text-sm font-semibold text-content">{c.label}</p>
                <p className={cn("mt-0.5 text-xs", AGENT_NICK_FIXES.has(c.id) ? "text-success" : "text-content-muted")}>
                  {AGENT_NICK_FIXES.has(c.id) ? "Fix: Agent Nick writes this" : "Fix: step-by-step in your report"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-14 max-w-[600px]">
        <ScanForm id="scan-score" source="score" label="Where does your site land?" microcopy={null} />
      </div>
    </Section>
  );
}
