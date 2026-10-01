import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { WebMcpProvider } from "@/components/webmcp/WebMcpProvider";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agentronics — Authentication for AI agents",
  description:
    "Agentronics is authentication for AI agents: verify every agent on your site — signed agents, crawlers, API agents and browser agents — with any method. No blocking — agents that don't authenticate browse as normal.",
  metadataBase: new URL("https://agentronics.dev"),
  openGraph: {
    title: "Agentronics — Authentication for AI agents",
    description: "Know which agents are real. Verify every agent on your site with any method.",
    type: "website",
  },
};

/**
 * ClerkProvider only mounts when a real publishable key is present, so the site
 * still boots without keys. Auth buttons (Login / Sign up / Get started) link to
 * the real /sign-in and /sign-up routes.
 */
function hasClerkKey() {
  const k = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!k && k.startsWith("pk_") && !k.includes("TODO");
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en" className={`${GeistSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* no-flash theme: apply saved/OS preference before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {children}
        <WebMcpProvider />
        <Analytics />
      </body>
    </html>
  );

  return hasClerkKey() ? <ClerkProvider>{body}</ClerkProvider> : body;
}
