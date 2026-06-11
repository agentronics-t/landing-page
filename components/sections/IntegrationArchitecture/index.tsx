"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { LaunchTrigger } from "@/components/launch/LaunchModal";
import { cn } from "@/lib/cn";

/**
 * /sdk — Integration architecture as a scroll-driven process dial (Agnos-style):
 * the section pins while a large circular dial rotates like a clock as you
 * scroll. Step-number diamond chips ride the dial's rim; the active step's
 * badge + copy sit fixed at the apex and crossfade on each step change.
 * Mobile + reduced-motion get a static stacked-card fallback.
 */

interface Step {
  n: string;
  kicker: string;
  title: string;
  body: string;
  tags: string;
}

const STEPS: Step[] = [
  {
    n: "01",
    kicker: "Initialization",
    title: "Install SDK",
    body: "Deploy the Agentronics SDK via npm or standard script tags. It automatically detects your site structure.",
    tags: "SDK · INSTALL · AUTO-DETECT",
  },
  {
    n: "02",
    kicker: "Context & access",
    title: "Memory & tool management",
    body: "Give agents proper context and access — our memory tool carries sessions and preferences while WebMCP tool management governs exactly what each agent can reach.",
    tags: "MEMORY · CONTEXT · WEBMCP · ACCESS",
  },
  {
    n: "03",
    kicker: "Observability",
    title: "Observability & analytics",
    body: "See how agents operate and why they take decisions — every call traced, every outcome scored, built for an agentic world.",
    tags: "TRACES · ANALYTICS · DECISIONS",
  },
  {
    n: "04",
    kicker: "Intelligence",
    title: "Intelligence platform",
    body: "Turn agent activity into business sense — our intelligence platform shows what this data means for your revenue, product, and roadmap.",
    tags: "INSIGHTS · BUSINESS · STRATEGY",
  },
];

const ANGLE = 46; // degrees between step chips on the dial
const DIAL = 980; // dial diameter (px)

