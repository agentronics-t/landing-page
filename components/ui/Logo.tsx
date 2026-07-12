import Link from "next/link";
import { cn } from "@/lib/cn";

const INDIGO = "#5b4fd1";
const AMBER = "#e58313";

/**
 * Agentronics logomark — the "A" brand mark: an indigo apex hood + left leg
 * with a detached amber lower-right leg. Geometry traced from the 180×180 brand
 * icon export. Brand colors are baked (this is the logo, not a themed surface),
 * so it reads correctly on light and dark alike; `onDark` is accepted for API
 * compatibility but the mark itself does not change. Rounded corners come from a
 * same-colored round-join stroke.
 */
export function Logomark({
  size = 26,
  onDark: _onDark = false,
  className,
}: {
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size * (142 / 114)}
      height={size}
      viewBox="20 30 142 114"
      fill="none"
      className={className}
      role="img"
      aria-label="Agentronics"
    >
      {/* indigo — apex hood + left leg (one shape) */}
      <polygon
        points="85,38 108,38 125,72 94,80 63,132 29,132"
        fill={INDIGO}
        stroke={INDIGO}
        strokeWidth="9"
        strokeLinejoin="round"
      />
      {/* amber — detached lower-right leg */}
      <polygon
        points="108,98 138,98 154,132 123,132"
        fill={AMBER}
        stroke={AMBER}
        strokeWidth="9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoProps {
  onDark?: boolean;
  href?: string;
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function Logo({
  onDark = false,
  href = "/",
  size = 24,
  showWordmark = true,
  className,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex shrink-0 items-center gap-2 leading-none", className)}>
      <Logomark size={size} onDark={onDark} className="block shrink-0" />
      {showWordmark && (
        <span
          className={cn(
            "font-sans font-semibold text-[19px] leading-none tracking-tight whitespace-nowrap",
            onDark ? "text-white" : "text-content",
          )}
        >
          agentronics
        </span>
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
