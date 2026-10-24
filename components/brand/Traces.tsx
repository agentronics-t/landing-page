"use client";

import { useInView, useReducedMotion } from "@/lib/useInView";
import { cn } from "@/lib/cn";

/**
 * The signature motif: thin copper traces with verdigris solder points.
 * Decorative only (aria-hidden). Motion rules (spec v3 §5.3): traces draw
 * once; at most one ambient packet at a time, ≤20% opacity, never behind
 * body text; nothing moves under prefers-reduced-motion.
 */

const HERO_TRACES = [
  "M0 140 H140 L200 200 H330 L380 250 V330",
  "M0 460 H110 L170 400 H300",
  "M0 640 H240 L300 580 H420",
  "M1200 110 H1050 L990 170 H900",
  "M1200 420 H1120 L1060 360 H960 L920 320",
  "M1200 620 H1000 L940 560 H860",
];
const HERO_NODES: [number, number][] = [[200, 200], [170, 400], [300, 580], [990, 170], [1060, 360], [940, 560]];

/**
 * Hero / final-CTA background. `lit` raises the copper (the input has focus).
 * `converge` bends the traces toward the centre, as a cue into the input.
 */
export function BackgroundTraces({ lit = false, converge = false, className }: { lit?: boolean; converge?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const traces = converge
    ? [
        "M0 120 H220 L320 220 H480 L540 280",
        "M0 380 H260 L300 340 H470",
        "M0 600 H200 L280 520 H480 L530 470",
        "M1200 120 H980 L880 220 H720 L660 280",
        "M1200 380 H940 L900 340 H730",
        "M1200 600 H1000 L920 520 H720 L670 470",
      ]
    : HERO_TRACES;
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden>
      {traces.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--copper)"
          strokeWidth="1.5"
          pathLength={1}
          className="trace-live"
          style={
            {
              "--len": 1,
              opacity: lit ? 0.55 : 0.15,
              transition: "opacity var(--dur-base) var(--ease-out)",
              animationDuration: "1200ms",
              animationDelay: `${i * 60}ms`,
            } as React.CSSProperties
          }
        />
      ))}
      {!converge &&
        HERO_NODES.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3.5" fill="var(--verdigris)" opacity="0.35" />)}
      {/* one idle packet: every 6s it runs one trace in 2.5s, at 20% opacity */}
      {!reduce && (
        <circle r="4" fill="var(--verdigris)" opacity="0.2">
          <animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.42;1" calcMode="linear" path={traces[converge ? 0 : 3]} />
        </circle>
      )}
    </svg>
  );
}

/**
 * Spec v3 §3.12: the one divider. A centre node with two verdigris nodes on
 * each side, mirrored. The line draws outward from the centre and the nodes
 * pop in mirrored pairs. HTML rather than a stretched SVG, so nodes stay round.
 */
export function Divider({ className }: { className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const line = (origin: "left" | "right", delay: number) => (
    <span
      className="h-px flex-1 bg-copper"
      style={{
        transform: inView ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: origin,
        transition: `transform var(--dur-slower) var(--ease-out) ${delay}ms`,
      }}
    />
  );
  const node = (delay: number) => (
    <span
      className="h-2 w-2 shrink-0 rounded-full bg-verdigris"
      style={{ opacity: inView ? 1 : 0, transition: `opacity var(--dur-base) var(--ease-out) ${delay}ms` }}
    />
  );
  return (
    <div ref={ref} aria-hidden className={cn("mx-auto flex w-[min(100%-32px,960px)] items-center", className)}>
      {line("right", 240)}
      {node(400)}
      {line("right", 120)}
      {node(340)}
      {line("right", 0)}
      <span className="h-3 w-3 shrink-0 rounded-full border-2 border-copper bg-canvas" />
      {line("left", 0)}
      {node(340)}
      {line("left", 120)}
      {node(400)}
      {line("left", 240)}
    </div>
  );
}
