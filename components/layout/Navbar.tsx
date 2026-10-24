"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Developers", href: "/developers" },
  { label: "Docs", href: "/docs" },
];

/**
 * Spec v3 §3.1: 64px, 4 links + 1 CTA (Hick's law). Transparent over a dark
 * hero (`dark`); past 80px of scroll it becomes Bone with a Seam border.
 * `ctaAfter` = id of the hero's score input: the Copper "Get my score" CTA
 * only appears once that input has left the viewport. Without it, the CTA
 * always shows.
 */
export function Navbar({ dark = false, ctaAfter }: { dark?: boolean; ctaAfter?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [showCta, setShowCta] = useState(!ctaAfter);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!ctaAfter) return;
    const el = document.getElementById(ctaAfter);
    if (!el || typeof IntersectionObserver === "undefined") return setShowCta(true);
    const io = new IntersectionObserver(([e]) => setShowCta(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [ctaAfter]);

  const onDark = dark && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-[var(--dur-base)]",
        onDark ? "tone-dark border-transparent !bg-transparent" : "border-transparent bg-transparent",
        scrolled && "border-seam !bg-[color-mix(in_srgb,var(--bone)_94%,transparent)] backdrop-blur-md",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-[clamp(20px,4vw,40px)]">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = link.href !== "/#how-it-works" && pathname.startsWith(link.href);
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-base text-content-secondary transition-colors hover:text-content focus-ring",
                    active && "text-content",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/sign-in" variant="ghost" size="sm">
            Log in
          </ButtonLink>
          <ButtonLink
            href="/#scan"
            size="sm"
            aria-hidden={!showCta}
            tabIndex={showCta ? undefined : -1}
            className={cn(
              "transition-[opacity,transform] duration-[var(--dur-base)]",
              showCta ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
            )}
          >
            Get my score
          </ButtonLink>
        </div>

        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-content focus-ring md:hidden"
        >
          <Menu size={22} />
        </button>
      </nav>

      {open && (
        <div className="tone-dark fixed inset-0 z-50 flex flex-col md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Logo />
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-md p-2 text-content focus-ring">
              <X size={22} />
            </button>
          </div>
          <ul className="flex flex-col gap-1 px-4 pt-6">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center font-display text-2xl font-semibold text-content"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sign-in" onClick={() => setOpen(false)} className="flex min-h-[48px] items-center font-display text-2xl font-semibold text-content">
                Log in
              </Link>
            </li>
          </ul>
          <div className="mt-auto p-4 pb-8">
            <ButtonLink href="/#scan" fullWidth onClick={() => setOpen(false)}>
              Get my score
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
