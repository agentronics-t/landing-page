"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useLaunchModal } from "@/components/launch/LaunchModal";
import { cn } from "@/lib/cn";

const LINKS = [
  { label: "SDK", href: "/" },
  { label: "Intelligence", href: "/intelligence" },
  { label: "Docs", href: "/docs" },
  { label: "Book a demo", href: "/book" },
  { label: "Pricing", href: "/pricing" },
];

/**
 * Scroll-condensing nav (spec 09A). At the top it spans full width and blends
 * into the hero; past 24px it visibly contracts into a centered floating pill
 * (narrower max-width + pill radius + surface blur + raise shadow). Animated via
 * explicit Framer values (not layout) so the contraction reads clearly.
 */
export function Navbar({ heroDark = true }: { heroDark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { open: openLaunchModal } = useLaunchModal();

  useEffect(() => {
    const onScroll = () => {
      setScrolled((prev) => {
        const y = window.scrollY;
        if (!prev && y >= 24) return true;
        if (prev && y <= 8) return false;
        return prev;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lightText = heroDark && !scrolled;

  // animate geometry only (smooth contract); chrome (bg/border/shadow) is
  // theme-aware via className so it works in both light and dark.
  const animate = scrolled
    ? { maxWidth: 1026, paddingLeft: 15, paddingRight: 15, paddingTop: 9, paddingBottom: 9, marginTop: 13, borderRadius: 999 }
    : { maxWidth: 1368, paddingLeft: 44, paddingRight: 44, paddingTop: 20, paddingBottom: 20, marginTop: 0, borderRadius: 0 };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center">
      <motion.nav
        initial={false}
        animate={reduce ? undefined : animate}
        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
        className={cn(
          "flex w-full items-center justify-between gap-4 border backdrop-blur transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-border bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] shadow-raise"
            : "border-transparent",
        )}
      >
        <Logo onDark={lightText} size={26} />

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative rounded-md px-3.5 py-2 text-base transition-colors focus-ring",
                    lightText
                      ? "text-white/80 hover:text-white"
                      : "text-content-secondary hover:text-content",
                    active && (lightText ? "text-white" : "text-content"),
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand"
                      aria-hidden
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="sm" onDark={lightText} onClick={openLaunchModal}>
            Login
          </Button>
          <Button variant="primary" size="sm" onClick={openLaunchModal}>
            Sign up
          </Button>
          <ThemeToggle onDark={lightText} />
        </div>

        {/* mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle onDark={lightText} />
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className={cn("rounded-md p-2 focus-ring", lightText ? "text-white" : "text-content")}
          >
            <Menu size={22} />
          </button>
        </div>
      </motion.nav>

      {/* mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-canvas lg:hidden"
          >
            <div className="flex items-center justify-between px-[clamp(20px,5vw,48px)] py-4">
              <Logo size={24} />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-2 text-content focus-ring"
              >
                <X size={22} />
              </button>
            </div>
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05 } } }}
              className="flex flex-col gap-1 px-[clamp(20px,5vw,48px)] pt-6"
            >
              {LINKS.map((link) => (
                <motion.li
                  key={link.label}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-[44px] items-center text-xl text-content"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-8 flex flex-col gap-3 px-[clamp(20px,5vw,48px)]">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setMenuOpen(false);
                  openLaunchModal();
                }}
              >
                Login
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setMenuOpen(false);
                  openLaunchModal();
                }}
              >
                Sign up
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
