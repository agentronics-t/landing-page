"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logomark } from "@/components/ui/Logo";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";

/**
 * Home / Intelligence — "Data to decisions". Two mirrored panels share ONE
 * point cloud: left renders it confused (drifting, depth-blurred, unstructured);
 * right renders the same points connected into a governed graph with a digital
 * cursor working node-to-node (agents acting on the data). The Agentronics
 * logomark bridges the two. Pseudo-3D via CSS perspective + per-point depth +
 * sphere-shaded gradients — no WebGL needed at this scale. The page's <h1>.
 */

// one shared cloud — identical coordinates in both panels (x/y in %, z = depth 0..1)
const POINTS = [
  { x: 14, y: 22, z: 0.9 },
  { x: 30, y: 64, z: 0.5 },
  { x: 26, y: 38, z: 0.7 },
  { x: 44, y: 16, z: 0.6 },
  { x: 50, y: 50, z: 1.0 }, // hub
  { x: 63, y: 30, z: 0.8 },
  { x: 70, y: 66, z: 0.55 },
  { x: 85, y: 22, z: 0.65 },
  { x: 87, y: 54, z: 0.45 },
  { x: 38, y: 84, z: 0.6 },
  { x: 60, y: 88, z: 0.4 },
  { x: 12, y: 80, z: 0.5 },
  { x: 76, y: 10, z: 0.5 },
  { x: 22, y: 8, z: 0.45 },
  { x: 8, y: 48, z: 0.6 },
  { x: 40, y: 38, z: 0.85 },
  { x: 57, y: 12, z: 0.45 },
  { x: 92, y: 38, z: 0.55 },
  { x: 80, y: 82, z: 0.5 },
  { x: 50, y: 70, z: 0.7 },
  { x: 18, y: 58, z: 0.65 },
  { x: 33, y: 25, z: 0.5 },
  { x: 68, y: 48, z: 0.9 },
  { x: 90, y: 70, z: 0.4 },
];

// hand-picked edges — hub-and-spoke with an outer ring (reads as a tidy graph)
const EDGES: [number, number][] = [
  [4, 15], [4, 22], [4, 19], [4, 5], [4, 1],
  [15, 2], [15, 21], [15, 3], [2, 0], [0, 13],
  [13, 21], [21, 3], [3, 16], [16, 12], [12, 7],
  [7, 17], [17, 8], [8, 23], [23, 18], [18, 10],
  [10, 9], [9, 1], [1, 11], [11, 20], [20, 14],
  [14, 2], [5, 16], [5, 22], [22, 6], [6, 18],
  [6, 8], [19, 9], [20, 1],
];

// the ML pipeline's flow route through the graph (point indices; loops back to start)
const ROUTE = [4, 22, 6, 18, 10, 9, 1, 20, 2, 15, 5, 4];
const FLOW_DUR = 14; // seconds for a full pass
const PACKETS = 3; // amber data packets traveling the route, evenly spaced

// pipeline stages cycled in the status chip
const STAGES = ["Ingesting signals", "Extracting features", "Scoring intent", "Routing decisions"];

// sphere shading — light hits top-left, dark falls bottom-right
const SPHERE_GREY =
  "radial-gradient(circle at 32% 30%, var(--neutral-200), var(--neutral-400) 55%, var(--neutral-600) 95%)";
const SPHERE_BRAND =
  "radial-gradient(circle at 32% 30%, var(--indigo-300), var(--indigo-500) 55%, var(--indigo-800) 95%)";

