"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Step {
  n: string;
  title: string;
  body: string;
  tags: string;
  cta: string;
  href: string;
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Install SDK",
    body: "Deploy the Agentronics SDK via npm or a script tag. It automatically detects your site structure.",
    tags: "SDK · INSTALL · AUTO-DETECT",
    cta: "Start your project",
    href: "/book",
  },
  {
    n: "02",
    title: "Define endpoints",
    body: "Map your critical UI components and data to the WebMCP protocol schema in the Agentronics dashboard.",
    tags: "SCHEMA · ENDPOINTS · MAPPING",
    cta: "Start your project",
    href: "/book",
  },
  {
    n: "03",
    title: "Govern access",
    body: "Set policies — strict, balanced, or audit-only. Approve tools, rate-limit, and block unverified agents.",
    tags: "POLICY · RATE-LIMIT · VERIFY",
    cta: "Start your project",
    href: "/book",
  },
  {
    n: "04",
    title: "Agent access",
    body: "External AI agents securely query your site through the standardized WebMCP interface — every call logged.",
    tags: "WEBMCP · QUERY · LOGGING",
    cta: "Start your project",
    href: "/book",
  },
  {
    n: "05",
    title: "Observe & optimize",
    body: "The dashboard turns raw WebMCP traffic into actionable insight; monitor sessions and tune in real time.",
    tags: "INSIGHTS · MONITOR · OPTIMIZE",
    cta: "View the dashboard",
    href: "/book",
  },
];

export function HowWebMCP() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0); // 0-based
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setActive((next + STEPS.length) % STEPS.length);
  }, []);

  // auto-advance every 5s (pause on hover/focus or reduced motion)
  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 5000);
    return () => clearInterval(id);
  }, [reduce, paused]);

  const step = STEPS[active];

  return (
    <section
      data-screen-label="how-webmcp"
      className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mx-auto max-w-content text-center">
        <Eyebrow>Process</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-display text-content md:text-4xl">
          How WebMCP works
        </h2>

        {/* arc stage */}
        <div className="relative mt-16">
          {/* the arc — hairline + faint fill, decorative; hidden on small screens */}
          <div
            aria-hidden
            className="absolute left-1/2 top-8 hidden h-[480px] w-[min(1000px,92%)] -translate-x-1/2 border-t border-x border-border bg-surface-raised/60 sm:block"
            style={{ borderRadius: "9999px 9999px 0 0" }}
          />
          {/* progress arc sweep */}
          {!reduce && (
            <svg
              aria-hidden
              viewBox="0 0 1000 500"
              className="absolute left-1/2 top-8 hidden h-[480px] w-[min(1000px,92%)] -translate-x-1/2 sm:block"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 4 500 A 496 496 0 0 1 996 500"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ pathLength: (active + 1) / STEPS.length }}
                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                style={{ opacity: 0.5 }}
              />
            </svg>
          )}

          {/* side prev/next diamond chips (desktop) */}
          <button
            onClick={() => go(active - 1)}
            aria-label="Previous step"
            className="absolute left-0 top-40 hidden h-12 w-12 rotate-45 place-items-center rounded-lg border border-border bg-surface text-content transition-colors hover:border-brand focus-ring md:grid lg:left-8"
          >
            <span className="-rotate-45 font-mono text-base">
              {STEPS[(active - 1 + STEPS.length) % STEPS.length].n}
            </span>
          </button>
          <button
            onClick={() => go(active + 1)}
            aria-label="Next step"
            className="absolute right-0 top-40 hidden h-12 w-12 rotate-45 place-items-center rounded-lg border border-border bg-surface text-content transition-colors hover:border-brand focus-ring md:grid lg:right-8"
          >
            <span className="-rotate-45 font-mono text-base">
              {STEPS[(active + 1) % STEPS.length].n}
            </span>
          </button>

          {/* apex step chip + content */}
          <div className="relative z-10 flex flex-col items-center px-2 pt-2">
            <p className="font-mono text-xs uppercase tracking-caps text-content-muted">Step</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.n}
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
                className="flex flex-col items-center"
              >
                <span className="mt-2 grid h-12 w-12 place-items-center rounded-lg bg-accent font-mono text-lg font-bold text-accent-content">
                  {step.n}
                </span>
                <h3 className="mt-8 text-2xl font-bold tracking-title text-content">{step.title}</h3>
                <p className="mt-3 max-w-md text-pretty text-base text-content-secondary">
                  {step.body}
                </p>
                <p className="mt-4 font-mono text-xs uppercase tracking-caps text-content-muted">
                  {step.tags}
                </p>
                <ButtonLink href={step.href} variant="accent" size="md" className="mt-6">
                  {step.cta}
                </ButtonLink>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* mobile prev/next */}
        <div className="mt-8 flex items-center justify-center gap-4 md:hidden">
          <button
            onClick={() => go(active - 1)}
            aria-label="Previous step"
            className="grid h-10 w-10 place-items-center rounded-md border border-border-strong text-content focus-ring"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(active + 1)}
            aria-label="Next step"
            className="grid h-10 w-10 place-items-center rounded-md border border-border-strong text-content focus-ring"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* counter + dot pager */}
        <p className="mt-10 font-mono text-sm text-content-muted">
          {step.n} / 05
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.n}
              aria-label={`Go to step ${s.n}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-pill transition-all",
                i === active ? "w-6 bg-accent" : "w-1.5 bg-border-strong hover:bg-content-muted",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
