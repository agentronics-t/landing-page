import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section } from "@/components/layout/Section";
import { PricingFootnote, PricingHeading } from "@/components/home/PricingPreview";
import { PlanCards } from "@/components/pricing/PlanCards";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Pricing — Agentronics",
  description:
    "Start free with your Agent Readiness Score and Agent Nick. Starter $19/mo (most popular) and Pro $49/mo add more fix rounds, agent actions, rules and history. Enterprise plans are custom.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Section className="pt-32 md:pt-36" innerClassName="max-w-[1280px]">
          <PricingHeading as="h1" />
          <PlanCards className="mt-12" />
          <PricingFootnote compare={false} />
          <p className="mx-auto mt-2 max-w-[680px] text-center text-sm text-content-muted">
            Limits never block agents: at a limit your site keeps working and we stop recording until next month.
          </p>
        </Section>
        <Section className="pt-0 md:pt-0">
          <h2 className="text-center font-display text-2xl font-bold tracking-title text-content">Compare plans</h2>
          <div className="mt-8">
            <ComparisonTable />
          </div>
        </Section>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
