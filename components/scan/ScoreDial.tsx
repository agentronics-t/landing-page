import { cn } from "@/lib/cn";
import { scoreBand } from "@/lib/scan/types";

/**
 * Score out of 100 on a circuit ring. Verdigris means "ready" and nothing else,
 * so only an agent-ready score lights the ring verdigris; lower scores stay Fog.
 */
export function ScoreDial({ score, size = 168, className }: { score: number; size?: number; className?: string }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const band = scoreBand(score);
  const stroke = band.tone === "good" ? "var(--verdigris)" : band.tone === "ok" ? "var(--content-secondary)" : "var(--content-muted)";
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
        />
      </svg>
      <div className="text-center">
        <div className="font-display text-[44px] font-bold leading-none tracking-display text-content">{score}</div>
        <div className="mt-1 font-mono text-xs uppercase tracking-caps text-content-muted">of 100</div>
      </div>
    </div>
  );
}
