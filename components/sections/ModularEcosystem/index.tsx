"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Cpu, Send } from "lucide-react";
import { Logomark } from "@/components/ui/Logo";
import { fadeUp, inViewOnce } from "@/lib/motion";

/**
 * Home / Intelligence — "Modular Ecosystem" (Figma Banner 2: Architecture & Agents).
 * Left: system topology feeding the Agentronics engine node.
 * Right: an Insights Agent chat answering a CRM-anomalies query.
 */
export function ModularEcosystem() {
  return (
    <section
      id="intelligence"
      data-screen-label="modular-ecosystem"
      className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-content">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={inViewOnce}>
          <h2 className="text-3xl font-bold tracking-display text-content md:text-4xl">
            Modular ecosystem
          </h2>
          <p className="mt-3 max-w-[560px] text-pretty text-lg text-content-secondary">
            Connect diverse plugins to specialized intelligence agents.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
          <Topology />
          <InsightsAgent />
        </div>
      </div>
    </section>
  );
}

function Topology() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <p className="font-mono text-xs uppercase tracking-caps text-content-muted">System topology</p>
      <div className="relative mt-8 flex items-center" style={{ minHeight: 280 }}>
        {/* engine node */}
        <div className="relative z-10 grid h-32 w-32 shrink-0 place-items-center rounded-xl bg-neutral-950 text-white">
          <div className="flex flex-col items-center gap-2">
            <Cpu size={26} />
            <p className="text-center font-mono text-xs uppercase tracking-caps leading-tight text-white/80">
              Agentronics
              <br />
              engine
            </p>
          </div>
        </div>
        {/* connecting lines fanning out to plugin stubs */}
        <svg className="ml-2 h-48 flex-1" viewBox="0 0 280 200" fill="none" aria-hidden>
          {[34, 78, 122, 166].map((y, i) => (
            <g key={i}>
              <motion.line
                x1="0"
                y1={y}
                x2="240"
                y2={y}
                stroke="var(--border-strong)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={inViewOnce}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
              <circle cx="240" cy={y} r="5" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

interface Bubble {
  from: "user" | "agent";
}

function InsightsAgent() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [phase, setPhase] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce) return setPhase(3);
    if (!inView) return;
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2300);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [inView, reduce]);

  return (
    <div ref={ref} className="flex flex-col rounded-xl border border-border bg-surface p-6">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-950">
          <Logomark size={20} onDark />
        </span>
        <div>
          <p className="text-base font-semibold text-content">Insights Agent</p>
          <p className="font-mono text-xs uppercase tracking-caps text-content-muted">
            Active intelligence
          </p>
        </div>
      </div>

      {/* conversation */}
      <div className="flex flex-1 flex-col gap-3 py-4">
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[85%] self-end rounded-lg bg-brand-soft px-3 py-2 text-sm text-content"
          >
            What were the key anomalies in last week&rsquo;s CRM data?
          </motion.div>
        )}

        {phase === 2 && (
          <div className="flex items-center gap-1 self-start rounded-lg border border-border px-3 py-2.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-content-muted"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}

        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start rounded-lg border border-border bg-surface-raised px-3 py-3 text-sm text-content"
          >
            <p>I analyzed the CRM DB. Found 3 critical anomalies:</p>
            <ul className="mt-2 space-y-1 text-content-secondary">
              <li>• Spike in churn intent signals (Region B)</li>
              <li>• Data latency in 4 API endpoints</li>
              <li>• Unusual cluster of support tickets referencing &ldquo;latency&rdquo;</li>
            </ul>
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <Tag>CRM DB</Tag>
              <Tag>REST API</Tag>
            </div>
          </motion.div>
        )}
      </div>

      {/* input mockup */}
      <div className="flex items-center gap-2 rounded-md border border-border-strong px-3 py-2">
        <span className="font-mono text-sm text-content-muted">{">"}</span>
        <span className="flex-1 font-mono text-sm text-content-muted">Query specialized agent…</span>
        <Send size={16} className="text-brand" />
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-surface px-2 py-0.5 font-mono text-xs uppercase tracking-caps text-content-secondary">
      {children}
    </span>
  );
}
