"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { Logomark } from "@/components/ui/Logo";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";

/**
 * "Every agent request, verified" — three steps on the left, and on the right
 * a live sign-in feed: agent requests arrive and resolve to verified /
 * unverified / blocked with the method and reason, exactly as the console's
 * auth logs show them. Illustrative data; reduced motion shows a static feed.
 */

type Result = "verified" | "unverified" | "blocked";

interface FeedItem {
  agent: string;
  detail: string;
  method: string;
  result: Result;
  reason: string;
}

const FEED: FeedItem[] = [
  { agent: "ChatGPT agent", detail: "https://chatgpt.com", method: "Web Bot Auth", result: "verified", reason: "ed25519 signature" },
  { agent: "Googlebot", detail: "crawl-66-249-66-1.googlebot.com", method: "Verified crawler", result: "verified", reason: "reverse DNS confirmed" },
  { agent: "Googlebot", detail: "203.0.113.9", method: "Verified crawler", result: "blocked", reason: "rdns_mismatch — spoofed" },
  { agent: "Booking agent", detail: "key:booking-agent", method: "API key", result: "verified", reason: "agk_7URP… active" },
  { agent: "scraper-bot/2.1", detail: "no credential", method: "—", result: "blocked", reason: "unverified agent" },
  { agent: "research-agent", detail: "oauth2:research-agent", method: "OAuth2", result: "verified", reason: "scope agent:browse" },
  { agent: "GPTBot", detail: "52.230.152.4", method: "Verified crawler", result: "unverified", reason: "no rDNS method — allowed" },
  { agent: "Bingbot", detail: "msnbot-157-55-39-1.search.msn.com", method: "Verified crawler", result: "verified", reason: "reverse DNS confirmed" },
];

const STEPS = [
  { n: "1", title: "The agent presents proof", body: "A signed request, an API key, an OAuth2 token — or just a user agent that claims to be Googlebot." },
  { n: "2", title: "Agentronics verifies it", body: "Signatures against the signer's published keys, tokens against your issuer, crawler claims against reverse DNS." },
  { n: "3", title: "You decide", body: "Verified agents get in with their identity attached. Unverified ones are allowed and logged, or blocked — your rule." },
];

const RESULT_STYLE: Record<Result, { label: string; fg: string; bg: string }> = {
  verified: { label: "Verified", fg: "var(--success)", bg: "var(--success-bg)" },
  unverified: { label: "Unverified", fg: "var(--warning)", bg: "var(--warning-bg)" },
  blocked: { label: "Blocked", fg: "var(--danger)", bg: "var(--danger-bg)" },
};

const VISIBLE = 5;

export function AgentVerification() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, [reduce]);

  // newest first; each tick a new request arrives at the top
  const rows = Array.from({ length: VISIBLE }, (_, i) => {
    const idx = (((tick - i) % FEED.length) + FEED.length) % FEED.length;
    return { key: tick - i, item: FEED[idx]! };
  });

  return (
    <section data-screen-label="agent-verification" className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={inViewOnce}>
          <motion.div variants={fadeUp}>
            <Eyebrow>Agent sign-in</Eyebrow>
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-4 text-3xl font-bold tracking-display text-content md:text-4xl">
            Every agent request, verified.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-[520px] text-pretty text-lg text-content-secondary">
            Like signing in a user — for the agents acting on your site. Your human visitors never notice.
          </motion.p>
          <motion.ol variants={stagger} className="mt-8 space-y-5">
            {STEPS.map((s) => (
              <motion.li key={s.n} variants={fadeUp} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft font-mono text-sm font-bold text-brand">
                  {s.n}
                </span>
                <span>
                  <span className="block text-base font-semibold text-content">{s.title}</span>
                  <span className="mt-1 block text-base text-content-secondary">{s.body}</span>
                </span>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="overflow-hidden rounded-2xl border border-border bg-surface shadow-raise"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <span className="flex items-center gap-2">
              <Logomark size={16} />
              <span className="text-sm font-semibold text-content">Auth logs</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-caps text-content-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--success)" }} />
              Live
            </span>
          </div>
          <ul className="relative overflow-hidden" aria-label="Example agent sign-ins">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map(({ key, item }) => {
                const r = RESULT_STYLE[item.result];
                return (
                  <motion.li
                    key={key}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-b border-border px-5 py-3.5 last:border-b-0 sm:grid-cols-[1.3fr_0.9fr_auto]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-content">{item.agent}</span>
                      <span className="block truncate font-mono text-[11px] text-content-muted">{item.detail}</span>
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block truncate text-sm text-content-secondary">{item.method}</span>
                      <span className="block truncate font-mono text-[11px] text-content-muted">{item.reason}</span>
                    </span>
                    <span
                      className="rounded-pill px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-caps"
                      style={{ color: r.fg, background: r.bg }}
                    >
                      {r.label}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
