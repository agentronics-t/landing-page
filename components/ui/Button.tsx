import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  glow?: boolean;
  /** Light-on-dark ghost (white border/text over dark sections). */
  onDark?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-[var(--dur-fast)] ease-out focus-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-md",
};

function variantClasses(variant: Variant, onDark: boolean): string {
  switch (variant) {
    case "primary":
      return "bg-brand-solid text-white border border-transparent hover:bg-[var(--indigo-700)]";
    case "accent":
      return "bg-accent text-accent-content border border-transparent hover:bg-[var(--amber-600)]";
    case "danger":
      return "bg-danger text-white border border-transparent";
    case "ghost":
    default:
      return onDark
        ? "bg-transparent border border-white/20 text-white hover:border-white/50"
        : "bg-transparent border border-border-strong text-content hover:border-[var(--brand)]";
  }
}

export function Button({
  variant = "primary",
  size = "md",
  glow = false,
  onDark = false,
  fullWidth = false,
  className,
  children,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        base,
        sizes[size],
        variantClasses(variant, onDark),
        glow && "shadow-glow",
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Same visual language, renders an <a>/Link for navigation CTAs. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  glow = false,
  onDark = false,
  fullWidth = false,
  className,
  children,
  ...rest
}: BaseProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link
      href={href}
      className={cn(
        base,
        sizes[size],
        variantClasses(variant, onDark),
        glow && "shadow-glow",
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
