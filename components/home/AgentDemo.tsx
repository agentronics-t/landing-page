"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { useReducedMotion } from "@/lib/useInView";
import { cn } from "@/lib/cn";

/**
 * Spec v3 §3.4 — "Watch an AI agent try to buy from a website." PCB Black.
 * A DOM/SVG storyboard (real text, agent-readable): Act 1 the agent fails on
 * a site that isn't agent-ready; Agent Nick's PR lands; Act 2 it succeeds in
 * 3 steps and asks the person before signing up. Autoplays at 50% in view,
 * pauses off-screen, with Pause / Replay / Skip (WCAG 2.2.2). Reduced motion
 * gets two static panels; screen readers get the transcript.
 * acme-saas.com and its prices are a made-up example site.
 */

const END = 16000;

type Line = { at: number; text: string; ok?: boolean };
const LOG_1: Line[] = [
  { at: 0, text: "> task: find Pro price, sign up" },
  { at: 1500, text: "prices not in HTML" },
  { at: 3500, text: 'button "" has no label. Buy or Close?' },
  { at: 5000, text: "4 fields, no labels. guessing…" },
  { at: 6500, text: "→ can't find pricing. trying another site." },
];
const LOG_2: Line[] = [
  { at: 9000, text: "> task: find Pro price, sign up" },
  { at: 9400, text: "found tools: get_pricing, start_signup" },
  { at: 10000, text: "✓ Pro = $49/mo", ok: true },
  { at: 11500, text: "✓ form filled", ok: true },
  { at: 13000, text: "waiting for your OK…" },
  { at: 14500, text: "✓ done in 3 steps", ok: true },
];

// agent cursor path, in % of the mock window
const CURSOR: { at: number; x: number; y: number }[] = [
  { at: 0, x: 88, y: 12 },
  { at: 1500, x: 88, y: 12 },
  { at: 2200, x: 22, y: 34 },
  { at: 2900, x: 50, y: 34 },
  { at: 3500, x: 76, y: 34 },
  { at: 4300, x: 86, y: 56 },
  { at: 5000, x: 86, y: 56 },
  { at: 5800, x: 40, y: 78 },
  { at: 6500, x: 40, y: 78 },
  { at: 7500, x: 112, y: 70 },
  { at: 9000, x: 112, y: 12 },
  { at: 9400, x: 88, y: 12 },
  { at: 10000, x: 50, y: 34 },
  { at: 11500, x: 40, y: 78 },
  { at: 13000, x: 56, y: 52 },
  { at: 14200, x: 70, y: 58 },
  { at: END, x: 70, y: 58 },
];

const FIELDS = [
  { label: "Name", value: "Sam Rivera" },
  { label: "Email", value: "sam@example.com" },
  { label: "Company", value: "Rivera & Co" },
  { label: "Plan", value: "Pro" },
];
const PLANS = [
  { name: "Starter", price: "$19/mo" },
  { name: "Pro", price: "$49/mo" },
  { name: "Team", price: "$99/mo" },
];

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const smooth = (p: number) => p * p * (3 - 2 * p);

function cursorAt(t: number) {
  const i = CURSOR.findIndex((k) => k.at > t);
  if (i <= 0) return CURSOR[i === 0 ? 0 : CURSOR.length - 1];
  const a = CURSOR[i - 1];
  const b = CURSOR[i];
  const p = smooth((t - a.at) / (b.at - a.at));
  return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) };
}

