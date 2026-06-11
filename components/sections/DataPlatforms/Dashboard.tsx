"use client";

import {
  LayoutDashboard, Bot, Activity, Wrench, ShieldCheck, ScrollText, Search, Download,
} from "lucide-react";
import { Logomark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/**
 * Agentronics governance dashboard mock (Alytics-style layout: sidebar + KPI row
 * + agents list + traffic chart + bottom widgets). Token-driven so it follows
 * the theme. Static, illustrative numbers.
 */
const NAV = [
  { label: "Dashboard", Icon: LayoutDashboard, active: true },
  { label: "Agents", Icon: Bot },
  { label: "Traffic", Icon: Activity },
  { label: "Tools", Icon: Wrench },
  { label: "Policies", Icon: ShieldCheck },
  { label: "Audit log", Icon: ScrollText },
];

const AGENTS = [
  { name: "GPTBot", org: "OpenAI", verified: true, active: true },
  { name: "ClaudeBot", org: "Anthropic", verified: true },
  { name: "PerplexityBot", org: "Perplexity", verified: true },
  { name: "Bingbot", org: "Microsoft", verified: false },
];

export function Dashboard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-raise">
      <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr]">
        {/* sidebar */}
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

        {/* main */}
        <div className="p-4">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <Kpi label="Agent sessions" value="62,000+" sub="Up vs last week" tone="up" />
            <Kpi label="Verified rate" value="94%" sub="94 of 100 agents verified" tone="up" />
            <Gauge label="Govern goal" pct={84} />
          </div>

          {/* middle: agents + chart */}
          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.1fr]">
            {/* agents list */}
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-content">Top agents</p>
                <span className="text-[10px] text-content-muted">Sort by traffic</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {AGENTS.map((a) => (
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

            {/* traffic chart */}
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-content">Agent traffic</p>
                <span className="text-[10px] text-content-muted">Monthly</span>
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
              <p className="text-xs font-semibold text-content">Tool calls</p>
              <p className="mt-1 font-mono text-lg font-extrabold text-content">1.2M</p>
              <p className="text-[10px] text-content-muted">across 8 governed tools</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-semibold text-content">Top regions</p>
              <div className="mt-2 space-y-1.5">
                <Bar label="US" pct={86} />
                <Bar label="EU" pct={52} />
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-semibold text-content">New integrations</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {["Postgres", "REST API", "Webhooks"].map((t) => (
                  <span
                    key={t}
                    className="rounded-pill bg-surface-raised px-2 py-0.5 text-[10px] text-content-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,64 L40,56 L80,58 L120,40 L160,34 L200,20 L240,12 L240,80 L0,80 Z" fill="url(#dashArea)" />
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
