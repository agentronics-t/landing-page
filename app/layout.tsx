import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { LaunchModalProvider } from "@/components/launch/LaunchModal";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

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
 * Clerk is wired but stubbed for now: ClerkProvider only mounts when a real
 * publishable key is present, so the site boots cleanly without any keys.
 * (Auth buttons currently open the "launching soon" popup → book a demo.)
 */
function hasClerkKey() {
  const k = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!k && k.startsWith("pk_") && !k.includes("TODO");
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* no-flash theme: apply saved/OS preference before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <LaunchModalProvider>{children}</LaunchModalProvider>
      </body>
    </html>
  );

  return hasClerkKey() ? <ClerkProvider>{body}</ClerkProvider> : body;
}
