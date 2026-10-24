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
 * Sits on the page's first band: `dark` when that band is PCB Black (home,
 * scan, developers). Past 24px it becomes a solid bar of the same tone. No
 * Copper here: the page's own hero holds the one primary action.
 */
export function Navbar({ dark = false }: { dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        dark && "tone-dark",
        scrolled ? "border-b border-border bg-[color-mix(in_srgb,var(--canvas)_88%,transparent)] backdrop-blur-md" : "bg-transparent",
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
          <ButtonLink href="/book" variant="outline" size="sm">
            Book a demo
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
          </ul>
          <div className="mt-auto flex flex-col gap-3 p-4 pb-8">
            <ButtonLink href="/#scan" variant="primary" fullWidth onClick={() => setOpen(false)}>
              Check my site free
            </ButtonLink>
            <ButtonLink href="/book" variant="outline" fullWidth onClick={() => setOpen(false)}>
              Book a demo
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
