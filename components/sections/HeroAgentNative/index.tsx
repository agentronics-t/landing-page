"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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

/**
 * Agent activity card — who is crawling the site, how much, and how it's
 * trending. Dot colour = the lane we classified them into (WebMCP-verified,
 * Web Bot Auth, or unverified/stealth).
 */
const AGENTS: {
  name: string;
  org: string;
  reqs: string;
  color: string;
  spark: string;
}[] = [
  {
    name: "gptbot",
    org: "OpenAI",
    reqs: "2.1K",
    color: "var(--brand)",
    spark: "0,16 12,13 24,14 36,9 48,7 60,3",
  },
  {
    name: "claudebot",
    org: "Anthropic",
    reqs: "1.4K",
    color: "var(--accent)",
    spark: "0,14 12,15 24,8 36,11 48,6 60,5",
  },
  {
    name: "perplexitybot",
    org: "Perplexity",
    reqs: "486",
    color: "var(--success)",
    spark: "0,12 12,10 24,13 36,8 48,10 60,7",
  },
  {
    name: "bingbot",
    org: "Microsoft",
    reqs: "95",
    color: "var(--content-muted)",
    spark: "0,10 12,14 24,11 36,15 48,13 60,16",
  },
];

function FloatingCard({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      variants={reduce ? undefined : floaty}
      animate={reduce ? undefined : "animate"}
      className="w-[420px] rounded-2xl border border-border bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] p-6 shadow-raise backdrop-blur-md"
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Logomark size={16} />
          <span className="text-base font-bold tracking-title text-content">Agent activity</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-caps text-content-secondary">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} />
          Live
        </span>
      </div>

      {/* column head */}
      <div className="mt-5 flex items-center justify-between border-b border-border pb-2 font-mono text-[10px] uppercase tracking-caps text-content-muted">
        <span>Agent</span>
        <span>Requests · 24h</span>
      </div>

      {/* rows */}
      <ul>
        {AGENTS.map((a) => (
          <li
            key={a.name}
            className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: a.color }}
              aria-hidden
            />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate font-mono text-[13px] text-content">{a.name}</span>
              <span className="block text-[10px] text-content-muted">{a.org}</span>
            </span>
            <span className="font-mono text-[13px] font-semibold text-content">{a.reqs}</span>
            {/* per-agent trend */}
            <svg width="60" height="20" viewBox="0 0 60 20" className="shrink-0" aria-hidden>
              <polyline
                points={a.spark}
                fill="none"
                stroke={a.color}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <ChevronRight size={14} className="shrink-0 text-content-muted" aria-hidden />
          </li>
        ))}
      </ul>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-caps text-content-muted">
        8 agents · 94% verified
      </p>
    </motion.div>
  );
}
