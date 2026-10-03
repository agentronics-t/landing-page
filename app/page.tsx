import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { HeroAgents } from "@/components/sections/HeroAgents";
import { AgentVerification } from "@/components/sections/AgentVerification";
import { ThesisBand } from "@/components/sections/LosingTraffic";
import { AuthMethods } from "@/components/sections/AuthMethods";
import { IntegrationArchitecture } from "@/components/sections/IntegrationArchitecture";
import { CodeTabs } from "@/components/sections/CodeTabs";
import { SdkToDashboard } from "@/components/sections/SdkToDashboard";

export const metadata: Metadata = {
  title: "Agentronics — Authentication for AI agents",
  description:
    "Verify every AI agent on your site — signed agents, crawlers, API agents and browser agents — with any method: Web Bot Auth, API keys, OAuth2, SSO, SPIFFE, mTLS. Agentronics never blocks: agents that don't authenticate browse as normal.",
};

/**
 * Home = the product: authentication for AI agents.
 * Hero → how a sign-in works → thesis → methods → how it works (dial) →
 * the code → the console → CTA.
 */
export default function Home() {
  return (
    <>
      <Navbar heroDark={false} />
      <main>
        <HeroAgents />
        <AgentVerification />

        <section className="bg-canvas px-[clamp(20px,5vw,48px)] py-16 md:py-20">
          <ThesisBand />
        </section>

        <AuthMethods />
        <IntegrationArchitecture />
        <CodeTabs />
        <SdkToDashboard />

        <section className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 text-center text-content md:py-24">
          <div className="mx-auto max-w-content">
            <h2 className="text-3xl font-bold tracking-display md:text-4xl">Give every agent an identity</h2>
            <p className="mx-auto mt-4 max-w-[520px] text-pretty text-lg text-content-secondary">
              Free for your first 1,000 monthly active agents. Human visitors are always free.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/sign-up" variant="primary" size="lg" glow>
                Start free
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
