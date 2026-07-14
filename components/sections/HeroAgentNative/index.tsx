"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Logomark } from "@/components/ui/Logo";
import { fadeUp, floaty, stagger } from "@/lib/motion";

/**
 * Intelligence page hero (Fusion-AI style). Theme-aware: diagonal indigo+amber
 * light beams drift over the canvas — mix-blend-multiply gives a soft brand tint
 * on the light canvas, dark:mix-blend-screen makes them glow on near-black. Left
 * content pitches "make your business agent native"; a floating glass analytics
 * card ties the story to measuring agent traffic. Reduced motion → static.
 */

// diagonal light beams — vertical bars that become streaks once the layer is
// rotated. [left %, width px, color var, drift px, blur px, opacity]
const BEAMS: [string, number, string, number, number, number][] = [
  ["8%", 26, "var(--brand)", 30, 46, 0.5],
  ["24%", 10, "var(--accent)", -24, 30, 0.55],
  ["40%", 40, "var(--brand)", 34, 60, 0.42],
  ["58%", 8, "var(--accent)", 22, 26, 0.5],
  ["70%", 30, "var(--brand)", -30, 52, 0.46],
  ["86%", 14, "var(--brand)", 26, 34, 0.4],
];

export function HeroAgentNative() {
  const reduce = useReducedMotion();

  return (
    <section
      data-screen-label="hero-agent-native"
      className="relative flex min-h-screen items-center overflow-hidden bg-canvas"
    >
      {/* ---------- animated background ---------- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mix-blend-mode:multiply] dark:[mix-blend-mode:screen]"
      >
        {/* rotated beam field (oversized so rotation leaves no gaps) */}
        <div className="absolute left-1/2 top-1/2 h-[180%] w-[160%] -translate-x-1/2 -translate-y-1/2 rotate-[24deg]">
          {BEAMS.map(([left, w, color, drift, blur, op], i) => (
            <motion.div
              key={i}
              className="absolute top-[-20%] h-[140%]"
              style={{
                left,
                width: w,
                background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
                filter: `blur(${blur}px)`,
                opacity: op,
              }}
              animate={reduce ? undefined : { x: [0, drift, 0], opacity: [op, op * 1.35, op] }}
              transition={{
                duration: 7 + i,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* soft corner glows for depth */}
        <motion.div
          className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, var(--brand), transparent 70%)", opacity: 0.35 }}
          animate={reduce ? undefined : { opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-48 left-[-10%] h-[460px] w-[460px] rounded-full"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)", opacity: 0.22 }}
          animate={reduce ? undefined : { opacity: [0.15, 0.32, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* fade the beams into the section bottom so it flows into the next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-canvas"
      />

      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto grid w-full max-w-content grid-cols-1 items-center gap-12 px-[clamp(20px,5vw,48px)] pt-28 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.h1
            variants={fadeUp}
            className="max-w-[14ch] text-balance text-5xl font-bold leading-[1.03] tracking-display text-content sm:text-6xl lg:text-7xl"
          >
            Make your business agent native
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-[54ch] text-pretty text-xl text-content-secondary md:text-2xl"
          >
            Agents are flooding your site — your sales funnel breaks and your marketing spend stops
            making sense. Here&rsquo;s the fix.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/book" variant="primary" size="lg" glow>
              Book a demo
            </ButtonLink>
            <ButtonLink href="/sign-up" prefetch={false} variant="ghost" size="lg">
              Get started
            </ButtonLink>
          </motion.div>
        </motion.div>

        {/* floating glass analytics card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="hidden justify-self-end lg:block"
        >
          <FloatingCard reduce={!!reduce} />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingCard({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      variants={reduce ? undefined : floaty}
      animate={reduce ? undefined : "animate"}
      className="w-[420px] rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] p-7 shadow-raise backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-caps text-content-secondary">
          <Logomark size={14} /> Agent traffic
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-caps text-content-secondary">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} />
          Live
        </span>
      </div>

      {/* headline stat */}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-caps text-content-muted">Revenue from agents</p>
        <p className="mt-1 flex items-center gap-2 font-mono text-4xl font-extrabold text-content">
          +$8.4k
          <span className="flex items-center gap-0.5 text-base" style={{ color: "var(--success)" }}>
            <TrendingUp size={16} /> 12%
          </span>
        </p>
        <p className="text-xs text-content-muted">this week · 1,840 checkouts</p>
      </div>

      {/* sparkline */}
      <svg viewBox="0 0 300 60" className="mt-3 w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,48 L50,44 L100,46 L150,32 L200,26 L250,16 L300,8 L300,60 L0,60 Z" fill="url(#heroSpark)" />
        <path
          d="M0,48 L50,44 L100,46 L150,32 L200,26 L250,16 L300,8"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* mini rows */}
      <div className="mt-4 space-y-2.5">
        {[
          ["Verified agent rate", "94%"],
          ["Funnel recovered", "+18%"],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-content-secondary">
              <span
                className="grid h-5 w-5 place-items-center rounded-full"
                style={{ background: "var(--success-bg)", color: "var(--success)" }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              {label}
            </span>
            <span className="font-mono font-semibold text-content">{val}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
