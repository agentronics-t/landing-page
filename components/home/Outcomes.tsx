"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { useInView } from "@/lib/useInView";
import { cn } from "@/lib/cn";

/**
 * Spec v3 §3.7 — Outcomes, Bone. Benefit-first headings and a different
 * micro-visual per card (von Restorff), each playing on entering view and
 * replaying on hover/focus. Cards are offset 24px to break sameness.
 */
export function Outcomes() {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <Section>
      <div className="max-w-[720px]">
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
          What changes
        </p>
        <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
          When agents can use your site, they pick you.
        </h2>
        <p className="mt-4 text-lg text-content-secondary">Three things change the day you merge Agent Nick&apos;s fixes.</p>
      </div>
      <div ref={ref} className="mt-12 grid gap-6 md:grid-cols-3 md:items-start">
        <Card i={0} on={inView} title="You get recommended." body="When someone asks an assistant for the best option, it can read your real prices and details, and doesn't guess or skip you.">
          {(play) => <ChatVisual play={play} />}
        </Card>
        <Card i={1} on={inView} title="You get the sale." body="Agents book, buy and sign up in a few steps instead of clicking around and giving up halfway.">
          {(play) => <ChecksVisual play={play} />}
        </Card>
        <Card i={2} on={inView} title="You stay in control." body="See which agents visit and what they do. Choose what each may do. Anything important asks the person first.">
          {(play) => <TogglesVisual play={play} />}
        </Card>
      </div>
    </Section>
  );
}

function Card({ i, on, title, body, children }: { i: number; on: boolean; title: string; body: string; children: (play: number) => React.ReactNode }) {
  const [replay, setReplay] = useState(0);
  const play = on ? replay + 1 : 0;
  return (
    <div
      tabIndex={0}
      onMouseEnter={() => on && setReplay((n) => n + 1)}
      onFocus={() => on && setReplay((n) => n + 1)}
      className={cn(
        "rounded-[16px] border border-seam bg-bone-200 p-7 outline-none transition-[transform,border-color,opacity] duration-[var(--dur-slow)] ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--copper)_40%,transparent)] focus-visible:border-[color-mix(in_srgb,var(--copper)_40%,transparent)]",
        i === 1 && "md:mt-6",
        i === 2 && "md:mt-12",
      )}
      style={{ opacity: on ? 1 : 0, transform: on ? undefined : "translateY(16px)", transitionDelay: on ? `${i * 100}ms` : undefined }}
    >
      <div className="flex h-[92px] items-center rounded-lg border border-seam bg-bone px-4" aria-hidden>
        {children(play)}
      </div>
      <h3 className="mt-6 font-display text-[22px] font-semibold text-content">{title}</h3>
      <p className="mt-2 text-base text-content-secondary">{body}</p>
    </div>
  );
}

/** "Top pick: YourBrand" — the name types in. */
function ChatVisual({ play }: { play: number }) {
  const name = "YourBrand";
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!play) return;
    setN(0);
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setN(k);
      if (k >= name.length) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [play]);
  return (
    <div className="rounded-xl rounded-bl-sm bg-pcb px-4 py-2.5 text-sm text-bone">
      Top pick: <span className="font-semibold text-verdigris">{name.slice(0, n)}</span>
      {n < name.length && <span className="caret" />}
    </div>
  );
}

/** Three checkmarks drawing along a trace. */
function ChecksVisual({ play: replay }: { play: number }) {
  // reset, then start on the next frames so the transitions run each replay
  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!replay) return;
    setPlay(false);
    let b = 0;
    const a = requestAnimationFrame(() => (b = requestAnimationFrame(() => setPlay(true))));
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, [replay]);
  return (
    <div className="flex w-full items-center">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-1 items-center last:flex-none">
          <span
            className="grid h-8 w-8 place-items-center rounded-full bg-verdigris-deep text-bone"
            style={{ opacity: play ? 1 : 0, transform: play ? "scale(1)" : "scale(0.6)", transition: `opacity var(--dur-base) var(--ease-out) ${i * 250}ms, transform var(--dur-base) var(--ease-out) ${i * 250}ms` }}
          >
            <Check size={15} strokeWidth={3} />
          </span>
          {i < 2 && (
            <span
              className="mx-2 h-px flex-1 origin-left bg-copper"
              style={{ transform: play ? "scaleX(1)" : "scaleX(0)", transition: `transform var(--dur-slow) var(--ease-out) ${i * 250 + 120}ms` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/** Allow / Ask first / Deny — "checkout" flips from Allow to Ask first. */
function TogglesVisual({ play }: { play: number }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    if (!play) return;
    setFlipped(false);
    const id = setTimeout(() => setFlipped(true), 500);
    return () => clearTimeout(id);
  }, [play]);
  const options = ["Allow", "Ask first", "Deny"];
  const active = flipped ? 1 : 0;
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="font-mono text-xs text-fog">checkout</span>
      <div className="flex rounded-pill border border-seam bg-bone-200 p-0.5 text-xs">
        {options.map((o, i) => (
          <span
            key={o}
            className={cn(
              "rounded-pill px-2.5 py-1 transition-colors duration-[var(--dur-base)]",
              i === active ? "bg-pcb font-semibold text-bone" : "text-fog",
            )}
          >
            {o}
          </span>
        ))}
      </div>
    </div>
  );
}
