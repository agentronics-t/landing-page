"use client";

import { motion, useReducedMotion } from "framer-motion";
import { floaty } from "@/lib/motion";
import { cn } from "@/lib/cn";

interface StatCardProps {
  value: React.ReactNode;
  label: string;
  className?: string;
  floatDelay?: number;
}

/** Glass stat card floating over the hero globe. Theme-aware. */
export function StatCard({ value, label, className, floatDelay = 0 }: StatCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={reduce ? undefined : floaty}
      animate={reduce ? undefined : "animate"}
      transition={reduce ? undefined : { delay: floatDelay }}
      className={cn(
        "rounded-xl border border-border bg-[color-mix(in_srgb,var(--surface)_75%,transparent)] px-6 py-[18px] shadow-raise backdrop-blur-sm",
        className,
      )}
    >
      <div className="font-mono text-[26px] font-extrabold leading-tight text-content">{value}</div>
      <div className="mt-1.5 max-w-[200px] text-[15px] text-content-muted">{label}</div>
    </motion.div>
  );
}
