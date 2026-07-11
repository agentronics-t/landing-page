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
  LayoutGrid, TrendingUp, Sparkles, Plug, MessageSquare, Radar, KeyRound, ShieldCheck,
  Brain, List, BarChart3, Search,
} from "lucide-react";
import { Logomark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/**
 * Intelligence page — faithful mock of the REAL Agentronics dashboard
 * (Dashboard/apps/dashboard Overview page): sidebar with the actual nav
 * (Overview/Forecast/Insights/Plugins/Agent Chat + SDK section), the real KPI
 * row (requests / blocked / stealth / agents), the "Requests by agent lane"
 * stacked area (WebMCP · Web Bot Auth · Stealth), top agents with lane badges,
 * and the 14-day forecast band — plus the Agent Chat panel docked right.
 * The whole panel scrolls in tilted and straightens flat at viewport center.
 */

const NAV_MAIN = [
  { label: "Overview", Icon: LayoutGrid, active: true },
  { label: "Forecast", Icon: TrendingUp },
  { label: "Insights", Icon: Sparkles },
  { label: "Plugins", Icon: Plug },
  { label: "Agent Chat", Icon: MessageSquare },
];

const NAV_SDK = [
  { label: "Detect", Icon: Radar },
  { label: "Auth", Icon: KeyRound },
  { label: "Authz", Icon: ShieldCheck },
  { label: "WebMCP Tools", Icon: Plug },
  { label: "Knaph", Icon: Brain },
  { label: "Logs", Icon: List },
  { label: "Analytics", Icon: BarChart3 },
];

// agent lanes — identical palette to the real dashboard
const LANES = [
  { label: "WebMCP", color: "var(--brand)" },
  { label: "Web Bot Auth", color: "var(--accent)" },
  { label: "Stealth", color: "var(--neutral-300)" },
];

const TOP_AGENTS = [
  { name: "GPTBot", lane: "webmcp", req: "412K", blocked: "0" },
  { name: "ClaudeBot", lane: "webmcp", req: "286K", blocked: "0" },
  { name: "PerplexityBot", lane: "webbotauth", req: "121K", blocked: "1.2K" },
  { name: "Bingbot", lane: "stealth", req: "64K", blocked: "18K" },
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
        <div className="grid grid-cols-1 sm:grid-cols-[164px_minmax(0,1fr)] lg:min-h-[550px] lg:grid-cols-[164px_minmax(0,1fr)_250px]">
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
        {NAV_MAIN.map((n) => (
          <div
            key={n.label}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
              n.active ? "bg-brand-soft font-medium text-brand" : "text-content-secondary",
            )}
          >
            <n.Icon size={14} strokeWidth={1.7} />
            {n.label}
          </div>
        ))}
      </nav>

      {/* SDK section — mirrors the real dashboard's second nav group */}
      <p className="mt-4 px-2 font-mono text-[9px] uppercase tracking-caps text-content-muted">
        SDK
      </p>
      <nav className="mt-1 space-y-0.5">
        {NAV_SDK.map((n) => (
          <div
            key={n.label}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-content-secondary"
          >
            <n.Icon size={14} strokeWidth={1.7} />
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
      {/* page header — real Overview heading */}
      <div className="mb-3">
        <p className="text-sm font-bold text-content">Overview</p>
        <p className="text-[11px] text-content-muted">AI-agent traffic across the last 30 days</p>
      </div>

      {/* KPI row — the real dashboard's four */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Total requests" value="1.2M" sub="agent traffic, 30d" />
        <Kpi label="Blocked" value="84K" sub="7% of requests" />
        <Kpi label="Stealth share" value="22%" sub="unverified automated" />
        <Kpi label="Distinct agents" value="8" sub="top observed" />
      </div>

      {/* requests by agent lane — stacked area */}
      <div className="mt-3 rounded-lg border border-border p-3">
        <p className="text-xs font-semibold text-content">Requests by agent lane</p>
        <LaneChart />
        <div className="mt-2 flex flex-wrap gap-4">
          {LANES.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-content-secondary">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* bottom: top agents + forecast */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-content">Top agents</p>
          <ul className="mt-1">
            {TOP_AGENTS.map((a) => (
              <li
                key={a.name}
                className="flex items-center justify-between border-b border-border py-1.5 last:border-b-0"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-content">{a.name}</span>
                  <span
                    className="rounded-pill px-1.5 py-0.5 text-[9px] font-medium"
                    style={
                      a.lane === "stealth"
                        ? { background: "var(--warning-bg)", color: "var(--warning)" }
                        : { background: "var(--info-bg)", color: "var(--info)" }
                    }
                  >
                    {a.lane}
                  </span>
                </span>
                <span className="flex gap-3 text-[10px] text-content-muted">
                  <span>{a.req} req</span>
                  <span style={a.blocked !== "0" ? { color: "var(--danger)" } : undefined}>
                    {a.blocked} blocked
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold text-content">Requests forecast · next 14 days</p>
          <ForecastBand />
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-[10px] font-bold uppercase tracking-caps text-content-muted">{label}</p>
      <p className="mt-1 text-[22px] font-extrabold tracking-display text-content">{value}</p>
      <p className="text-[10px] text-content-muted">{sub}</p>
    </div>
  );
}

/** Three stacked lanes — WebMCP (brand) on top of Web Bot Auth (amber) on Stealth (neutral). */
function LaneChart() {
  return (
    <svg viewBox="0 0 240 72" className="mt-2 w-full" preserveAspectRatio="none" aria-hidden>
      {/* stealth (bottom band) */}
      <path
        d="M0,72 L0,58 L40,59 L80,60 L120,58 L160,59 L200,60 L240,59 L240,72 Z"
        fill="var(--neutral-300)"
        opacity="0.55"
      />
      {/* web bot auth (middle band) */}
      <path
        d="M0,58 L40,59 L80,60 L120,58 L160,59 L200,60 L240,59 L240,46 L200,48 L160,45 L120,44 L80,48 L40,50 L0,49 Z"
        fill="var(--accent)"
        opacity="0.75"
      />
      {/* webmcp (top band — grows) */}
      <path
        d="M0,49 L40,50 L80,48 L120,44 L160,45 L200,48 L240,46 L240,14 L200,20 L160,28 L120,34 L80,40 L40,44 L0,46 Z"
        fill="var(--brand)"
        opacity="0.8"
      />
    </svg>
  );
}

/** Forecast line with a widening confidence band, like the real ForecastBand. */
function ForecastBand() {
  return (
    <svg viewBox="0 0 240 80" className="mt-2 w-full" preserveAspectRatio="none" aria-hidden>
      {/* history */}
      <path
        d="M0,58 L30,54 L60,55 L90,48 L120,42"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* confidence band */}
      <path d="M120,42 L150,40 L180,36 L210,34 L240,30 L240,8 L210,16 L180,22 L150,30 L120,42 Z"
        fill="var(--brand)" opacity="0.14" />
      <path d="M120,42 L150,44 L180,44 L210,46 L240,46 L240,30 L210,34 L180,36 L150,40 Z"
        fill="var(--brand)" opacity="0.14" />
      {/* forecast median (dashed) */}
      <path
        d="M120,42 L150,38 L180,32 L210,28 L240,22"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      {/* today divider */}
      <line x1="120" y1="4" x2="120" y2="76" stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3" />
    </svg>
  );
}

/* ----------------------- Agent Chat panel (docked) ------------------------- */

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

      {/* messages — newest pinned to the bottom */}
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
