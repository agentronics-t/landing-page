"use client";

import { useEffect, useState } from "react";
import { BAND_COLOR, BAND_TEXT, scoreBand } from "@/lib/scan/types";
import { prefersReducedMotion, useCountUp } from "@/lib/useInView";
import { cn } from "@/lib/cn";

/**
 * The Agent Readiness Score gauge (spec v3 §3.2): a 270° copper-trace arc with
 * verdigris solder nodes at 40, 70 and 100. `value={null}` shows "?/100".
 * With a value, a band-coloured fill and needle sweep from `from` to `value`
 * once `start` is true. The band always shows as text too (WCAG 1.4.1).
 */

const R = 80;
const C = 2 * Math.PI * R;
const ARC = C * 0.75;
const angleAt = (f: number) => ((135 + 270 * f) * Math.PI) / 180;
const pointAt = (f: number) => ({ x: 100 + R * Math.cos(angleAt(f)), y: 100 + R * Math.sin(angleAt(f)) });

export function ScoreGauge({
  value,
  from = 0,
  start = true,
  size = 220,
  label = "Your Agent Readiness Score",
  showBand = true,
  pulseKey = 0,
  sweepMs = 1200,
  className,
}: {
  value: number | null;
  from?: number;
  start?: boolean;
  size?: number;
  label?: string | null;
  showBand?: boolean;
  /** Change it to make the "?" pulse once (e.g. on input focus). */
  pulseKey?: number;
  sweepMs?: number;
  className?: string;
}) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) return setDrawn(true);
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [start]);

  const shown = useCountUp(value ?? 0, start && value !== null, sweepMs, from);
  const band = value === null ? null : scoreBand(value);
  const color = band ? BAND_COLOR[scoreBand(shown).tone] : "var(--copper)";
  const tip = pointAt(Math.max(0.001, shown / 100));

  return (
    <figure className={cn("flex flex-col items-center", className)} style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size * 0.86 }}>
        <svg viewBox="0 6 200 172" className="absolute inset-0 h-full w-full" aria-hidden>
          {/* the trace: drawn once in copper */}
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="var(--copper)"
            strokeOpacity={value === null ? 0.9 : 0.35}
            strokeWidth="2"
            strokeLinecap="round"
            transform="rotate(135 100 100)"
            strokeDasharray={`${drawn ? ARC : 0} ${C}`}
            style={{ transition: `stroke-dasharray var(--dur-story) var(--ease-out)` }}
          />
          {/* the score */}
          {value !== null && (
            <>
              <circle
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={color}
                strokeWidth="7"
                strokeLinecap="round"
                transform="rotate(135 100 100)"
                strokeDasharray={`${(shown / 100) * ARC} ${C}`}
              />
              <circle cx={tip.x} cy={tip.y} r="7" fill="var(--canvas)" stroke={color} strokeWidth="3" />
            </>
          )}
          {/* solder nodes at 40 / 70 / 100 */}
          {[0.4, 0.7, 1].map((f) => {
            const p = pointAt(f);
            return (
              <circle
                key={f}
                cx={p.x}
                cy={p.y}
                r="5.5"
                fill="var(--verdigris)"
                stroke="var(--canvas)"
                strokeWidth="2.5"
                style={{ opacity: drawn ? 1 : 0, transition: `opacity var(--dur-slow) var(--ease-out) ${f * 700}ms` }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center pt-[6%]">
          <div className="text-center">
            <div
              key={pulseKey}
              className={cn("font-display font-bold leading-none tracking-display text-content", pulseKey > 0 && "pulse-once")}
              style={{
                fontSize: size * 0.26,
                opacity: drawn ? 1 : 0,
                transition: "opacity var(--dur-slow) var(--ease-out) 600ms",
              }}
            >
              {value === null ? "?" : shown}
              <span className="font-sans text-content-muted" style={{ fontSize: size * 0.085 }}>
                /100
              </span>
            </div>
            {showBand && band && (
              <div className="mt-2 font-mono text-xs uppercase tracking-caps" style={{ color: BAND_TEXT[band.tone] }}>
                {band.label}
              </div>
            )}
          </div>
        </div>
      </div>
      {label && <figcaption className="-mt-2 text-center font-mono text-xs uppercase tracking-caps text-content-muted">{label}</figcaption>}
    </figure>
  );
}
