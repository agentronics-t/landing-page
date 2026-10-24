"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Spec v3 trigger "in-view": IntersectionObserver at 35%, fires once. Returns
 * a ref and whether the element has entered. With reduced motion (or no
 * IntersectionObserver) it reports true at once, so final states render.
 */
export function useInView<T extends Element>({ amount = 0.35, once = true }: { amount?: number; once?: boolean } = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, once]);

  return [ref, inView] as const;
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Reactive reduced-motion flag for components that swap to a static version. */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}

/** Count from `from` to `to` over `ms` once `start` is true (ease-out). */
export function useCountUp(to: number, start: boolean, ms = 1000, from = 0): number {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!start) return;
    if (prefersReducedMotion()) return setValue(to);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, start, ms, from]);
  return value;
}
