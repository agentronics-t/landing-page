import { Check, CircleDashed, Minus, X } from "lucide-react";
import { ScoreDial } from "./ScoreDial";
import { scoreBand, type CheckStatus, type ScanCheck, type ScanReport as Report } from "@/lib/scan/types";
import { cn } from "@/lib/cn";

const STATUS: Record<CheckStatus, { icon: typeof Check; label: string; className: string }> = {
  pass: { icon: Check, label: "Passed", className: "bg-success-bg text-success" },
  warn: { icon: Minus, label: "Partly", className: "bg-warning-bg text-warning" },
  fail: { icon: X, label: "Failed", className: "bg-danger-bg text-danger" },
  skip: { icon: CircleDashed, label: "Not checked", className: "bg-surface-raised text-content-muted" },
};

/** The full report: score, the three questions, then every check with its fix. Works on Bone or PCB Black. */
export function ScanReport({ report, compact = false }: { report: Report; compact?: boolean }) {
  const band = scoreBand(report.score);
  const failing = report.checks.filter((c) => c.status === "fail" || c.status === "warn").sort((a, b) => b.max - b.points - (a.max - a.points));
  const passing = report.checks.filter((c) => c.status === "pass");
  const skipped = report.checks.filter((c) => c.status === "skip");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid gap-8 border-b border-border p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
        <ScoreDial score={report.score} className="mx-auto md:mx-0" />
        <div>
          <p className="font-mono text-xs uppercase tracking-caps text-content-muted">{report.host}</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-title text-content">
            {band.tone === "good" ? (
              <>
                <span className="text-brand">Agent-ready.</span> AI agents can find, read and use this site.
              </>
            ) : band.tone === "ok" ? (
              <>Partly ready. Agents can read this site but struggle to use it.</>
            ) : (
              <>Not ready. Most AI agents can&apos;t use this site yet.</>
            )}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {report.categories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-content">{cat.label}</span>
                  <span className="font-mono text-sm text-content-secondary">{cat.score}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-border">
                  <div
                    className={cn("h-full rounded-pill", cat.score >= 80 ? "bg-verdigris" : "bg-content-muted")}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-content-muted">{cat.question}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {failing.length > 0 && (
        <CheckList title={`What's broken (${failing.length})`} checks={compact ? failing.slice(0, 3) : failing} showFix />
      )}
      {!compact && passing.length > 0 && <CheckList title={`What works (${passing.length})`} checks={passing} />}
      {!compact && skipped.length > 0 && <CheckList title="Not on this page" checks={skipped} />}
    </div>
  );
}

function CheckList({ title, checks, showFix = false }: { title: string; checks: ScanCheck[]; showFix?: boolean }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <h3 className="px-6 pt-6 font-mono text-xs uppercase tracking-caps text-content-muted sm:px-8">{title}</h3>
      <ul className="divide-y divide-border">
        {checks.map((c) => {
          const s = STATUS[c.status];
          const Icon = s.icon;
          return (
            <li key={c.id} className="flex gap-4 px-6 py-4 sm:px-8">
              <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full", s.className)} aria-label={s.label}>
                <Icon size={13} strokeWidth={3} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="font-semibold text-content">{c.label}</p>
                  {c.status !== "skip" && (
                    <span className="font-mono text-xs text-content-muted">
                      {c.points}/{c.max}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-content-secondary">{c.detail}</p>
                {showFix && c.fix && (
                  <p className="mt-2 border-l-2 border-verdigris pl-3 text-sm text-content">
                    <span className="font-semibold">Fix: </span>
                    {c.fix}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
