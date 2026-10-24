"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { ArrowRight, Check, Link2 } from "lucide-react";
import { ScanForm } from "@/components/scan/ScanForm";
import { ScanReport } from "@/components/scan/ScanReport";
import { ScoreGauge } from "@/components/scan/ScoreGauge";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/layout/Section";
import { AGENT_READY_AT, BAND_COLOR, BAND_TEXT, MISSES, countedChecks, fixPlan, scoreBand, type ScanReport as Report } from "@/lib/scan/types";
import { cn } from "@/lib/cn";

/**
 * The results experience (spec v3 §4). Ethics rules: no countdowns, no fake
 * activity, no invented numbers. Every line here comes from this scan:
 * passed checks (endowed progress), the fewest fixes to Agent-ready with the
 * projected score from the real weights (goal-gradient), and what agents
 * miss on this site (loss framing, the user's own results only).
 */

const HEADLINE = {
  poor: "Not ready. Most AI agents can't use your site yet.",
  ok: "Partly ready. Agents find you, then get stuck.",
  good: "Agent-ready. Let's keep it that way.",
} as const;

const FREE_ACTIONS = 5;

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "done"; report: Report };

export function ScanClient() {
  const params = useSearchParams();
  const url = params.get("url") ?? "";
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    if (!url) return setState({ kind: "idle" });
    let cancelled = false;
    setState({ kind: "loading" });
    fetch("/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) })
      .then(async (res) => {
        const data = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
        if (cancelled) return;
        if (res.ok) {
          const report = data as Report;
          track("scan_complete", { score: report.score, band: scoreBand(report.score).tone });
          setState({ kind: "done", report });
        } else setState({ kind: "error", message: data.error ?? "Something went wrong." });
      })
      .catch(() => !cancelled && setState({ kind: "error", message: "We couldn't run the check. Check your connection and try again." }));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <>
      <Section tone="dark" className="pb-14 pt-28 md:pb-16 md:pt-32">
        {state.kind === "done" ? (
          <Reveal report={state.report} />
        ) : (
          <div className="mx-auto max-w-[680px] text-center">
            <p className="font-mono text-xs uppercase tracking-caps text-verdigris">Free Agent Readiness Score</p>
            <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.1] tracking-display md:text-[48px]">
              {state.kind === "loading" ? "Checking what agents see…" : "See your site the way AI agents do"}
            </h1>
            {state.kind === "loading" ? (
              <ScanningTrace />
            ) : (
              <ScanForm key={url} defaultValue={url} source="scan-page" className="mx-auto mt-8 max-w-[600px] text-left" />
            )}
            {state.kind === "error" && (
              <div className="mx-auto mt-8 max-w-[560px] rounded-xl border border-border bg-surface p-6">
                <p className="font-display text-xl font-semibold">We couldn&apos;t check that site</p>
                <p className="mt-2 text-content-secondary">{state.message}</p>
              </div>
            )}
          </div>
        )}
      </Section>

      {state.kind === "done" && <Results report={state.report} />}
    </>
  );
}

/** While the scan runs: 12 nodes on a trace, pulsing in turn. Indeterminate on purpose: we don't show a count we don't have. */
function ScanningTrace() {
  return (
    <div className="mx-auto mt-10 max-w-[560px]" role="status" aria-live="polite">
      <div className="relative flex items-center justify-between">
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
        <span className="scan-sweep absolute inset-x-0 top-1/2 h-px overflow-hidden" aria-hidden />
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="node-pulse relative h-3 w-3 rounded-full border-2 border-copper bg-canvas" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <p className="mt-6 text-sm text-content-secondary">
        Reading the page without JavaScript, then robots.txt, llms.txt, the sitemap and the page&apos;s own scripts. Usually under 30
        seconds.
      </p>
    </div>
  );
}

