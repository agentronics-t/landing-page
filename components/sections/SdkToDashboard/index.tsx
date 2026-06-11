"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { Logomark } from "@/components/ui/Logo";
import { Dashboard } from "@/components/sections/DataPlatforms/Dashboard";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";

/**
 * /sdk — From SDK to dashboard. Left: a small dark tile standing in for the
 * customer's backend with the Agentronics SDK installed. Right: the full
 * governance dashboard (reused from the Intelligence page). Between them,
 * woven cords carry traveling data pulses — install once, everything streams
 * into the dashboard.
 */

const CHECKLIST = [
  "Monitor active agent sessions in real time.",
  "Track specific tasks performed via the protocol.",
  "Analyze performance metrics, latency, and API usage.",
];

interface Strand {
  d: string;
  amber?: boolean;
}

// woven cords across the 180×216 wire column (left edge → right edge)
const STRANDS: Strand[] = [
  { d: "M0,96 C56,30 124,180 180,104" },
  { d: "M0,116 C56,196 124,30 180,112" },
  { d: "M0,88 C64,80 116,140 180,96", amber: true },
  { d: "M0,128 C64,140 116,84 180,124" },
  { d: "M0,108 C90,52 90,168 180,108", amber: true },
];

export function SdkToDashboard() {
  return (
    <section
      data-screen-label="sdk-to-dashboard"
      className="bg-canvas px-[clamp(20px,5vw,48px)] pb-20 pt-10 md:pb-28 md:pt-14"
    >
      <div className="mx-auto max-w-content">
        {/* header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="text-center"
        >
          <motion.div variants={fadeUp}>
            <Eyebrow>Observability</Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-4 text-3xl font-bold tracking-display text-content md:text-4xl"
          >
            From SDK to dashboard
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-[560px] text-pretty text-base text-content-secondary"
          >
            Install the SDK in your backend once — every agent interaction streams live into the
            Agentronics dashboard. Complete visibility into non-human traffic.
          </motion.p>
        </motion.div>

        {/* visual: backend tile → wires → dashboard */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mt-14 grid grid-cols-1 items-center gap-8 lg:grid-cols-[250px_170px_minmax(0,1fr)] lg:gap-0"
        >
          <motion.div variants={fadeUp}>
            <BackendTile />
          </motion.div>

          <motion.div variants={fadeUp} className="hidden lg:block">
            <Wires />
          </motion.div>

          <motion.div variants={fadeUp} className="min-w-0">
            <Dashboard />
          </motion.div>
        </motion.div>

        {/* checklist */}
        <motion.ul
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3"
        >
          {CHECKLIST.map((item) => (
            <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
              <span
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
                style={{ background: "var(--success)" }}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              <span className="text-base text-content-secondary">{item}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

/** The customer's backend — a dark glowing tile with the SDK installed. */
function BackendTile() {
  return (
    <div className="mx-auto w-full max-w-[250px]">
      <p className="mb-3 text-center font-mono text-xs uppercase tracking-caps text-content-muted">
        Your backend
      </p>
      <div
        className="rounded-2xl border border-border bg-neutral-950 p-6"
        style={{ boxShadow: "0 0 48px -12px var(--brand)" }}
      >
        <div className="grid place-items-center gap-3 py-3">
          <span className="grid h-16 w-16 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <Logomark size={34} onDark />
          </span>
          <p className="font-mono text-xs text-white/80">@agentronics/sdk</p>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {["API", "DB", "AUTH"].map((t) => (
            <span
              key={t}
              className="rounded-pill bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-caps text-white/60"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Woven cords with traveling data pulses (backend → dashboard). */
function Wires() {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 180 216"
      className="h-auto w-full"
      role="img"
      aria-label="Data flowing from your backend into the Agentronics dashboard"
    >
      {STRANDS.map((s, i) => {
        const base = s.amber ? "var(--accent)" : "var(--neutral-300)";
        return (
          <g key={i}>
            {/* base strand draws in */}
            <motion.path
              d={s.d}
              fill="none"
              stroke={base}
              strokeWidth={s.amber ? 2.4 : 1.6}
              strokeLinecap="round"
              opacity={s.amber ? 0.7 : 0.45}
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={inViewOnce}
              transition={{ duration: 1, ease: [0.2, 0, 0, 1], delay: i * 0.08 }}
            />
            {/* traveling data pulse */}
            {!reduce && (
              <motion.path
                d={s.d}
                fill="none"
                stroke={s.amber ? "var(--accent)" : "var(--brand)"}
                strokeWidth={s.amber ? 3 : 2.2}
                strokeLinecap="round"
                strokeDasharray="9 300"
                initial={{ strokeDashoffset: 309 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: i * 0.45 }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
