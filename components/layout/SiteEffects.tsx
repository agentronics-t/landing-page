"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";

/**
 * The generic part of public/home-assets/app.js for the React pages: the nav's
 * scrolled state, reveal-on-scroll with the same stagger, the lime highlighter
 * sweep, the number count-up and the plan_click event. Same selectors,
 * thresholds and timings, so a page built from the design system's classes
 * moves like the home page.
 */
export function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const $$ = (s: string) => [...document.querySelectorAll<HTMLElement>(s)];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("app-ready");

    const nav = document.querySelector("[data-nav]");
    const setNav = () => nav?.classList.toggle("is-scrolled", scrollY > 8);
    setNav();
    addEventListener("scroll", setNav, { passive: true });

    const observers: IntersectionObserver[] = [];
    const onSeen = (els: Element[], fn: (el: HTMLElement) => void, opts: { threshold?: number } = {}) => {
      if (!("IntersectionObserver" in window)) return els.forEach((el) => fn(el as HTMLElement));
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              fn(e.target as HTMLElement);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: opts.threshold ?? 0.18, rootMargin: "0px 0px -8% 0px" },
      );
      els.forEach((el) => io.observe(el));
      observers.push(io);
    };

    $$("[data-reveal]").forEach((el) => {
      const sibs = [...(el.parentElement?.children ?? [])].filter((c) => c.hasAttribute("data-reveal"));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty("--d", `${Math.min(i, 6) * 80}ms`);
    });
    onSeen($$("[data-reveal]"), (el) => el.classList.add("is-in"));
    onSeen($$(".mark"), (el) => el.classList.add("is-in"), { threshold: 0.6 });

    const countUp = (el: HTMLElement, to: number, prefix = "") => {
      if (reduce) return void (el.textContent = prefix + to);
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1600);
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        el.textContent = prefix + (to * eased).toFixed(0);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    onSeen($$("[data-count]"), (el) => countUp(el, Number(el.dataset.count), el.dataset.prefix || ""), { threshold: 0.5 });

    const onPlan = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLElement>("[data-plan]");
      if (a) track("plan_click", { plan: a.dataset.plan ?? "", from: pathname });
    };
    document.addEventListener("click", onPlan);

    return () => {
      removeEventListener("scroll", setNav);
      document.removeEventListener("click", onPlan);
      observers.forEach((io) => io.disconnect());
    };
  }, [pathname]);

  return null;
}
