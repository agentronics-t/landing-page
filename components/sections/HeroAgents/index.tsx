"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { fadeUp, stagger } from "@/lib/motion";
import { useCountUp } from "@/lib/useCountUp";
import { StatCard } from "./StatCard";

/**
 * SDK page hero — "the web is losing agent traffic". Theme-aware (follows the
 * light/dark toggle). The globe is a realistic earth on white; we crop it square
 * and radial-mask the background away so the sphere sits cleanly on the canvas
 * in either theme.
 */
export function HeroAgents() {
  const reduce = useReducedMotion();

  const [botRef, botShare] = useCountUp({ to: 30.5, decimals: 1, suffix: "%", delay: 1200 });
  const [sessRef, sessions] = useCountUp({ to: 62000, separators: true, suffix: "+", delay: 1350 });

  return (
    <section
      data-screen-label="agent-traffic-hero"
      className="relative min-h-screen overflow-hidden bg-canvas text-content"
    >
      <Globe reduce={!!reduce} />
      {/* fog: globe melts into the canvas */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent to-canvas" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-content flex-col items-center px-[clamp(20px,5vw,48px)] pt-20 text-center md:pt-28"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow variant="accent">Current state · real agent data</Eyebrow>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="mt-5 max-w-4xl text-balance font-sans text-3xl font-bold tracking-display text-content sm:text-4xl md:text-5xl"
        >
          The web is no longer just human.
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-[620px] text-pretty text-xl text-content-secondary">
          Autonomous agents now drive a third of all web traffic. When they hit fragile, scraped HTML
          they fail, retry, or leave — and you lose users, revenue, and signal.
        </motion.p>
      </motion.div>

      {/* floating stats ringing the globe (desktop) — anchored to the same
          centered 680px box the globe renders in */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden lg:block">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{ width: "min(680px, 120vw)", aspectRatio: "1 / 1" }}
        >
          <StatCard
            floatDelay={0}
            className="pointer-events-auto absolute -left-52 top-[34%]"
            value={<span ref={botRef}>{botShare}</span>}
            label="Global bot & agent traffic share"
          />
          <StatCard
            floatDelay={0.6}
            className="pointer-events-auto absolute inset-x-0 top-[58%] mx-auto w-fit"
            value={<span ref={sessRef}>{sessions}</span>}
            label="Autonomous agent sessions routed"
          />
          <StatCard
            floatDelay={1.2}
            className="pointer-events-auto absolute -right-52 top-[34%]"
            value={
              <span>
                &lt;10<span className="text-accent">ms</span>
              </span>
            }
            label="Agentic browsing latency"
          />
        </div>
      </div>

      {/* mobile stats row */}
      <div className="relative z-10 mx-auto mt-12 grid max-w-content grid-cols-1 gap-4 px-[clamp(20px,5vw,48px)] pb-24 sm:grid-cols-3 lg:hidden">
        <StatCard floatDelay={0} value={<span>{botShare}</span>} label="Global bot & agent traffic share" />
        <StatCard floatDelay={0.4} value={<span>{sessions}</span>} label="Autonomous agent sessions routed" />
        <StatCard
          floatDelay={0.8}
          value={<span>&lt;10<span className="text-accent">ms</span></span>}
          label="Agentic browsing latency"
        />
      </div>
    </section>
  );
}

function Globe({ reduce }: { reduce: boolean }) {
  // Realistic earth on a white background — crop square + radial-mask the white
  // so only the sphere shows. Hard stop at the rim: crisp circumference, no fade.
  const circleMask =
    "radial-gradient(circle at 50% 50%, #000 49.4%, transparent 49.9%)";
  return (
    // outer div owns the horizontal centering — framer animates transform on the
    // inner div, which would otherwise clobber -translate-x-1/2
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{ width: "min(680px, 120vw)", aspectRatio: "1 / 1" }}
    >
      <motion.div
        initial={reduce ? false : { y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.2, 0, 0, 1] }}
        className="h-full w-full"
      >
        <video
          className="h-full w-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          width={680}
          height={680}
          style={{ maskImage: circleMask, WebkitMaskImage: circleMask }}
        >
          <source src="/globe.mp4" type="video/mp4" />
        </video>
      </motion.div>
    </div>
  );
}
