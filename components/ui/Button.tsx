import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * primary = Copper with PCB Black text — the one clickable colour (guide rule 1).
 * Use one primary per screen. outline/ghost for everything else; they read on
 * Bone and inside `.tone-dark` sections alike.
 */
type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-[var(--dur-fast)] ease-out focus-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-[52px] px-6 text-md",
};

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-content hover:bg-accent-hover",
  outline: "border border-border-strong text-content hover:border-content",
  ghost: "text-content-secondary hover:text-content",
};

export function buttonClass({ variant = "primary", size = "md", fullWidth = false, className }: BaseProps) {
  return cn(base, sizes[size], variants[variant], fullWidth && "w-full", className);
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass({ variant, size, fullWidth, className })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: BaseProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={buttonClass({ variant, size, fullWidth, className })} {...rest}>
      {children}
    </Link>
  );
}
