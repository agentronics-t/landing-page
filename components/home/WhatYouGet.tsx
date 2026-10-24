import { MessageSquareQuote, MousePointerClick, ShieldCheck } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/Section";

const OUTCOMES = [
  {
    icon: MessageSquareQuote,
    title: "Agents recommend you",
    body: "When someone asks their assistant for the best option, it can read your site and get your prices and details right.",
  },
  {
    icon: MousePointerClick,
    title: "Agents finish the job",
    body: "Booking, buying and signing up become actions agents call directly, instead of clicking around and giving up.",
  },
  {
    icon: ShieldCheck,
    title: "You stay in charge",
    body: "See which agents visit and what they do. Decide what each one may do, and ask the person first for anything that matters.",
  },
];

/** §5 What you get — Bone. Outcomes, not features. */
export function WhatYouGet() {
  return (
    <Section className="pt-4 md:pt-6">
      <SectionHeading eyebrow="What you get" title="More of your customers' agents get to yes." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {OUTCOMES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-surface p-7">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand">
              <Icon size={20} aria-hidden />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold text-content">{title}</h3>
            <p className="mt-2 text-md text-content-secondary">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