export function DataToDecisions() {
  return (
    <section
      data-screen-label="data-to-decisions"
      className="bg-canvas px-[clamp(20px,5vw,48px)] pb-20 pt-32 md:pb-28 md:pt-40"
    >
      <div className="mx-auto max-w-content text-center">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="text-4xl font-bold tracking-display text-content md:text-5xl"
        >
          Data to decisions
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mx-auto mt-5 max-w-[640px] text-pretty text-lg text-content-secondary"
        >
          Our intelligence platform processes disparate data streams into structured, actionable
          insights with structural precision.
        </motion.p>
      </div>

      {/* panels run wider than the copy column — they're the hero artifact */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto mt-16 grid max-w-[1280px] grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]"
      >
        <motion.div variants={fadeUp}>
          <ChaosPanel />
        </motion.div>

        <motion.div variants={fadeUp}>
          <LogoBridge />
        </motion.div>

        <motion.div variants={fadeUp}>
          <AgentPanel />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------- left ---------------------------------- */

function ChaosPanel() {
  const reduce = useReducedMotion();
  return (
    <Tile label="Raw data" caption="Confused, disconnected data points">
      <div
        className="relative h-[22rem] w-full overflow-hidden rounded-lg md:h-[27rem]"
        style={{ perspective: 700 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={reduce ? undefined : { rotateY: [-8, 8], rotateX: [4, -4] }}
          transition={{ duration: 11, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          {POINTS.map((p, i) => (
            <span
              key={i}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translateZ(${(p.z - 0.5) * 120}px)`,
              }}
            >
              <motion.span
                className="block rounded-full"
                style={{
                  width: 6 + p.z * 10,
                  height: 6 + p.z * 10,
                  opacity: 0.45 + p.z * 0.5,
                  background: SPHERE_GREY,
                  filter: p.z < 0.55 ? "blur(1.2px)" : undefined,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                }}
                animate={
                  reduce
                    ? undefined
                    : {
                        x: [0, (i % 2 ? -1 : 1) * (7 + (i % 5) * 3), 0],
                        y: [0, (i % 3 ? 1 : -1) * (9 + (i % 4) * 3), 0],
                      }
                }
                transition={{ duration: 3.5 + (i % 5), repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />
            </span>
          ))}
        </motion.div>
      </div>
    </Tile>
  );
}

/* --------------------------------- bridge --------------------------------- */

function LogoBridge() {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-center justify-center gap-3 md:flex-col md:gap-4">
      <span className="h-px w-10 bg-border-strong md:h-12 md:w-px" />
      <div className="relative grid place-items-center rounded-xl border border-border bg-surface p-3 shadow-glow">
        {!reduce && (
          <motion.span
            className="absolute inset-0 rounded-xl border border-brand"
            animate={{ opacity: [0.5, 0], scale: [1, 1.25] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            aria-hidden
          />
        )}
        <Logomark size={30} />
      </div>
      <span className="h-px w-10 bg-border-strong md:h-12 md:w-px" />
    </div>
  );
}

/* ---------------------------------- right --------------------------------- */

function AgentPanel() {
  const reduce = useReducedMotion();
  const leg = FLOW_DUR / (ROUTE.length - 1);

  return (
    <Tile
      label="ML pipeline"
      caption="The same data — know what it means for an agentic era"
      captionAccent
    >
      <div
        className="relative h-[22rem] w-full overflow-hidden rounded-lg md:h-[27rem]"
        style={{ perspective: 900 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={reduce ? undefined : { rotateY: [4, -4], rotateX: [-2, 2] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          {/* connections */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {EDGES.map(([a, b], i) => (
              <motion.line
                key={i}
                x1={POINTS[a].x}
                y1={POINTS[a].y}
                x2={POINTS[b].x}
                y2={POINTS[b].y}
                stroke="var(--brand)"
                strokeOpacity="0.32"
                strokeWidth="0.4"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={inViewOnce}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: [0.2, 0, 0, 1] }}
              />
            ))}
          </svg>

          {/* nodes — same coordinates as the chaos panel, now steady + on-brand */}
          {POINTS.map((p, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: 7 + p.z * 9,
                height: 7 + p.z * 9,
                opacity: 0.6 + p.z * 0.4,
                background: SPHERE_BRAND,
                transform: `translate(-50%, -50%) translateZ(${(p.z - 0.5) * 60}px)`,
                boxShadow: p.z > 0.7 ? "0 0 14px var(--brand)" : "0 2px 5px rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </motion.div>

        {/* analysis ripples where the lead packet lands */}
        {!reduce &&
          ROUTE.slice(0, -1).map((idx, k) => (
            <motion.span
              key={k}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                left: `${POINTS[idx].x}%`,
                top: `${POINTS[idx].y}%`,
                width: 26,
                height: 26,
                borderColor: "var(--accent)",
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 0.7, 0], scale: [0.4, 1.9] }}
              transition={{
                duration: 0.9,
                delay: k * leg,
                repeat: Infinity,
                repeatDelay: FLOW_DUR - 0.9,
                ease: "easeOut",
              }}
              aria-hidden
            />
          ))}

        {/* amber data packets streaming through the pipeline */}
        {!reduce &&
          Array.from({ length: PACKETS }).map((_, k) => (
            <motion.span
              key={k}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${POINTS[ROUTE[0]].x}%`,
                top: `${POINTS[ROUTE[0]].y}%`,
                width: 8,
                height: 8,
                background: "var(--accent)",
                boxShadow: "0 0 10px var(--accent)",
              }}
              animate={{
                left: ROUTE.map((i) => `${POINTS[i].x}%`),
                top: ROUTE.map((i) => `${POINTS[i].y}%`),
              }}
              transition={{
                duration: FLOW_DUR,
                delay: k * (FLOW_DUR / PACKETS),
                repeat: Infinity,
                ease: "easeInOut",
              }}
              aria-hidden
            />
          ))}

        {/* pipeline status chip — cycles through analysis stages */}
        <StageChip reduce={!!reduce} />

        {/* live pill */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-2 py-0.5 font-mono text-[10px] uppercase tracking-caps text-content-secondary">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} />
          Live
        </span>
      </div>
    </Tile>
  );
}

function StageChip({ reduce }: { reduce: boolean }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-2.5 py-1 shadow-raise">
      <span className="font-mono text-[10px] uppercase tracking-caps text-content-muted">
        ML pipeline
      </span>
      <span className="h-3 w-px bg-border" />
      <span className="relative inline-flex h-3.5 w-[110px] items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={stage}
            initial={reduce ? false : { y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="absolute whitespace-nowrap font-mono text-[10px] uppercase tracking-caps"
            style={{ color: "var(--accent)" }}
          >
            {STAGES[stage]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

/* --------------------------------- shared --------------------------------- */

function Tile({
  label,
  caption,
  captionAccent = false,
  children,
}: {
  label: string;
  caption: string;
  captionAccent?: boolean;
  children: React.ReactNode;
}) {
  return (
    // borderless — the panels sit directly on the canvas
    <div className="p-4">
      <p className="mb-3 text-left font-mono text-xs uppercase tracking-caps text-content-muted">
        {label}
      </p>
      {children}
      <p
        className="mt-3 text-center text-base"
        style={captionAccent ? { color: "var(--accent)" } : undefined}
      >
        {captionAccent ? caption : <span className="text-content-secondary">{caption}</span>}
      </p>
    </div>
  );
}
