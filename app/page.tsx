import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { HeroAgents } from "@/components/sections/HeroAgents";
import { ThesisBand } from "@/components/sections/LosingTraffic";
import { WebMCPSolution } from "@/components/sections/WebMCPSolution";
import { SdkToDashboard } from "@/components/sections/SdkToDashboard";
import { IntegrationArchitecture } from "@/components/sections/IntegrationArchitecture";

export const metadata: Metadata = {
  title: "Agentronics — Stop losing agent traffic",
  description:
    "Agents are everywhere and you're losing traffic to fragile scraping. The Agentronics SDK + WebMCP give agents a structured, governed interface to your site.",
};

/**
 * Home = the SDK / WebMCP developer story (promoted from /sdk).
 * The Intelligence product page lives on /intelligence.
 */
export default function Home() {
  return (
    <>
      <Navbar heroDark={false} />
      <main>
        {/* 1. globe hero — losing agent traffic (current state) */}
        <HeroAgents />

        {/* 2. The WebMCP solution — how it works cards + live agent terminal */}
        <WebMCPSolution />

        {/* 3. value proposition / thesis */}
        <section className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-24">
          <ThesisBand />
        </section>

        {/* 4. integration architecture — scroll-driven process dial */}
        <IntegrationArchitecture />

        {/* 5. from SDK to dashboard */}
        <SdkToDashboard />

        {/* CTA — blends with the page (no distinct band) */}
        <section className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 text-center text-content md:py-24">
          <div className="mx-auto max-w-content">
            <h2 className="text-3xl font-bold tracking-display md:text-4xl">
              Make your site agent-native
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-pretty text-lg text-content-secondary">
              Install the SDK, define your endpoints, and start governing agent traffic today.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/sign-up" variant="primary" size="lg" glow>
                Sign up
              </ButtonLink>
              <ButtonLink href="/book" variant="ghost" size="lg">
                Book a demo
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
