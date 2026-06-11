import { cn } from "@/lib/cn";

interface SectionProps {
  /** Dark "infrastructure" band on near-black. */
  tone?: "light" | "dark";
  /** Remove the max-width content wrapper (full-bleed inner). */
  bleed?: boolean;
  id?: string;
  screenLabel?: string;
  as?: "section" | "div";
  className?: string;
  innerClassName?: string;
  children?: React.ReactNode;
}

/** max-w-content column with vertical rhythm + page padding (BUILD_SPEC §5). */
export function Section({
  tone = "light",
  bleed = false,
  id,
  screenLabel,
  as: Tag = "section",
  className,
  innerClassName,
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      data-screen-label={screenLabel}
      className={cn(
        "py-20 md:py-28 px-[clamp(20px,5vw,48px)]",
        tone === "dark" ? "bg-neutral-950 text-white" : "bg-canvas text-content",
        className,
      )}
    >
      {bleed ? children : <div className={cn("mx-auto max-w-content", innerClassName)}>{children}</div>}
    </Tag>
  );
}
