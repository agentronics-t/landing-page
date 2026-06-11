import type { Variants } from "framer-motion";

/**
 * Shared Framer Motion variants (BUILD_SPEC §7).
 * All entrance animations gate on viewport (whileInView, once, amount 0.3)
 * and degrade under reduced motion at the call site via useReducedMotion().
 */

export const EASE_OUT = [0.2, 0, 0, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const staggerFast: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/** Subtle live-dashboard float; DISABLE under reduced motion. */
export const floaty: Variants = {
  animate: {
    y: [-5, 5],
    transition: { duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
};

/** Standard viewport config for whileInView entrances. */
export const inViewOnce = { once: true, amount: 0.3 } as const;
