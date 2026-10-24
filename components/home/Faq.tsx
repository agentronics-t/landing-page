"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { FAQ } from "@/lib/faq";
import { cn } from "@/lib/cn";

/**
 * Spec v3 §3.11 — "Questions buyers ask before they start." Bone. The first
 * sentence of each answer is the answer. First item open. Height animates
 * with grid-rows (0fr → 1fr); answers stay in the HTML for agents and search.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section innerClassName="grid gap-10 md:grid-cols-[1fr_1.7fr]">
      <div>
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
          FAQ
        </p>
        <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
          Questions buyers ask before they start.
        </h2>
      </div>
      <ul className="divide-y divide-border border-y border-border">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q}>
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-lg font-semibold text-content focus-ring"
                >
                  {item.q}
                  <ChevronDown
                    size={20}
                    aria-hidden
                    className={cn("shrink-0 text-content-muted transition-transform duration-[var(--dur-base)]", isOpen && "rotate-180")}
                  />
                </button>
              </h3>
              <div
                id={`faq-a-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                className="grid transition-[grid-template-rows] duration-[var(--dur-base)] ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="max-w-[65ch] pb-5 text-md text-content-secondary">{item.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