export function AgentDemo() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const tRef = useRef(0);
  tRef.current = t;

  // autoplay at 50% in view; pause when off-screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !playing || !visible || t >= END) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const next = Math.min(END, tRef.current + (now - last));
      last = now;
      setT(next);
      if (next < END) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, playing, visible, t >= END]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="tone-dark relative overflow-hidden px-4 py-20 sm:px-[clamp(20px,5vw,48px)] md:py-28" aria-labelledby="demo-title">
      <div className="mx-auto max-w-[1180px]">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-caps text-verdigris">Same site · same request</p>
          <h2 id="demo-title" className="mx-auto mt-4 max-w-[760px] font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
            Watch an AI agent try to buy from a website.
          </h2>
        </div>

        <Transcript />

        {reduce ? (
          <StaticDemo />
        ) : (
          <div ref={wrapRef} className="mt-12" aria-hidden>
            <Prompt />
            <div className="relative mt-5 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
              <MockWindow t={t} />
              <ThoughtLog t={t} />
              {t >= END && <EndCard />}
            </div>
          </div>
        )}

        {!reduce && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {t < END && (
              <Control onClick={() => setPlaying((p) => !p)} label={playing ? "Pause the demo" : "Play the demo"}>
                {playing ? <Pause size={15} /> : <Play size={15} />}
                {playing ? "Pause" : "Play"}
              </Control>
            )}
            <Control
              onClick={() => {
                setT(0);
                setPlaying(true);
              }}
              label="Replay the demo"
            >
              <RotateCcw size={15} />
              Replay
            </Control>
            {t < END && (
              <Control onClick={() => setT(END)} label="Skip to the result">
                <SkipForward size={15} />
                Skip to result
              </Control>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Control({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 items-center gap-2 rounded-pill border border-border px-4 text-sm text-content-secondary transition-colors hover:border-border-strong hover:text-content focus-ring"
    >
      {children}
    </button>
  );
}

function Prompt() {
  return (
    <div className="mx-auto flex max-w-fit items-center gap-3 rounded-pill border border-border bg-surface px-5 py-3">
      <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-copper font-mono text-[10px] font-medium">AI</span>
      <span className="text-md text-content">&ldquo;Find the price of the Pro plan and sign me up.&rdquo;</span>
    </div>
  );
}

function MockWindow({ t }: { t: number }) {
  const act2 = t >= 8600;
  const sweep = t >= 8000 && t < 9000 ? (t - 8000) / 600 : null;
  const dim = t >= 6500 && t < 8000;
  const cursor = cursorAt(t);
  const shaking = t >= 6500 && t < 6800;
  const filled = (i: number) => t >= 11500 + i * 120 + 200;
  const modal = t >= 13000 && t < END;
  const allowed = t >= 14500;

  return (
    <div className="relative">
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-xl border border-seam bg-bone text-pcb transition-[filter,opacity] duration-[var(--dur-slow)]"
        style={{ filter: act2 ? "none" : "grayscale(1)", opacity: dim ? 0.5 : 1 }}
      >
        {/* browser chrome */}
        <div className="flex h-[9%] items-center gap-2 border-b border-seam bg-bone-200 px-3">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2 w-2 rounded-full bg-seam" />
            ))}
          </span>
          <span className="ml-2 rounded-md bg-bone px-3 py-0.5 font-mono text-[11px] text-fog">acme-saas.com/pricing</span>
        </div>

        {/* pricing */}
        <div className="absolute left-[5%] right-[5%] top-[16%] grid grid-cols-3 gap-[3%]">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={cn("rounded-lg border bg-white/60 p-[6%]", act2 && p.name === "Pro" && t >= 10000 ? "border-verdigris-deep" : "border-seam")}
            >
              <div className="text-[clamp(9px,1.3vw,14px)] font-semibold">{p.name}</div>
              {act2 ? (
                <div className={cn("mt-1 font-display text-[clamp(11px,1.8vw,20px)] font-bold", t >= 9400 ? "opacity-100" : "opacity-0")}>{p.price}</div>
              ) : (
                <div className="mt-2 h-[clamp(8px,1.2vw,14px)] w-3/4 rounded bg-seam" />
              )}
            </div>
          ))}
        </div>

        {/* the unlabeled button */}
        <div className="absolute right-[7%] top-[50%] flex items-center gap-2">
          {!act2 && t >= 3500 && t < 6500 && <Badge>?</Badge>}
          <span className="grid h-[clamp(20px,2.6vw,30px)] w-[clamp(28px,3.6vw,44px)] place-items-center rounded-md bg-pcb text-bone">
            {act2 ? <span className="px-1 text-[clamp(8px,1vw,12px)] font-semibold">Sign up</span> : <ArrowRight size={14} />}
          </span>
        </div>

        {/* the form */}
        <div className="absolute bottom-[7%] left-[5%] grid w-[62%] grid-cols-2 gap-x-[4%] gap-y-[6%]">
          {FIELDS.map((f, i) => (
            <div key={f.label} className="relative">
              {act2 && <div className="mb-0.5 text-[clamp(8px,1vw,11px)] font-medium text-fog">{f.label}</div>}
              <div
                className={cn(
                  "flex h-[clamp(16px,2.4vw,28px)] items-center rounded-md border bg-white px-2 text-[clamp(8px,1.1vw,12px)]",
                  act2 && filled(i) ? "border-verdigris-deep" : "border-seam",
                )}
              >
                {act2 && filled(i) && f.value}
              </div>
              {!act2 && t >= 5000 && t < 6500 && (
                <span className="absolute -right-2 -top-2">
                  <Badge>?</Badge>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* consent modal */}
        {modal && (
          <div className="absolute inset-0 grid place-items-center bg-[color-mix(in_srgb,var(--pcb-black)_30%,transparent)]">
            <div className="w-[62%] rounded-xl border border-seam bg-bone p-[3.5%] shadow-raise">
              {allowed ? (
                <div className="flex items-center gap-2 text-[clamp(10px,1.4vw,15px)] font-semibold">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-verdigris-deep text-bone">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  Signed up for Pro
                </div>
              ) : (
                <>
                  <p className="text-[clamp(10px,1.35vw,15px)] font-medium">Agent wants to sign you up for Pro ($49/mo). Allow?</p>
                  <div className="mt-[4%] flex justify-end gap-2">
                    <span className="rounded-md border border-seam px-3 py-1 text-[clamp(9px,1.1vw,12px)]">Not now</span>
                    <span className="rounded-md bg-copper px-3 py-1 text-[clamp(9px,1.1vw,12px)] font-semibold text-pcb">Allow</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* the agent cursor */}
        <div
          className={cn("absolute z-10 -translate-x-1/2 -translate-y-1/2", shaking && "shake")}
          style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border-[3px] border-copper bg-[color-mix(in_srgb,var(--bone)_70%,transparent)]" />
          <span className="absolute left-6 top-5 rounded bg-copper px-1 font-mono text-[10px] font-medium text-pcb">AI</span>
        </div>

        {/* copper sweep: Agent Nick's fix lands */}
        {sweep !== null && <div className="absolute inset-y-0 z-20 w-[3px] bg-copper" style={{ left: `${Math.min(1, sweep) * 100}%` }} />}
      </div>

      {/* caption + PR badge */}
      {t >= 7500 && t < 8600 && (
        <p className="absolute left-1/2 top-1/2 z-20 w-max max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-pcb px-5 py-3 text-center font-display text-[clamp(16px,2.2vw,24px)] font-semibold text-bone shadow-raise">
          The agent left. You&apos;ll never know it was here.
        </p>
      )}
      {t >= 8300 && (
        <span
          className="absolute -top-3 left-4 z-20 rounded-pill border border-verdigris bg-pcb px-3 py-1 font-mono text-xs text-verdigris"
          style={{ transform: t < 8550 ? "scale(1.25)" : "scale(1)", transition: "transform var(--dur-base) var(--ease-out)" }}
        >
          Agent Nick · PR #42 merged
        </span>
      )}

      {/* tool chips */}
      <div className="mt-3 flex min-h-[34px] flex-wrap gap-2 font-mono text-xs">
        {t >= 10000 && <Chip>get_pricing() → Pro $49/mo</Chip>}
        {t >= 11500 && <Chip>start_signup({`{ plan: "pro" }`})</Chip>}
        {t >= 13000 && <Chip>confirm()</Chip>}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="grid h-5 w-5 place-items-center rounded-full bg-fog font-mono text-[11px] font-bold text-bone">{children}</span>;
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-pill border bg-brand-soft px-3 py-1.5 text-verdigris">{children}</span>;
}

function ThoughtLog({ t }: { t: number }) {
  const act2 = t >= 8600;
  const lines = (act2 ? LOG_2 : LOG_1).filter((l) => t >= l.at);
  return (
    <div className="flex min-h-[220px] flex-col rounded-xl border border-border bg-code-bg p-5 font-mono text-[13px] leading-relaxed">
      <div className="flex items-center gap-2 text-xs uppercase tracking-caps text-content-muted">
        <span className={cn("h-2 w-2 rounded-full", act2 ? "bg-verdigris" : "bg-fog")} />
        {act2 ? "With Agentronics" : "Today"} · agent thoughts
      </div>
      <ul className="mt-4 space-y-2">
        {lines.map((l) => {
          const chars = Math.floor((t - l.at) / 25); // ~40 chars/s
          return (
            <li key={l.at} className={l.ok ? "text-verdigris" : "text-content-secondary"}>
              {l.text.slice(0, chars)}
              {chars < l.text.length && <span className="caret" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EndCard() {
  return (
    <div className="absolute inset-0 z-30 grid place-items-center rounded-xl bg-[color-mix(in_srgb,var(--pcb-black)_88%,transparent)] p-6 backdrop-blur-sm">
      <div className="w-full max-w-[680px] text-center">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="font-mono text-xs uppercase tracking-caps text-content-muted">Today</p>
            <p className="mt-2 font-display text-xl font-semibold">The agent gave up.</p>
          </div>
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--verdigris)_60%,transparent)] bg-surface p-5">
            <p className="font-mono text-xs uppercase tracking-caps text-verdigris">With Agentronics</p>
            <p className="mt-2 font-display text-xl font-semibold">Done in 3 steps.</p>
          </div>
        </div>
        <ButtonLink href="/#scan" size="lg" className="mt-6">
          Get my score
          <ArrowRight size={18} aria-hidden />
        </ButtonLink>
      </div>
    </div>
  );
}

const BEATS_1 = [
  "The agent gets the task: find the Pro price and sign up.",
  "It scans the pricing area. The prices are drawn by JavaScript, so it sees empty bars.",
  'It finds a button with no label. Is it "Buy" or "Close"?',
  "The sign-up form has 4 fields and no labels, so it has to guess.",
  "It gives up and leaves for another site. The site owner never knows.",
];
const BEATS_2 = [
  "Agent Nick's pull request is merged. The agent gets the same task.",
  "It finds the site's tools: get_pricing and start_signup. Prices are real text.",
  "get_pricing() returns Pro at $49/mo.",
  "start_signup fills the 4 labelled fields.",
  "Before signing up, it asks the person: \"Sign you up for Pro ($49/mo)? Allow?\"",
  "The person allows it. Done in 3 steps.",
];

/** Hidden ordered transcript for screen readers (the visual demo is aria-hidden). */
function Transcript() {
  return (
    <div className="sr-only">
      <h3>Demo transcript</h3>
      <p>Today, without Agentronics:</p>
      <ol>
        {BEATS_1.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ol>
      <p>With Agentronics:</p>
      <ol>
        {BEATS_2.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ol>
    </div>
  );
}

/** Reduced motion: two static panels with numbered beats; no autoplay. */
function StaticDemo() {
  return (
    <div className="mt-12" aria-hidden>
      <Prompt />
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {[
          { title: "Today: the agent gave up.", beats: BEATS_1, tone: "text-content-muted" },
          { title: "With Agentronics: done in 3 steps.", beats: BEATS_2, tone: "text-verdigris" },
        ].map((p) => (
          <div key={p.title} className="rounded-xl border border-border bg-surface p-6">
            <p className={cn("font-display text-xl font-semibold", p.tone)}>{p.title}</p>
            <ol className="mt-4 space-y-2 text-base text-content-secondary">
              {p.beats.map((b, i) => (
                <li key={b} className="flex gap-3">
                  <span className="font-mono text-xs text-content-muted">{i + 1}</span>
                  {b}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <ButtonLink href="/#scan" size="lg">
          Get my score
          <ArrowRight size={18} aria-hidden />
        </ButtonLink>
      </div>
    </div>
  );
}
