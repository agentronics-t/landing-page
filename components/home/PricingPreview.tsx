import Link from "next/link";
import { Section, SectionHeading } from "@/components/layout/Section";
import { PlanCards } from "@/components/pricing/PlanCards";

/** §7 Pricing — Bone. Pro is the highlighted middle tier. */
export function PricingPreview() {
  return (
    <Section id="pricing" className="scroll-mt-16" innerClassName="max-w-[1280px]">
      <SectionHeading
        center
        eyebrow="Pricing"
        title="Start free. Pay when agents start paying off."
        lead="Every plan includes Agent Nick, which writes the fixes into your site and opens a pull request."
      />
      <PlanCards className="mt-14" />
      <p className="mt-8 text-center text-sm text-content-muted">
        Prices in USD, billed monthly.{" "}
        <Link href="/pricing" className="font-medium text-brand underline underline-offset-4 focus-ring">
          Compare every feature
        </Link>
      </p>
    </Section>
  );
}
