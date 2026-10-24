import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { WebMcpProvider } from "@/components/webmcp/WebMcpProvider";
import { PLANS } from "@/lib/catalog";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Agentronics — Make your website ready for AI agents",
  description:
    "Get your free Agent Readiness Score: 12 checks on whether ChatGPT, Claude and Gemini can find, read and act on your site. Agent Nick writes the fixes as a pull request you approve.",
  metadataBase: new URL("https://agentronics.dev"),
  openGraph: {
    title: "Make your website ready for AI agents",
    description: "Get your free Agent Readiness Score in 30 seconds. Score out of 100, no signup.",
    type: "website",
  },
};

/**
 * ClerkProvider only mounts when a real publishable key is present, so the site
 * still boots without keys.
 */
function hasClerkKey() {
  const k = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!k && k.startsWith("pk_") && !k.includes("TODO");
}

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Agentronics",
      url: "https://agentronics.dev",
      logo: "https://agentronics.dev/brand/agentronics-mark.svg",
      sameAs: ["https://x.com/agentronics", "https://www.linkedin.com/company/agentronicss", "https://github.com/agentronics-t"],
    },
    {
      "@type": "SoftwareApplication",
      name: "Agentronics",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: "Checks how AI agents see a website, fixes what's broken, and governs what agents can do.",
      offers: PLANS.filter((p) => p.priceMonthly !== null).map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: String(p.priceMonthly),
        priceCurrency: "USD",
      })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans text-md">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
        {children}
        <WebMcpProvider />
        <Analytics />
      </body>
    </html>
  );

  return hasClerkKey() ? <ClerkProvider>{body}</ClerkProvider> : body;
}
