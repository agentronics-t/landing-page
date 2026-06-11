import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";

export const metadata: Metadata = {
  title: "Book a demo — Agentronics",
  description: "Schedule a technical deep dive with the Agentronics engineering team.",
};

export default function BookPage() {
  return (
    <>
      <Navbar heroDark={false} />
      <main className="bg-canvas px-[clamp(20px,5vw,48px)] pb-20 pt-28">
        <div className="mx-auto max-w-content">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-display text-content md:text-4xl">
              Schedule a technical deep dive
            </h1>
            <p className="mx-auto mt-4 max-w-[640px] text-pretty text-lg text-content-secondary">
              Connect directly with our engineering team to explore integration architectures, custom SDK
              implementations, and data-pipeline modeling tailored to your stack.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl">
            <CalendlyEmbed />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
