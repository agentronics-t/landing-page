"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpOptions {
  /** Numeric target to count to. */
  to: number;
  /** Decimal places to render (e.g. 1 for "30.5"). */
  decimals?: number;
  /** String prefix, e.g. "<" or "$". */
  prefix?: string;
  /** String suffix, e.g. "%", "+", "ms", "x", " mo". */
  suffix?: string;
  /** Add thousands separators ("62,000"). */
  separators?: boolean;
  /** Animation duration in ms. */
  duration?: number;
  /** Extra delay before starting, in ms. */
  delay?: number;
}

/**
 * Count up 0 → target once the element scrolls into view (BUILD_SPEC §7).
 * Snaps to the final value under prefers-reduced-motion.
 * Returns [ref, formattedString].
 */
export function useCountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  separators = false,
  duration = 1400,
  delay = 0,
}: CountUpOptions): [React.RefObject<HTMLSpanElement>, string] {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }

    let raf = 0;
    let start = 0;
    const startTimer = window.setTimeout(() => {
      const tick = (t: number) => {
        if (!start) start = t;
        const elapsed = t - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(to * eased);
        if (progress < 1) raf = requestAnimationFrame(tick);
        else setValue(to);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
  }, [inView, reduce, to, duration, delay]);

  const fixed = value.toFixed(decimals);
  const formatted = separators
    ? Number(fixed).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : fixed;

  return [ref, `${prefix}${formatted}${suffix}`];
}
