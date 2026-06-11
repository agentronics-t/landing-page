import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "danger" | "info" | "brand" | "neutral";

interface BadgeProps {
  tone?: Tone;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Pill badge with a leading currentColor dot (CSS ::before, not an icon).
 * Status tones come ONLY from the semantic set — never amber for warning.
 */
const toneStyles: Record<Tone, { color: string; bg: string }> = {
  success: { color: "var(--success)", bg: "var(--success-bg)" },
  warning: { color: "var(--warning)", bg: "var(--warning-bg)" },
  danger: { color: "var(--danger)", bg: "var(--danger-bg)" },
  info: { color: "var(--info)", bg: "var(--info-bg)" },
  brand: { color: "var(--brand)", bg: "var(--brand-soft)" },
  neutral: { color: "var(--content-secondary)", bg: "var(--surface-raised)" },
};

export function Badge({ tone = "info", className, children }: BadgeProps) {
  const s = toneStyles[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-sm font-medium",
        className,
      )}
      style={{ color: s.color, background: s.bg }}
    >
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: "currentColor" }}
      />
      {children}
    </span>
  );
}
