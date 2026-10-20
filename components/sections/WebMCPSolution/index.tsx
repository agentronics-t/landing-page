"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Wrench, BrainCircuit, Zap } from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * /sdk — The WebMCP solution. Three cards explain the mechanism (expose →
 * load → act), then a terminal window plays a live agent session: connect,
 * tools/list, tools/call, success — typed out line by line like it's really
 * happening. Loops while on screen; static transcript under reduced motion.
 */

const CARDS = [
  {
    n: "01",
    Icon: Wrench,
    title: "Expose tools",
    body: "Declare your site's capabilities as typed WebMCP tools — products, orders, bookings — in a few lines of SDK code.",
  },
  {
    n: "02",
    Icon: BrainCircuit,
    title: "Agents load context",
    body: "Visiting agents discover your tools and load them straight into context. No scraping, no guessing, no broken cursors.",
  },
  {
    n: "03",
    Icon: Zap,
    title: "Act in milliseconds",
    body: "Agents call tools directly and complete tasks on your site in under 10ms — structured, governed, and fully logged.",
  },
];

type LineKind = "cmd" | "out" | "ok";
interface Line {
  kind: LineKind;
  text: string;
}

const SCRIPT: Line[] = [
  { kind: "cmd", text: "agent connect yoursite.com/webmcp" },
  { kind: "ok", text: "connected · webmcp/1.2 · governed session" },
  { kind: "cmd", text: "tools/list" },
  { kind: "out", text: "getOrders   searchProducts   createTicket   bookSlot   +4 more" },
  { kind: "cmd", text: 'tools/call getOrders { "customer": "acme-co", "limit": 5 }' },
  { kind: "out", text: "→ 5 orders · 200 OK" },
  { kind: "ok", text: "task complete in 9ms ✓" },
];

export function WebMCPSolution() {
  return (
    <section
      data-screen-label="webmcp-solution"
      className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-content">
        {/* header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="text-center"
        >
          <motion.div variants={fadeUp} className="flex justify-center">
            <Eyebrow>Future state</Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-3 text-3xl font-bold tracking-display text-content md:text-4xl"
          >
            The WebMCP solution
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-[560px] text-pretty text-lg text-content-secondary"
          >
            A structured, semantic protocol for agents — direct, reliable access instead of fragile
            scraping.
          </motion.p>
        </motion.div>

        {/* how it works — 3 cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {CARDS.map((c) => (
            <motion.div
              key={c.n}
              variants={fadeUp}
              className="rounded-xl border border-border bg-surface p-6 transition-colors duration-[var(--dur-fast)] hover:border-brand"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-soft text-brand">
                  <c.Icon size={20} />
                </span>
                <span className="font-mono text-xs uppercase tracking-caps text-content-muted">
                  {c.n}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-title text-content">{c.title}</h3>
              <p className="mt-2 text-base text-content-secondary">{c.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* live agent session terminal */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mt-12"
        >
          <Terminal />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------- terminal --------------------------------- */

const TYPE_MS = 28; // per character while typing a command
const LINE_PAUSE_MS = 550; // pause between lines
const LOOP_PAUSE_MS = 3000; // pause before the session replays

function Terminal() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });

  // li = current line, ch = typed chars of current cmd line
  const [li, setLi] = useState(0);
  const [ch, setCh] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const line = SCRIPT[li];

    // finished the script — pause, then replay
    if (!line) {
      const t = setTimeout(() => {
        setLi(0);
        setCh(0);
      }, LOOP_PAUSE_MS);
      return () => clearTimeout(t);
    }

    // commands type out character by character; output lines land whole
    if (line.kind === "cmd" && ch < line.text.length) {
      const t = setTimeout(() => setCh((c) => c + 1), TYPE_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLi((l) => l + 1);
      setCh(0);
    }, LINE_PAUSE_MS);
    return () => clearTimeout(t);
  }, [reduce, inView, li, ch]);

  const done = reduce ? SCRIPT.length : li;
  const lines = SCRIPT.slice(0, Math.min(done, SCRIPT.length));
  const current = !reduce && li < SCRIPT.length ? SCRIPT[li] : null;

  return (
    <div
      ref={ref}
      className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-glow"
    >
      {/* title bar */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="font-mono text-xs text-white/50">agent@yoursite — webmcp</span>
      </div>

      {/* session */}
      <div className="min-h-[260px] p-5 font-mono text-[13px] leading-7" aria-label="Live agent session">
        {lines.map((line, i) => (
          <TermLine key={i} line={line} />
        ))}
        {/* line currently typing */}
        {current && current.kind === "cmd" && (
          <p className="text-white/90">
            <Prompt />
            {current.text.slice(0, ch)}
            <motion.span
              className="ml-0.5 inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-white/80"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
              aria-hidden
            />
          </p>
        )}
      </div>
    </div>
  );
}

function Prompt() {
  return <span className="mr-2 select-none text-brand">❯</span>;
}

function TermLine({ line }: { line: Line }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        line.kind === "cmd" && "text-white/90",
        line.kind === "out" && "pl-5 text-white/55",
        line.kind === "ok" && "pl-5",
      )}
      style={line.kind === "ok" ? { color: "var(--success)" } : undefined}
    >
      {line.kind === "cmd" && <Prompt />}
      {line.text}
    </motion.p>
  );
}
