import { cn } from "@/lib/cn";

interface SectionProps {
  /** "dark" = PCB Black band; remaps every token via `.tone-dark`. */
  tone?: "light" | "dark";
  id?: string;
  className?: string;
  innerClassName?: string;
  children?: React.ReactNode;
}

/** Full-bleed band with the max-w-content column and page gutters. Sections alternate Bone / PCB Black. */
export function Section({ tone = "light", id, className, innerClassName, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative px-4 py-20 sm:px-[clamp(20px,5vw,48px)] md:py-28",
        tone === "dark" ? "tone-dark" : "bg-canvas text-content",
        className,
      )}
    >
      <div className={cn("relative mx-auto max-w-content", innerClassName)}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center = false,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(center && "mx-auto text-center", "max-w-[720px]", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className={cn("font-display text-[30px] font-bold leading-[1.15] tracking-display md:text-3xl", eyebrow && "mt-4")}>
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg text-content-secondary">{lead}</p>}
    </div>
  );
}

/** Mono caps label with a verdigris solder dot. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
      {children}
    </p>
  );
}
