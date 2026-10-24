"use client";

import { GitMerge, GitPullRequest } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { useInView } from "@/lib/useInView";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    title: "Get your score.",
    body: "Paste your URL. In 30 seconds you see what agents can and can't do on your site.",
    scene: "gauge",
  },
  {
    title: "Agent Nick writes the fixes.",
    body: "Our AI agent writes the code that lets agents act on your site and sends it as a pull request: a proposed change you review on GitHub.",
    scene: "pr",
  },
  {
    title: "You approve. Agents can buy.",
    body: "Merge it, and agents can read your prices, recommend you and finish tasks.",
    scene: "merged",
  },
] as const;

/**
 * Spec v3 §3.6 — How it works, PCB Black. One copper trace runs node 1 → 3;
 * each node "solders" (verdigris fill + one glow ring) as the trace reaches
 * it, and its text goes 40% → 100%. Triggered on entering view (the spec's
 * CSS fallback for scrub); reduced motion shows the final state.
 */
export function HowItWorks() {
  const [ref, inView] = useInView<HTMLOListElement>({ amount: 0.4 });
  const DRAW = 1400; // ms for the whole trace
  const reachedAt = (i: number) => (i / (STEPS.length - 1)) * DRAW;

  return (
    <Section id="how-it-works" tone="dark" className="scroll-mt-16">
      <div className="max-w-[720px]">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
          How it works
        </p>
        <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
          Three steps. Your site looks exactly the same.
        </h2>
      </div>

      <ol ref={ref} className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
        {/* the trace: vertical on mobile, horizontal on desktop */}
        <span className="absolute bottom-6 left-[23px] top-6 w-px bg-border md:left-6 md:right-[calc(33%-24px)] md:top-[23px] md:h-px md:w-auto" aria-hidden />
        <span
          className="absolute bottom-6 left-[23px] top-6 w-px origin-top bg-copper md:left-6 md:right-[calc(33%-24px)] md:top-[23px] md:h-px md:w-auto md:origin-left"
          style={{
            transform: inView ? "scale(1)" : "scaleY(0) scaleX(0)",
            transition: `transform ${DRAW}ms linear`,
          }}
          aria-hidden
        />
        {STEPS.map((s, i) => {
          const delay = `${reachedAt(i)}ms`;
          return (
            <li key={s.title} className="relative pl-20 md:pl-0 md:pt-20">
              <span
                className={cn(
                  "absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-full border-2 font-mono text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-[var(--dur-slow)]",
                  inView ? "border-verdigris bg-verdigris text-pcb" : "border-border bg-canvas text-content",
                )}
                style={{
                  transitionDelay: delay,
                  boxShadow: inView ? "0 0 0 6px color-mix(in srgb, var(--verdigris) 22%, transparent)" : "none",
                }}
              >
                {i + 1}
              </span>
              <div style={{ opacity: inView ? 1 : 0.4, transition: `opacity var(--dur-slow) var(--ease-out) ${delay}` }}>
                <h3 className="font-display text-[24px] font-semibold leading-tight text-content md:text-[28px]">{s.title}</h3>
                <p className="mt-3 max-w-[34ch] text-md text-content-secondary">{s.body}</p>
                <Scene kind={s.scene} on={inView} delay={reachedAt(i) + 200} />
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-12 inline-flex items-center gap-2 rounded-pill border border-border px-4 py-2 text-sm text-content">
        <span className="h-2 w-2 rounded-full bg-verdigris" aria-hidden />
        Nothing changes on your site until you click Merge.
      </p>
    </Section>
  );
}

function Scene({ kind, on, delay }: { kind: (typeof STEPS)[number]["scene"]; on: boolean; delay: number }) {
  const style = { opacity: on ? 1 : 0, transform: on ? "none" : "translateY(8px)", transition: `opacity var(--dur-slow) var(--ease-out) ${delay}ms, transform var(--dur-slow) var(--ease-out) ${delay}ms` };
  if (kind === "gauge")
    return (
      <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2" style={style} aria-hidden>
        <svg viewBox="0 0 40 40" className="h-8 w-8">
          <circle cx="20" cy="20" r="15" fill="none" stroke="var(--border-strong)" strokeWidth="3" transform="rotate(135 20 20)" strokeDasharray="70.7 94.2" strokeLinecap="round" />
          <circle cx="20" cy="20" r="15" fill="none" stroke="var(--amber)" strokeWidth="3" transform="rotate(135 20 20)" strokeDasharray="38 94.2" strokeLinecap="round" />
        </svg>
        <span className="font-mono text-sm text-content">54/100</span>
      </div>
    );
  if (kind === "pr")
    return (
      <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm" style={style} aria-hidden>
        <GitPullRequest size={16} className="text-verdigris" />
        <span className="text-content">+4 files</span>
        <span className="text-content-muted">· Agent Nick</span>
      </div>
    );
  return (
    <div className="mt-5 inline-flex items-center gap-2 rounded-pill bg-verdigris px-3 py-1.5 text-sm font-semibold text-pcb" style={style} aria-hidden>
      <GitMerge size={15} />
      Merged
    </div>
  );
}
