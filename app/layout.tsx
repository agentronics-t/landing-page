import type { Metadata } from "next";
import { Funnel_Display, Funnel_Sans, Martian_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { WebMcpProvider } from "@/components/webmcp/WebMcpProvider";
import { SiteEffects } from "@/components/layout/SiteEffects";
import { PLANS } from "@/lib/catalog";
import { hasClerkKey } from "@/lib/clerk";
import "./globals.css";
// The design system (the home page's stylesheet), after Tailwind so its base rules win.
import "../public/home-assets/styles.css";

const display = Funnel_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Funnel_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-mono", display: "swap" });

// The home page (public/home.html) has its own head; these are for every other page.
export const metadata: Metadata = {
  title: "Agentronics: Make your website ready for AI agents",
  description:
    "Get your free Agent Readiness Score in 30 seconds. See if AI agents can find, read and act on your website, then let Agent Nick fix it with a pull request you approve.",
  metadataBase: new URL("https://www.agentronics.dev"),
  icons: { icon: "/home-assets/favicon.svg" },
  openGraph: {
    title: "Can AI agents buy from you? Get your Agent Readiness Score.",
    description: "Free scan, 30 seconds. Agent Nick fixes what's broken in a pull request you approve.",
    type: "website",
  },
  other: { "theme-color": "#0B0B0C" },
};

// Clerk's sign-in and sign-up in the design system: lime primary with ink text,
// white card with a 2px ink frame and hard shadow (classes in globals.css).
const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#D4FF3A",
    colorTextOnPrimaryBackground: "#0B0B0C",
    colorText: "#0B0B0C",
    colorTextSecondary: "rgba(11,11,12,.65)",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0B0B0C",
    colorDanger: "#C2320A",
    colorSuccess: "#4D6B00",
    borderRadius: "12px",
    fontFamily: "var(--f-sans)",
  },
  elements: {
    cardBox: "clerk-card",
    formButtonPrimary: "clerk-primary",
    formFieldInput: "clerk-input",
  },
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.agentronics.dev/#org",
      name: "Agentronics",
      url: "https://www.agentronics.dev/",
      logo: "https://www.agentronics.dev/home-assets/favicon.svg",
      sameAs: ["https://x.com/agentronics", "https://www.linkedin.com/company/agentronicss", "https://github.com/agentronics-t"],
    },
    {
      "@type": "SoftwareApplication",
      name: "Agentronics",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      publisher: { "@id": "https://www.agentronics.dev/#org" },
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
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
        {children}
        <SiteEffects />
        <WebMcpProvider />
        <Analytics />
      </body>
    </html>
  );

  return hasClerkKey() ? <ClerkProvider appearance={CLERK_APPEARANCE}>{body}</ClerkProvider> : body;
}
