import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { PlanCards } from "@/components/pricing/PlanCards";

export const PRICING_LEAD =
  "Every plan includes Agent Nick, our AI agent. He reads your code, writes the tools agents need to book, buy and sign up, and sends them to you as a pull request: a proposed change you approve on GitHub. Nothing changes on your site until you say yes.";

/** Spec v3 §3.9 — Pricing, Bone. Starter is the highlighted plan. */
export function PricingPreview() {
  return (
    <Section id="pricing" className="scroll-mt-16" innerClassName="max-w-[1280px]">
      <PricingHeading />
      <PlanCards className="mt-12" />
      <PricingFootnote />
    </Section>
  );
}

export function PricingHeading({ as: Tag = "h2" }: { as?: "h1" | "h2" }) {
  return (
    <div className="mx-auto max-w-[760px] text-center">
      <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
        Pricing
      </p>
      <Tag className="mt-4 font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
        Start free. Upgrade when agents start bringing you business.
      </Tag>
      <p className="mx-auto mt-4 max-w-[65ch] text-lg text-content-secondary">{PRICING_LEAD}</p>
    </div>
  );
}

export function PricingFootnote({ compare = true }: { compare?: boolean }) {
  return (
    <p className="mt-8 text-center text-sm text-content-muted">
      Prices in USD, billed monthly. Free needs no card. Cancel paid plans anytime.{" "}
      {compare && (
        <Link href="/pricing" className="font-medium text-brand underline underline-offset-4 focus-ring">
          Compare every feature →
        </Link>
      )}
    </p>
  );
}
