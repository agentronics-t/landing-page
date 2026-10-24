import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Divider } from "@/components/brand/Traces";
import { Hero } from "@/components/home/Hero";
import { Stakes } from "@/components/home/Stakes";
import { AgentDemo } from "@/components/home/AgentDemo";
import { ScoreExplained } from "@/components/home/ScoreExplained";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Outcomes } from "@/components/home/Outcomes";
import { Proof } from "@/components/home/Proof";
import { PricingPreview } from "@/components/home/PricingPreview";
import { Trust } from "@/components/home/Trust";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { FAQ } from "@/lib/faq";

// FAQ as schema.org data — agents and search engines read it without parsing the page.
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

/**
 * Home, in the order of the homepage spec v3 §2: hook (score) → stakes →
 * demo → what the score means → 3 steps → outcomes → proof → pricing →
 * trust → FAQ → final CTA. Dark/light rhythm per §5.2; same-background
 * neighbours are separated by the symmetric divider.
 */
export default function Home() {
  return (
    <>
      <Navbar dark ctaAfter="scan" />
      <main>
        <Hero />
        <Stakes />
        <AgentDemo />
        <ScoreExplained />
        <HowItWorks />
        <Outcomes />
        <div className="bg-canvas">
          <Divider />
        </div>
        <Proof />
        <div className="bg-canvas">
          <Divider />
        </div>
        <PricingPreview />
        <Trust />
        <div className="bg-canvas pt-20 md:pt-24">
          <Divider />
        </div>
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
    </>
  );
}
