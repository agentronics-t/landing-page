import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScanClient } from "./ScanClient";

export const metadata: Metadata = {
  title: "Free Agent Readiness Score — Agentronics",
  description: "Get your free Agent Readiness Score: 12 checks on whether AI agents can find, read and act on your site. Score out of 100, no signup, 30 seconds.",
};

export default function ScanPage() {
  return (
    <>
      <Navbar dark />
      <main>
        <Suspense>
          <ScanClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
