import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/sections/Pricing";

export const metadata: Metadata = {
  title: "Pricing — Agentronics",
  description:
    "Start free. Agent Nick writes WebMCP tools into your site, then Starter at $19/mo and Pro at $49/mo add more sites, tools and agent governance. Enterprise plans are custom.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar heroDark={false} />
      <main className="pt-16">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
