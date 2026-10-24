import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionHeading } from "@/components/layout/Section";
import { PlanCards } from "@/components/pricing/PlanCards";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: "Pricing — Agentronics",
  description:
    "Start free. Agent Nick writes WebMCP tools into your site, then Starter at $19/mo and Pro at $49/mo add more sites, tools and agent governance. Enterprise plans are custom.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Section className="pt-32 md:pt-36" innerClassName="max-w-[1280px]">
          <SectionHeading
            center
            eyebrow="Pricing"
            title="Start free. Pay when agents start paying off."
            lead="Every plan includes Agent Nick, which writes the fixes into your site and opens a pull request."
          />
          <PlanCards className="mt-14" />
          <p className="mx-auto mt-8 max-w-[680px] text-center text-sm text-content-muted">
            Prices in USD, billed monthly. Limits never block agents: at a limit your site keeps working and we stop recording
            until next month.
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
