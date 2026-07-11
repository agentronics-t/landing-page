import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/sections/Pricing";

export const metadata: Metadata = {
  title: "Pricing — Agentronics",
  description:
    "Simple pricing that grows with your agent traffic. Measure agent traffic from $29/mo, full governance at $199/mo, enterprise-grade custom plans.",
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
