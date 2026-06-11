"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { Logomark } from "@/components/ui/Logo";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";
import { useCountUp } from "@/lib/useCountUp";

/** Part A — Current state vs WebMCP solution. Exported for /sdk reuse. */
export function CurrentVsFuture() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className="grid grid-cols-1 gap-12 md:grid-cols-2"
    >
      {/* Current state */}
      <motion.div variants={fadeUp}>
        <Eyebrow>Current state</Eyebrow>
        <h3 className="mt-3 text-2xl font-bold tracking-title text-content md:text-3xl">
          You&rsquo;re losing agent traffic
        </h3>
        <p className="mt-4 text-pretty text-base text-content-secondary">
          Agents are everywhere and growing. When they hit fragile, scraped HTML, they fail, retry, or
          leave — and you lose users, revenue, and signal. Your site isn&rsquo;t agent-friendly yet.
        </p>
        <div className="mt-6 grid aspect-[16/7] place-items-center overflow-hidden rounded-xl border border-border bg-surface-raised">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-lg" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
              <AlertTriangle size={22} />
            </span>
            <span className="font-mono text-xs uppercase tracking-caps" style={{ color: "var(--warning)" }}>
              Integration failure
            </span>
          </div>
        </div>
        <p className="mt-3 font-mono text-xs uppercase tracking-caps text-content-muted">
          Fragile scraping · broken cursors · lost sessions
        </p>
      </motion.div>

      {/* Future state */}
      <motion.div variants={fadeUp} className="md:border-l md:border-border md:pl-12">
        <Eyebrow>Future state</Eyebrow>
        <h3 className="mt-3 text-2xl font-bold tracking-title text-content md:text-3xl">
          The WebMCP solution
        </h3>
        <p className="mt-4 text-pretty text-base text-content-secondary">
          WebMCP gives agents a structured, semantic protocol — direct, reliable data access instead of
          fragile scraping. Automation becomes faster, structured, and inherently reliable.
        </p>
        <div className="mt-6 grid aspect-[16/7] place-items-center overflow-hidden rounded-xl bg-neutral-950">
          <Logomark size={64} onDark />
        </div>
        <p className="mt-3 font-mono text-xs uppercase tracking-caps text-content-muted">
          Structured protocol · verified agents · governed access
        </p>
      </motion.div>
    </motion.div>
  );
}

/** Part B — thesis band. Exported for /sdk reuse. */
export function ThesisBand() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      className="mx-auto max-w-3xl text-center"
    >
      <h2 className="text-3xl font-bold tracking-display text-content md:text-4xl">
        Automation is here.
        <br />
        Adapt or become irrelevant.
      </h2>
      <p className="mx-auto mt-5 max-w-[720px] text-pretty text-lg text-content-secondary">
        Agents will access your data regardless of your infrastructure. WebMCP standardizes the
        interface — simplifying agent integration, lowering compute costs for AI developers, and
        creating new revenue streams for your platform.
      </p>
    </motion.div>
  );
}

/** Part C — Cloudflare-style proof strip on a dark band. */
function StatStrip() {
  const reduce = useReducedMotion();
  const [botRef, bot] = useCountUp({ to: 30.5, decimals: 1, suffix: "%" });
  const [usRef, us] = useCountUp({ to: 41.1, decimals: 1, suffix: "%" });

  return (
    <div className="bg-neutral-950 px-[clamp(20px,5vw,48px)] py-16 text-white md:py-20">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-10 md:grid-cols-[1.1fr_1fr]">
        {/* mini rising line chart */}
        <div>
          <p className="font-mono text-xs uppercase tracking-caps text-accent">Bot traffic · 12 mo</p>
          <svg viewBox="0 0 320 120" className="mt-4 w-full" role="img" aria-label="Rising bot-traffic trend">
            <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
              {[0, 30, 60, 90, 120].map((y) => (
                <line key={y} x1="0" y1={y} x2="320" y2={y} />
              ))}
            </g>
            <motion.polyline
              points="0,100 50,92 100,86 150,72 200,60 250,40 320,18"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={inViewOnce}
              transition={{ duration: 1.4, ease: [0.2, 0, 0, 1] }}
            />
          </svg>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-6">
          <Stat valueRef={botRef} value={bot} label="Traffic that is now bot / agent" />
          <Stat valueRef={usRef} value={us} label="Share of agent traffic from the US" />
          <Stat value="12 mo" label="Sustained upward trend" />
        </div>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  valueRef,
}: {
  value: React.ReactNode;
  label: string;
  valueRef?: React.RefObject<HTMLSpanElement>;
}) {
  return (
    <div>
      <div className="font-mono text-2xl font-extrabold tracking-display text-white">
        <span ref={valueRef}>{value}</span>
      </div>
      <div className="mt-2 text-sm text-[#b6bcca]">{label}</div>
    </div>
  );
}

export function LosingTraffic() {
  return (
    <section data-screen-label="losing-traffic" id="intelligence">
      <div className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28">
        <div className="mx-auto max-w-content">
          <CurrentVsFuture />
        </div>
      </div>
      <div className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-24">
        <ThesisBand />
      </div>
      <StatStrip />
    </section>
  );
}