export function IntegrationArchitecture() {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // continuous clock rotation across the whole scroll track, spring-smoothed
  const rotateRaw = useTransform(scrollYProgress, [0, 1], [0, -ANGLE * (STEPS.length - 1)]);
  const rotate = useSpring(rotateRaw, { stiffness: 90, damping: 22 });

  // at the end of the track the dial widens (origin top, so the bottom flares
  // out) and fades — blending into the SDK→dashboard section that follows
  const dialScale = useTransform(scrollYProgress, [0.86, 1], [1, 1.45]);
  const dialOpacity = useTransform(scrollYProgress, [0.88, 1], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(STEPS.length - 1, Math.round(v * (STEPS.length - 1)));
    if (idx !== active) setActive(idx);
  });

  const scrollToStep = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * i) / (STEPS.length - 1) + 2, behavior: "smooth" });
  };

  const step = STEPS[active];

  return (
    <section data-screen-label="integration-architecture" className="bg-canvas">
      {/* ------- mobile / reduced-motion fallback: stacked cards ------- */}
      <div className={cn("px-[clamp(20px,5vw,48px)] py-20", reduce ? "block" : "md:hidden")}>
        <div className="mx-auto max-w-content">
          <Eyebrow>Process</Eyebrow>
          <h2 className="mt-3 text-2xl font-bold tracking-title text-content md:text-3xl">
            Integration architecture
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-surface p-6">
                <span className="inline-block rounded-md bg-surface-raised px-2.5 py-1 font-mono text-xs uppercase tracking-caps text-content-secondary">
                  {s.n}. {s.kicker}
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-title text-content">{s.title}</h3>
                <p className="mt-2 text-base text-content-secondary">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------- desktop: pinned scroll dial ------- */}
      {!reduce && (
        <div ref={trackRef} className="relative hidden h-[400vh] md:block">
          <div className="sticky top-0 flex h-screen flex-col items-center overflow-hidden px-[clamp(20px,5vw,48px)] pt-24">
            <Eyebrow>Process</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-display text-content md:text-4xl">
              Integration architecture
            </h2>

            {/* dial stage */}
            <div className="relative mt-10 w-full flex-1">
              {/* dial assembly — centering via framer x (a CSS -translate-x-1/2 class
                  would be clobbered by the scale transform); scales up from its top
                  edge + fades at the end of the track to blend into the next section */}
              <motion.div
                aria-hidden
                className="absolute left-1/2 top-16"
                style={{
                  width: DIAL,
                  height: DIAL,
                  x: "-50%",
                  scale: dialScale,
                  opacity: dialOpacity,
                  transformOrigin: "50% 0%",
                }}
              >
                <motion.div
                  style={{ rotate }}
                  className="relative h-full w-full rounded-full border border-border bg-surface-raised/60"
                >
                  {STEPS.map((s, i) => (
                    <DialChip
                      key={s.n}
                      step={s}
                      index={i}
                      rotate={rotate}
                      active={i === active}
                      onClick={() => scrollToStep(i)}
                    />
                  ))}
                </motion.div>

                {/* progress sweep over the visible half (does not rotate) */}
                <svg
                  viewBox="0 0 980 490"
                  className="pointer-events-none absolute left-0 top-0"
                  style={{ width: DIAL, height: DIAL / 2 }}
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M 4 490 A 486 486 0 0 1 976 490"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{ pathLength: (active + 1) / STEPS.length }}
                    transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                    style={{ opacity: 0.45 }}
                  />
                </svg>
              </motion.div>

              {/* apex badge + step copy (fixed, crossfades) */}
              <div className="pointer-events-none relative z-10 flex flex-col items-center pt-6">
                <p className="font-mono text-xs uppercase tracking-caps text-content-muted">Step</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -14, scale: 0.98 }}
                    transition={{ duration: 0.32, ease: [0.2, 0, 0, 1] }}
                    className="flex flex-col items-center"
                  >
                    <span className="mt-2 grid h-12 w-12 place-items-center rounded-lg bg-accent font-mono text-lg font-bold text-accent-content shadow-raise">
                      {step.n}
                    </span>
                    <p className="mt-10 font-mono text-xs uppercase tracking-caps text-content-muted">
                      {step.kicker}
                    </p>
                    <h3 className="mt-2 text-3xl font-bold tracking-title text-content">
                      {step.title}
                    </h3>
                    <p className="mt-4 max-w-lg text-pretty text-center text-lg text-content-secondary">
                      {step.body}
                    </p>
                    <p className="mt-5 font-mono text-xs uppercase tracking-caps text-content-muted">
                      {step.tags}
                    </p>
                    <LaunchTrigger
                      variant="accent"
                      size="md"
                      className="pointer-events-auto mt-7"
                    >
                      Start integrating
                    </LaunchTrigger>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* counter + dot pager */}
            <div className="pb-10 pt-4">
              <p className="text-center font-mono text-sm text-content-muted">
                {step.n} / 0{STEPS.length}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                {STEPS.map((s, i) => (
                  <button
                    key={s.n}
                    aria-label={`Go to step ${s.n}`}
                    onClick={() => scrollToStep(i)}
                    className={cn(
                      "h-1.5 rounded-pill transition-all",
                      i === active ? "w-6 bg-accent" : "w-1.5 bg-border-strong hover:bg-content-muted",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** Diamond step chip riding the dial rim, counter-rotated to stay upright. */
function DialChip({
  step,
  index,
  rotate,
  active,
  onClick,
}: {
  step: Step;
  index: number;
  rotate: MotionValue<number>;
  active: boolean;
  onClick: () => void;
}) {
  // keep the chip upright (and diamond-shaped) regardless of dial rotation
  const upright = useTransform(rotate, (r) => -(r + index * ANGLE) + 45);

  return (
    <div
      className="absolute inset-0"
      style={{ transform: `rotate(${index * ANGLE}deg)` }}
      aria-hidden
    >
      <motion.button
        tabIndex={-1}
        onClick={onClick}
        style={{ rotate: upright }}
        animate={{ opacity: active ? 0 : 1, scale: active ? 0.7 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute left-1/2 top-0 -ml-6 -mt-6 grid h-12 w-12 place-items-center rounded-lg border border-border bg-surface shadow-raise transition-colors hover:border-brand"
      >
        <span className="-rotate-45 font-mono text-base text-content">{step.n}</span>
      </motion.button>
    </div>
  );
}
