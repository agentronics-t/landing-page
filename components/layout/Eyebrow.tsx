import { cn } from "@/lib/cn";

/** Small mono caps label above section headlines. accent variant for dark heroes. */
export function Eyebrow({
  children,
  variant = "muted",
  className,
}: {
  children: React.ReactNode;
  variant?: "muted" | "accent";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-caps font-bold",
        variant === "accent" ? "text-accent" : "text-content-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Eyebrow rendered as a bordered pill (used by Integrations/Pricing headers). */
export function EyebrowPill({
  children,
  onDark = false,
  className,
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 font-mono text-xs uppercase tracking-caps",
        onDark ? "border-white/15 text-white/80" : "border-border bg-surface text-content-secondary",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      {children}
    </span>
  );
}
