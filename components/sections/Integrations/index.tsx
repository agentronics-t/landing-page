"use client";

import { EyebrowPill } from "@/components/layout/Eyebrow";
import { cn } from "@/lib/cn";

/**
 * Spec 08 — Seamless integrations. Two marquee rows scrolling opposite
 * directions with edge-fade masks. Tiles are on-brand geometric PLACEHOLDERS
 * (never fake a real company's logo) — swap for real assets when provided.
 */
const TINTS = ["var(--brand)", "var(--accent)", "var(--neutral-500)", "var(--info)"];

// abstract placeholder glyphs (TODO: real integration logos in /public)
function Glyph({ i }: { i: number }) {
  const color = TINTS[i % TINTS.length];
  const shape = i % 5;
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden>
      {shape === 0 && <circle cx={20} cy={20} r={14} fill="none" stroke={color} strokeWidth={3} />}
      {shape === 1 && <rect x={8} y={8} width={24} height={24} rx={6} fill={color} opacity={0.85} />}
      {shape === 2 && <path d="M20 6 L34 32 L6 32 Z" fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />}
      {shape === 3 && (
        <g fill={color}>
          <circle cx={13} cy={13} r={5} />
          <circle cx={27} cy={13} r={5} />
          <circle cx={20} cy={27} r={5} />
        </g>
      )}
      {shape === 4 && (
        <g stroke={color} strokeWidth={3} fill="none">
          <path d="M10 20 H30" />
          <path d="M20 10 V30" />
          <circle cx={20} cy={20} r={13} />
        </g>
      )}
    </svg>
  );
}

const ROW = Array.from({ length: 12 }, (_, i) => i);

function Tile({ i }: { i: number }) {
  return (
    <div className="grid h-[120px] w-[120px] shrink-0 place-items-center rounded-xl border border-border bg-surface-raised transition-colors duration-[var(--dur-fast)] hover:border-brand">
      <Glyph i={i} />
    </div>
  );
}

function Marquee({ items, direction }: { items: number[]; direction: "left" | "right" }) {
  // duplicate the list for a seamless loop
  const doubled = [...items, ...items];
  return (
    <div
      className="group overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div
        className={cn(
          "marquee-track gap-4 py-2",
          direction === "left" ? "marquee-left" : "marquee-right",
          "group-hover:[animation-play-state:paused]",
        )}
      >
        {doubled.map((n, idx) => (
          <Tile key={`${n}-${idx}`} i={n} />
        ))}
      </div>
    </div>
  );
}

export function Integrations() {
  return (
    <section
      data-screen-label="integrations"
      className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-content text-center">
        <div className="flex justify-center">
          <EyebrowPill>Integrations</EyebrowPill>
        </div>
        <h2 className="mt-5 text-3xl font-bold tracking-display text-content md:text-4xl">
          Seamless integrations
          <br />
          with your tools
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-pretty text-lg text-content-secondary">
          Connect Agentronics with the platforms and agents you already use to build one governed,
          observable ecosystem.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-content">
        <Marquee items={ROW} direction="left" />
      </div>

      <p className="mt-10 text-center font-mono text-xs uppercase tracking-caps text-content-muted">
        Every connected tool streams into one governed dashboard.
      </p>
    </section>
  );
}
