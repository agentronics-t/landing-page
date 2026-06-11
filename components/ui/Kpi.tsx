import { cn } from "@/lib/cn";

interface KpiProps {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaTone?: "success" | "danger" | "neutral";
  className?: string;
}

const deltaColor: Record<NonNullable<KpiProps["deltaTone"]>, string> = {
  success: "var(--success)",
  danger: "var(--danger)",
  neutral: "var(--content-muted)",
};

/** Tile on brand-soft; value 28px/800 numeral, mono delta. */
export function Kpi({ label, value, delta, deltaTone = "neutral", className }: KpiProps) {
  return (
    <div className={cn("bg-brand-soft rounded-lg p-4 sm:p-5", className)}>
      <div className="text-2xl font-extrabold tracking-display text-content">{value}</div>
      <div className="mt-1 text-sm text-content-secondary">{label}</div>
      {delta && (
        <div className="mt-2 font-mono text-sm" style={{ color: deltaColor[deltaTone] }}>
          {delta}
        </div>
      )}
    </div>
  );
}
