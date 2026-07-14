import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agentronics — Infrastructure for the agent web",
  description:
    "Agentronics is developer-facing AI-agent infrastructure: the WebMCP protocol, an SDK, and a governance dashboard that gives sites real-time visibility into agent traffic.",
  metadataBase: new URL("https://agentronics.dev"),
  openGraph: {
    title: "Agentronics — Infrastructure for the agent web",
    description: "Make your site agent-native. Govern, observe, and serve autonomous agent traffic.",
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
        <Analytics />
      </body>
    </html>
  );

  return hasClerkKey() ? <ClerkProvider>{body}</ClerkProvider> : body;
}
