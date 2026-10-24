import Link from "next/link";
import { cn } from "@/lib/cn";

// The Agentronics "A": an apex with one long left leg and a crossbar that
// returns into the right leg. Traced from the brand master (2000×2000) and
// cropped to the mark, so the viewBox is exactly the glyph.
export const MARK_PATH = "M458 0L835 660L317 660L368 570L664 570L458 209L119 800L0 800Z";
export const MARK_VIEWBOX = "0 0 835 800";
const COPPER = "#E8763A";

/** The mark alone. Brand colour is baked in: this is the logo, not a themed surface. */
export function Logomark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={(size * 835) / 800}
      height={size}
      viewBox={MARK_VIEWBOX}
      className={className}
      role="img"
      aria-label="Agentronics"
    >
      <path d={MARK_PATH} fill={COPPER} />
    </svg>
  );
}

interface LogoProps {
  href?: string | null;
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/** Mark + wordmark. The wordmark takes the surrounding text colour, so it reads on Bone and PCB Black. */
export function Logo({ href = "/", size = 22, showWordmark = true, className }: LogoProps) {
  const content = (
    <span className={cn("inline-flex shrink-0 items-center gap-2.5 leading-none text-content", className)}>
      <Logomark size={size} className="block shrink-0" />
      {showWordmark && (
        <span className="font-display text-[20px] font-bold leading-none tracking-title">agentronics</span>
      )}
    </span>
  );

  return href ? (
    <Link href={href} className="focus-ring rounded-md" aria-label="Agentronics home">
      {content}
    </Link>
  ) : (
    content
  );
}
