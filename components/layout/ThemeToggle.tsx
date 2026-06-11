"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Light/dark toggle. Flips the `.dark` class on <html> (which swaps every role
 * token in globals.css), persists the choice to localStorage, and falls back to
 * the OS preference. Pairs with the no-flash inline script in app/layout.tsx.
 */
export function ThemeToggle({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle theme"
      className={cn(
        "grid h-9 w-9 place-items-center rounded-md border transition-colors focus-ring",
        onDark
          ? "border-white/20 text-white hover:border-white/50"
          : "border-border-strong text-content hover:border-brand",
        className,
      )}
    >
      {/* render a stable icon until mounted to avoid hydration mismatch */}
      {!mounted ? <Sun size={17} /> : isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
