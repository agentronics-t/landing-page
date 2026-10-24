import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScanClient } from "./ScanClient";

export const metadata: Metadata = {
  title: "Free AI agent check — Agentronics",
  description: "See how AI agents see your website: can they find it, read it and use it? Free, no signup, 30 seconds.",
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