/** Reveal: the needle sweeps to the score; the band shows in colour and words; 12 nodes light pass / fail. */
function Reveal({ report }: { report: Report }) {
  const band = scoreBand(report.score);
  const counted = countedChecks(report);
  const passed = counted.filter((c) => c.status === "pass").length;
  const [lit, setLit] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setLit(i);
      if (i >= report.checks.length) clearInterval(id);
    }, 70);
    return () => clearInterval(id);
  }, [report]);

  return (
    <div className="mx-auto grid max-w-content items-center gap-10 md:grid-cols-[auto_1fr]">
      <ScoreGauge value={report.score} size={260} label={null} className="mx-auto" />
      <div>
        <p className="font-mono text-xs uppercase tracking-caps text-content-muted">Agent Readiness Score · {report.host}</p>
        <h1 className="mt-3 font-display text-[30px] font-semibold leading-[1.15] tracking-display md:text-[40px]">
          <span style={{ color: BAND_TEXT[band.tone] }}>{HEADLINE[band.tone].split(".")[0]}.</span>
          {HEADLINE[band.tone].slice(HEADLINE[band.tone].indexOf(".") + 1)}
        </h1>
        <div className="mt-6 flex flex-wrap gap-1.5" aria-label={`${passed} of ${counted.length} checks passed`}>
          {report.checks.map((c, i) => (
            <span
              key={c.id}
              title={c.label}
              className="h-3 w-3 rounded-full border-2 transition-colors duration-[var(--dur-base)]"
              style={{
                borderColor: i < lit ? (c.status === "pass" ? "var(--verdigris)" : c.status === "skip" ? "var(--border-strong)" : "var(--rust)") : "var(--border)",
                background: i < lit && c.status === "pass" ? "var(--verdigris)" : "transparent",
              }}
            />
          ))}
        </div>
        <p className="mt-3 text-md text-content">
          You already pass <strong>{passed} of {counted.length}</strong> checks.
        </p>
        <div className="mt-6 grid max-w-[520px] grid-cols-3 gap-4">
          {report.categories.map((c) => (
            <div key={c.id}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold">{c.label}</span>
                <span className="font-mono text-content-secondary">{c.score}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-border">
                <div className="h-full rounded-pill" style={{ width: `${c.score}%`, background: BAND_COLOR[scoreBand(c.score).tone] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Results({ report }: { report: Report }) {
  const { fixes, projected } = fixPlan(report);
  const ready = report.score >= AGENT_READY_AT;
  const misses = report.checks
    .filter((c) => (c.status === "fail" || c.status === "warn") && MISSES[c.id])
    .sort((a, b) => b.max - b.points - (a.max - a.points))
    .slice(0, 3);
  const forms = report.stats?.forms ?? 0;
  const needsStarter = forms > FREE_ACTIONS;
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const link = `${window.location.origin}/scan?url=${encodeURIComponent(report.host)}`;
    try {
      if (navigator.share) await navigator.share({ title: `Agent Readiness Score: ${report.score}/100`, url: link });
      else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <Section className="pt-12 md:pt-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-8">
          {/* goal-gradient */}
          {fixes.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-caps text-content-muted">Your next step</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                {ready
                  ? `${fixes.length} ${fixes.length === 1 ? "fix" : "fixes"} to a perfect 100.`
                  : `${fixes.length} ${fixes.length === 1 ? "fix" : "fixes"} to reach Agent-ready (${AGENT_READY_AT}+).`}
              </h2>
              <ProjectedBar from={report.score} to={projected} />
              <ol className="mt-5 space-y-2">
                {fixes.map((c, i) => (
                  <li key={c.id} className="flex items-baseline gap-3 text-base">
                    <span className="font-mono text-xs text-content-muted">{i + 1}</span>
                    <span className="flex-1 text-content">{c.label}</span>
                    <span className="font-mono text-sm text-success">+{c.max - c.points}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* loss box: this site's own results only */}
          {misses.length > 0 && (
            <div className="rounded-xl border border-[color-mix(in_srgb,var(--rust)_45%,transparent)] bg-danger-bg p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">What agents miss on your site today</h2>
              <ul className="mt-4 space-y-2.5">
                {misses.map((c) => (
                  <li key={c.id} className="flex gap-3 text-base text-content">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" aria-hidden />
                    {MISSES[c.id]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ScanReport report={report} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="tone-dark rounded-xl p-6">
            {needsStarter ? (
              <>
                <p className="font-display text-xl font-semibold leading-snug">We recommend Starter.</p>
                <p className="mt-3 text-sm text-content-secondary">
                  This page alone has {forms} forms agents need; Free covers {FREE_ACTIONS} agent actions. Starter covers 15, plus page
                  actions and API calls.
                </p>
                <ButtonLink href="/sign-up" fullWidth className="mt-6" onClick={() => track("plan_click", { plan: "starter", from: "scan" })}>
                  Start Starter: $19/mo
                  <ArrowRight size={18} aria-hidden />
                </ButtonLink>
                <Link href="/sign-up" onClick={() => track("plan_click", { plan: "free", from: "scan" })} className="mt-3 block text-center text-sm text-content-secondary underline underline-offset-4 hover:text-content">
                  Or start free
                </Link>
              </>
            ) : (
              <>
                <p className="font-display text-xl font-semibold leading-snug">{ready ? "Keep it that way." : "Fix it free with Agent Nick."}</p>
                <p className="mt-3 text-sm text-content-secondary">
                  Agent Nick reads your code, writes the tools agents need to book, buy and sign up, and sends them as a pull request.
                  Nothing changes until you approve it.
                </p>
                <ButtonLink href="/sign-up" fullWidth className="mt-6" onClick={() => track("plan_click", { plan: "free", from: "scan" })}>
                  Fix it free with Agent Nick
                  <ArrowRight size={18} aria-hidden />
                </ButtonLink>
              </>
            )}
            <p className="mt-4 text-xs text-content-muted">
              The full report is free, no email needed. Checked{" "}
              {new Date(report.scannedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <button type="button" onClick={share} className="inline-flex items-center gap-2 text-sm font-semibold text-content hover:text-brand focus-ring">
              {copied ? <Check size={16} className="text-success" /> : <Link2 size={16} />}
              {copied ? "Link copied" : "Share your score"}
            </button>
            <ScanForm id="scan-competitor" source="competitor" label="Scan a competitor" microcopy={null} secondary className="mt-5" />
          </div>
        </aside>
      </div>
    </Section>
  );
}

/** The score today and the projected score after the listed fixes (a ghost segment). */
function ProjectedBar({ from, to }: { from: number; to: number }) {
  return (
    <div className="mt-5">
      <div className="relative h-3 overflow-hidden rounded-pill bg-border">
        <div className="absolute inset-y-0 left-0 rounded-pill opacity-35" style={{ width: `${to}%`, background: BAND_COLOR[scoreBand(to).tone] }} />
        <div className="absolute inset-y-0 left-0 rounded-pill" style={{ width: `${from}%`, background: BAND_COLOR[scoreBand(from).tone] }} />
        <div className="absolute inset-y-0 w-0.5 bg-content" style={{ left: `${AGENT_READY_AT}%` }} aria-hidden />
      </div>
      <p className={cn("mt-2 font-mono text-sm text-content-secondary")}>
        {from} → <span style={{ color: BAND_TEXT[scoreBand(to).tone] }}>{to}</span> after these fixes
      </p>
    </div>
  );
}
