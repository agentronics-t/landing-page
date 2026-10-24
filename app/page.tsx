import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TraceDivider } from "@/components/brand/Traces";
import { Hero } from "@/components/home/Hero";
import { Shift } from "@/components/home/Shift";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhatYouGet } from "@/components/home/WhatYouGet";
import { Proof } from "@/components/home/Proof";
import { PricingPreview } from "@/components/home/PricingPreview";
import { Faq, FAQ } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";

// FAQ as schema.org data — agents and search engines read it without parsing the page.
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

/** Home, in the order of the design guide §3: Bone and PCB Black alternate. */
export default function Home() {
  return (
    <>
      <Navbar dark />
      <main>
        <Hero />
        <Shift />
        <BeforeAfter />
        <HowItWorks />
        <TraceDivider />
        <WhatYouGet />
        <Proof />
        <PricingPreview />
        <TraceDivider />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
    </>
  );
}
