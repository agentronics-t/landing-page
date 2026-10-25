type Variant = "go" | "ink" | "line";
type Size = "md" | "lg" | "sm";

export const ARROW = (
  <svg className="btn__arrow" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** The design system's `.btn`: lime "go" for the primary action, ink, or outline ("line"). */
export function ButtonLink({
  href,
  variant = "go",
  size = "md",
  arrow = false,
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = ["btn", `btn--${variant}`, size !== "md" && `btn--${size}`, className].filter(Boolean).join(" ");
  // A plain <a>: "/" is the static home page and /docs is another zone, so
  // client-side routing has nothing to render for most of these links.
  return (
    <a className={cls} href={href} {...rest}>
      {children}
      {arrow && ARROW}
    </a>
  );
}
