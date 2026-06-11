"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  LayoutDashboard, Bot, Activity, CircleDollarSign, FileBarChart, Download, Search, Sparkles,
} from "lucide-react";
import { Logomark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/**
 * Intelligence page — agent-analytics platform mock. Alytics-style analytics
 * (KPIs, top agents by revenue, growth chart) reframed around what agent
 * traffic means for the business, with a VS Code-style agent chat docked on
 * the right that narrates the impact. The whole panel scrolls in tilted and
 * straightens flat as it reaches the viewport center.
 */

const NAV = [
  { label: "Dashboard", Icon: LayoutDashboard, active: true },
  { label: "Agents", Icon: Bot },
  { label: "Traffic", Icon: Activity },
  { label: "Revenue", Icon: CircleDollarSign },
  { label: "Reports", Icon: FileBarChart },
  { label: "Export", Icon: Download },
];

const TOP_AGENTS = [
  { name: "GPTBot", org: "OpenAI", rev: "$3,240", verified: true, active: true },
  { name: "ClaudeBot", org: "Anthropic", rev: "$2,610", verified: true },
  { name: "PerplexityBot", org: "Perplexity", rev: "$1,408", verified: true },
  { name: "Bingbot", org: "Microsoft", rev: "$310", verified: false },
];

const CHAT: { role: "user" | "agent"; text: string }[] = [
  { role: "user", text: "How is agent traffic affecting revenue this week?" },
  { role: "agent", text: "Verified agent sessions are up 12% — they completed 1,840 checkouts, adding ≈ $8.4k in revenue." },
  { role: "user", text: "Any impact on real users?" },
  { role: "agent", text: "None — bot retries fell 9% under your new policies and human latency is unchanged. Top earner: GPTBot via getOrders." },
];

export function AgentAnalytics() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // tilted into the screen on entry → flat + risen by viewport center
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center 0.45"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [72, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <div ref={ref} className="min-w-0" style={{ perspective: 1400 }}>
      <motion.div
        style={reduce ? undefined : { rotateX, y, scale, transformOrigin: "50% 0%" }}
        className="overflow-hidden rounded-xl border border-border bg-surface shadow-raise"
      >
        <div className="grid grid-cols-1 sm:grid-cols-[150px_minmax(0,1fr)] lg:min-h-[550px] lg:grid-cols-[150px_minmax(0,1fr)_250px]">
          <Sidebar />
          <Main />
          <ChatPanel />
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------- sidebar --------------------------------- */

function Sidebar() {
  return (
    <aside className="hidden flex-col border-r border-border bg-surface-raised p-3 sm:flex">
      <div className="flex items-center gap-2 px-1 py-1">
        <Logomark size={18} />
        <span className="text-sm font-bold tracking-title text-content">Agentronics</span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5 text-content-muted">
        <Search size={13} />
        <span className="text-xs">Search</span>
      </div>
      <nav className="mt-3 space-y-0.5">
        {NAV.map((n) => (
          <div
            key={n.label}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
              n.active ? "bg-brand-soft font-medium text-brand" : "text-content-secondary",
            )}
          >
            <n.Icon size={14} />
            {n.label}
          </div>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">
          NA
        </span>
        <div className="leading-tight">
          <p className="text-xs font-medium text-content">Nithin A.</p>
          <p className="text-[10px] text-content-muted">Admin</p>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------- main ---------------------------------- */

function Main() {
  return (
    <div className="min-w-0 p-4">
      {/* KPI row — agent traffic in business terms */}
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Agent revenue" value="+18%" sub="vs last week, verified agents" tone="up" />
        <Kpi label="Failed sessions" value="4%" sub="96 of 100 agent tasks complete" />
        <Gauge label="Quarter goal" pct={84} />
      </div>

      {/* middle: top agents by revenue + traffic growth */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-content">Top agents by revenue</p>
            <span className="text-[10px] text-content-muted">This week</span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {TOP_AGENTS.map((a) => (
              <li
                key={a.name}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5",
                  a.active && "bg-brand-soft",
                )}
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-raised">
                  <Bot size={12} className="text-content-secondary" />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-medium text-content">{a.name}</p>
                  <p className="text-[10px] text-content-muted">{a.org}</p>
                </div>
                <span className="font-mono text-xs font-bold text-content">{a.rev}</span>
                <span
                  className="rounded-pill px-1.5 py-0.5 text-[9px] font-medium"
                  style={
                    a.verified
                      ? { background: "var(--success-bg)", color: "var(--success)" }
                      : { background: "var(--warning-bg)", color: "var(--warning)" }
                  }
                >
                  {a.verified ? "Verified" : "Detected"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-content">Agent traffic → revenue</p>
            <span className="text-[10px] text-content-muted">Yearly</span>
          </div>
          <AreaChart />
          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
            <Mini label="Peak month" value="November" accent />
            <Mini label="Peak year" value="2026" />
            <Mini label="Top tool" value="getOrders" />
          </div>
        </div>
      </div>

      {/* bottom widgets */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-content">Revenue from agents</p>
          <p className="mt-1 font-mono text-lg font-extrabold text-content">$8.4k</p>
          <p className="text-[10px] text-content-muted">added this week</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-content">Top regions</p>
          <div className="mt-2 space-y-1.5">
            <Bar label="US" pct={86} />
            <Bar label="EU" pct={52} />
          </div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-content">Tool calls</p>
          <p className="mt-1 font-mono text-lg font-extrabold text-content">1.2M</p>
          <p className="text-[10px] text-content-muted">across 8 governed tools</p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- VS Code-style agent chat -------------------------- */

function ChatPanel() {
  const reduce = useReducedMotion();
  // shown = messages revealed; values past CHAT.length hold a pause before looping
  const [tick, setTick] = useState(reduce ? CHAT.length : 1);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => (t + 1) % (CHAT.length + 3)), 2200);
    return () => clearInterval(id);
  }, [reduce]);

  const shown = Math.max(1, Math.min(tick === 0 ? 1 : tick, CHAT.length));
  const typing = !reduce && tick > 0 && tick < CHAT.length;

  return (
    <aside className="hidden h-full flex-col border-t border-border bg-surface-raised lg:flex lg:border-l lg:border-t-0">
      {/* panel header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-caps text-content-secondary">
          <Sparkles size={12} className="text-brand" />
          Agent chat
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-2 py-0.5 font-mono text-[9px] uppercase tracking-caps text-content-secondary">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} />
          Live
        </span>
      </div>

      {/* messages — newest pinned to the bottom, VS Code copilot style */}
      <div className="flex min-h-[260px] flex-1 flex-col justify-end gap-2 overflow-hidden p-3">
        <AnimatePresence initial={false}>
          {CHAT.slice(0, shown).map((m, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className={cn(
                "max-w-[95%] rounded-lg px-2.5 py-2 text-[11px] leading-snug",
                m.role === "user"
                  ? "self-end bg-brand-soft text-content"
                  : "self-start border border-border bg-surface text-content-secondary",
              )}
            >
              {m.role === "agent" && (
                <span className="mb-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-caps text-brand">
                  <Logomark size={10} /> Agentronics
                </span>
              )}
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* typing dots while the next message is being "written" */}
        {typing && (
          <div className="flex items-center gap-1 self-start rounded-lg border border-border bg-surface px-2.5 py-2">
            {[0, 1, 2].map((d) => (
              <motion.span
                key={d}
                className="h-1 w-1 rounded-full bg-content-muted"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* input mock */}
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between rounded-md border border-border bg-surface px-2.5 py-1.5">
          <span className="text-[11px] text-content-muted">Ask about your agent traffic…</span>
          <span className="font-mono text-[10px] text-content-muted">⏎</span>
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------- widgets --------------------------------- */

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "up" }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] uppercase tracking-caps text-content-muted">{label}</p>
      <p className="mt-1 flex items-center gap-1 font-mono text-lg font-extrabold text-content">
        {value}
        {tone === "up" && <span className="text-xs" style={{ color: "var(--success)" }}>↗</span>}
      </p>
      <p className="text-[10px] text-content-muted">{sub}</p>
    </div>
  );
}

function Gauge({ label, pct }: { label: string; pct: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] uppercase tracking-caps text-content-muted">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
          <circle
            cx="22" cy="22" r={r} fill="none" stroke="var(--brand)" strokeWidth="5"
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
            transform="rotate(-90 22 22)"
          />
        </svg>
        <span className="font-mono text-lg font-extrabold text-content">{pct}%</span>
      </div>
    </div>
  );
}

function AreaChart() {
  return (
    <svg viewBox="0 0 240 80" className="mt-2 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="agentArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,64 L40,56 L80,58 L120,40 L160,34 L200,20 L240,12 L240,80 L0,80 Z" fill="url(#agentArea)" />
      <path
        d="M0,64 L40,56 L80,58 L120,40 L160,34 L200,20 L240,12"
        fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-content-muted">{label}</p>
      <p className={cn("font-medium", accent ? "text-brand" : "text-content")}>{value}</p>
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 text-[10px] text-content-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-raised">
        <div className="h-full rounded-pill bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
