import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroAgentNative } from "@/components/sections/HeroAgentNative";
import { DataToDecisions } from "@/components/sections/DataToDecisions";
import { DataPlatforms } from "@/components/sections/DataPlatforms";

export const metadata: Metadata = {
  title: "Agentronics — Intelligence for the agent web",
  description:
    "The Agentronics intelligence platform turns agent traffic into business decisions: analytics, governance, and revenue impact in one dashboard.",
};

/**
 * Home = the Intelligence product page:
 * Hero (agent-native) → Data to Decisions → Data platforms (analytics + chat).
 * Pricing lives on its own /pricing route; the SDK / WebMCP developer story
 * lives on /sdk.
 */
export default function Home() {
  return (
    <>
      <Navbar heroDark={false} />
      <main>
        <HeroAgentNative />
        <DataToDecisions />
        <DataPlatforms />
      </main>
      <Footer />
    </>
  );
}
