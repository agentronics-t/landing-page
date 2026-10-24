"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/layout/Section";
import { useInView, useReducedMotion } from "@/lib/useInView";

/**
 * Spec v3 §3.3 — Stakes, Bone. One motion onset: three agent packets head for
 * three sites; two land (verdigris), the one for your-site.com bounces (rust)
 * and reroutes to a competitor. Then: "This is the sale you never see."
 * Stats are Adobe Analytics, 2025 holidays — AI-referred visits, not purchases.
 */

type Pt = [number, number];
const ORIGIN: Pt = [70, 120];
const SITES: { label: string; at: Pt }[] = [
  { label: "a-store.com", at: [430, 45] },
  { label: "your-site.com", at: [430, 120] },
  { label: "b-store.com", at: [430, 195] },
];
const COMPETITOR: Pt = [660, 120];
const BOUNCE: Pt = [330, 120];
const REROUTE: Pt[] = [BOUNCE, [360, 160], [620, 160], COMPETITOR];
const END = 2100;

function along(points: Pt[], p: number): Pt {
  const segs = points.slice(1).map((b, i) => {
    const a = points[i];
    return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
  });
  const total = segs.reduce((s, x) => s + x.len, 0);
  let d = Math.max(0, Math.min(1, p)) * total;
  for (const s of segs) {
    if (d <= s.len) return [s.a[0] + ((s.b[0] - s.a[0]) * d) / s.len, s.a[1] + ((s.b[1] - s.a[1]) * d) / s.len];
    d -= s.len;
  }
  return points[points.length - 1];
}
const ease = (x: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

export function Stakes() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) return setT(END);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const el = now - t0;
      setT(Math.min(END, el));
      if (el < END) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  const arrived = t >= 1200;
  const bounced = t >= 1200 && t < 1500;
  const rerouted = t >= END;
  const packet = (i: number): Pt => {
    if (i !== 1 || t < 1200) return along([ORIGIN, SITES[i].at], ease(t / 1200));
    if (t < 1500) return along([SITES[1].at, BOUNCE], (t - 1200) / 300);
    return along(REROUTE, ease((t - 1500) / 600));
  };

  return (
    <Section innerClassName="max-w-[760px] text-center">
      <h2 className="font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
        Your next customer might not be a person. It&apos;s their AI agent.
      </h2>
      <p className="mx-auto mt-6 max-w-[60ch] text-lg text-content-secondary">
        It reads your prices, compares you with others, then books or buys. If it can&apos;t read your page or press your
        buttons, it leaves, and you never see it happen.
      </p>

      <div ref={ref} className="mx-auto mt-10 max-w-[720px]">
        <svg viewBox="0 0 720 240" className="h-auto w-full" role="img" aria-labelledby="stakes-title">
          <title id="stakes-title">
            An AI agent sends requests to three sites. Two load. your-site.com fails, so the agent goes to a competitor.
          </title>
          {SITES.map((s) => (
            <line key={s.label} x1={ORIGIN[0]} y1={ORIGIN[1]} x2={s.at[0]} y2={s.at[1]} stroke="var(--seam)" strokeWidth="2" />
          ))}
          <polyline points={REROUTE.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--seam)" strokeWidth="2" strokeDasharray="4 6" />

          {/* origin */}
          <circle cx={ORIGIN[0]} cy={ORIGIN[1]} r="16" fill="var(--pcb-black)" />
          <text x={ORIGIN[0]} y={ORIGIN[1] + 4} textAnchor="middle" className="fill-[var(--bone)] font-mono text-[11px] font-medium">
            AI
          </text>
          <text x={ORIGIN[0]} y={ORIGIN[1] + 40} textAnchor="middle" className="fill-[var(--fog)] font-mono text-[14px]">
            agent
          </text>

          {/* sites */}
          {SITES.map((s, i) => {
            const mine = i === 1;
            const fill = !arrived ? "var(--bone)" : mine ? "var(--rust)" : "var(--verdigris)";
            return (
              <g key={s.label}>
                <circle cx={s.at[0]} cy={s.at[1]} r={mine && bounced ? 13 : 10} fill={fill} stroke="var(--pcb-black)" strokeWidth="2" style={{ transition: "r var(--dur-fast)" }} />
                <text x={s.at[0] + 20} y={s.at[1] + 5} className={mine ? "fill-[var(--pcb-black)] font-mono text-[15px] font-semibold" : "fill-[var(--fog)] font-mono text-[15px]"}>
                  {s.label}
                </text>
              </g>
            );
          })}
          <circle cx={COMPETITOR[0]} cy={COMPETITOR[1]} r="10" fill={rerouted ? "var(--verdigris)" : "var(--bone)"} stroke="var(--pcb-black)" strokeWidth="2" />
          <text x={COMPETITOR[0]} y={COMPETITOR[1] - 20} textAnchor="middle" className="fill-[var(--fog)] font-mono text-[15px]">
            competitor
          </text>

          {/* packets */}
          {t > 0 &&
            [0, 1, 2].map((i) => {
              const [x, y] = packet(i);
              const done = i === 1 ? rerouted : arrived;
              return !done && <circle key={i} cx={x} cy={y} r="5" fill="var(--copper)" />;
            })}
        </svg>
        <p
          className="mt-4 font-display text-xl font-semibold text-content"
          style={{ opacity: rerouted ? 1 : 0, transition: "opacity var(--dur-slow) var(--ease-out)" }}
        >
          This is the sale you never see.
        </p>
      </div>

      <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
        <Stat value="+693%" text="AI-referred visits to US retail sites, 2025 holidays vs 2024 (Adobe Analytics)" />
        <Stat value="31%" text="better conversion from those visits (Adobe Analytics)" />
      </div>
      <p className="mt-4 text-[13px] text-content-muted">
        Visits that came from AI assistants such as ChatGPT, Gemini and Perplexity.{" "}
        <a
          href="https://business.adobe.com/blog/ai-driven-traffic-surges-across-industries"
          className="underline underline-offset-4 hover:text-content"
          rel="noopener"
          target="_blank"
        >
          Source
        </a>
      </p>
    </Section>
  );
}

function Stat({ value, text }: { value: string; text: string }) {
  return (
    <div className="flex items-baseline gap-4 rounded-xl border border-border bg-bone-200 px-5 py-4">
      <span className="font-display text-[34px] font-bold leading-none tracking-display text-content">{value}</span>
      <span className="text-sm text-content-secondary">{text}</span>
    </div>
  );
}
