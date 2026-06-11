import Link from "next/link";
import { cn } from "@/lib/cn";

const INDIGO = "#736ced";
const AMBER = "#ff9e1c";

/**
 * Agentronics logomark — faithful vector of the brand mark: a rounded indigo
 * "module" body with two stacked amber blocks, three input arrows (left) and
 * one output arrow (right) wired in. Geometry derived from the 2000×2000 brand
 * export. Brand colors are baked (this is the logo, not a themed surface); only
 * the connector lines flip with the surface via `lineColor`.
 */
export function Logomark({
  size = 26,
  onDark = false,
  className,
}: {
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  // onDark forces light lines (for always-dark panels); otherwise follow the theme
  const lineColor = onDark ? "#f4f5f8" : "var(--content)";
  // viewBox cropped tight around the composition (incl. arrows)
  return (
    <svg
      width={size * (134 / 118)}
      height={size}
      viewBox="14 16 134 118"
      fill="none"
      className={className}
      role="img"
      aria-label="Agentronics"
    >
      {/* connector lines (flip with surface) */}
      <g stroke={lineColor} strokeWidth="2.4">
        <line x1="26.4" y1="34.4" x2="41.6" y2="34.4" />
        <line x1="26.4" y1="54.4" x2="41.6" y2="54.4" />
        <line x1="26.4" y1="74.4" x2="41.6" y2="74.4" />
        <line x1="112.8" y1="54.4" x2="136" y2="54.4" />
      </g>

      {/* input arrows (left) */}
      <g fill={INDIGO}>
        <polygon points="20,30.4 20,38.4 26.4,34.4" />
        <polygon points="20,50.4 20,58.4 26.4,54.4" />
        <polygon points="20,70.4 20,78.4 26.4,74.4" />
        {/* output arrow (right) */}
        <polygon points="136,50.4 136,58.4 143.2,54.4" />
      </g>

      {/* body */}
      <rect x="41.6" y="21.2" width="71.2" height="108.4" rx="6.4" fill={INDIGO} />
      {/* two amber blocks */}
      <rect x="57.6" y="34" width="38" height="41.6" rx="2" fill={AMBER} />
      <rect x="57.6" y="86.8" width="38" height="42.8" rx="2" fill={AMBER} />
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
            "font-sans font-bold text-[19px] leading-none tracking-title whitespace-nowrap",
            onDark ? "text-white" : "text-content",
          )}
        >
          Agentronics
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
