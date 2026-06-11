import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DataToDecisions } from "@/components/sections/DataToDecisions";
import { DataPlatforms } from "@/components/sections/DataPlatforms";
import { Pricing } from "@/components/sections/Pricing";

export const metadata: Metadata = {
  title: "Intelligence — Agentronics",
  description:
    "The Agentronics intelligence platform turns agent traffic into business decisions: analytics, governance, and revenue impact in one dashboard.",
};

/**
 * Intelligence product page (moved from the home route):
 * Data to Decisions → Data platforms (analytics + agent chat) → Pricing.
 */
export default function IntelligencePage() {
  return (
    <>
      <Navbar heroDark={false} />
      <main>
        <DataToDecisions />
        <DataPlatforms />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
