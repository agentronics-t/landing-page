import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DocsContent } from "@/components/docs/DocsContent";

export const metadata: Metadata = {
  title: "Docs — Installation | Agentronics",
  description: "Install the Agentronics browser SDK (@agentronics/sdk) and initialize a governed WebMCP client.",
};

export default function DocsPage() {
  return (
    <>
      <Navbar heroDark={false} />
      <main className="bg-canvas pb-20 pt-28">
        <DocsContent />
      </main>
      <Footer />
    </>
  );
}
