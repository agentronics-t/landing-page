import { cn } from "@/lib/cn";

interface CardProps {
  title?: string;
  kicker?: string;
  padding?: number;
  className?: string;
  children?: React.ReactNode;
}

/** bg-surface, 1px border, 14px radius, NO shadow (DS rule: structure from borders). */
export function Card({ title, kicker, padding = 20, className, children }: CardProps) {
  return (
    <div
      className={cn("bg-surface border border-border rounded-xl", className)}
      style={{ padding }}
    >
      {title && <h3 className="text-md font-semibold text-content">{title}</h3>}
      {kicker && <p className="text-sm text-content-muted mt-1">{kicker}</p>}
      {children}
    </div>
  );
}
