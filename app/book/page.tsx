import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionHeading } from "@/components/layout/Section";
import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";

export const metadata: Metadata = {
  title: "Book a demo — Agentronics",
  description: "Talk to the Agentronics team: we'll check your site live and show you what agents see and how to fix it.",
};

export default function BookPage() {
  return (
    <>
      <Navbar />
      <main>
        <Section className="pt-32 md:pt-36">
          <SectionHeading
            center
            eyebrow="Book a demo"
            title="Let's make your site ready for agents."
            lead="30 minutes with the team. We check your site live, walk through what agents see, and show you how the fixes land in your code."
          />
          <div className="mx-auto mt-12 max-w-3xl">
            <CalendlyEmbed />
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
