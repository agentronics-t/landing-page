import { Check, CircleDashed, Minus, X } from "lucide-react";
import { AGENT_NICK_FIXES, type CheckStatus, type ScanCheck, type ScanReport as Report } from "@/lib/scan/types";
import { cn } from "@/lib/cn";

const STATUS: Record<CheckStatus, { icon: typeof Check; label: string; className: string }> = {
  pass: { icon: Check, label: "Passed", className: "bg-success-bg text-success" },
  warn: { icon: Minus, label: "Partly", className: "bg-warning-bg text-warning" },
  fail: { icon: X, label: "Failed", className: "bg-danger-bg text-danger" },
  skip: { icon: CircleDashed, label: "Not checked", className: "bg-surface-raised text-content-muted" },
};

/** Every check, grouped: what's broken (with its fix, most points first), what works, and what wasn't on the page. */
export function ScanReport({ report }: { report: Report }) {
  const broken = report.checks.filter((c) => c.status === "fail" || c.status === "warn").sort((a, b) => b.max - b.points - (a.max - a.points));
  const passing = report.checks.filter((c) => c.status === "pass");
  const skipped = report.checks.filter((c) => c.status === "skip");
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {broken.length > 0 && <CheckList title={`What's broken (${broken.length})`} checks={broken} showFix />}
      {passing.length > 0 && <CheckList title={`What works (${passing.length})`} checks={passing} />}
      {skipped.length > 0 && <CheckList title="Not on this page" checks={skipped} />}
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
                      {showFix ? `+${c.max - c.points} pts if fixed` : `${c.points}/${c.max}`}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-content-secondary">{c.detail}</p>
                {showFix && c.fix && (
                  <p className="mt-2 border-l-2 border-verdigris pl-3 text-sm text-content">
                    <span className="font-semibold">Fix: </span>
                    {c.fix}
                    {AGENT_NICK_FIXES.has(c.id) && <span className="ml-2 font-semibold text-success">Agent Nick writes this.</span>}
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
