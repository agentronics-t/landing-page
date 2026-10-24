import type { MetadataRoute } from "next";

// Every agent and crawler is welcome: this site is our own agent-readiness demo.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://agentronics.dev/sitemap.xml",
  };
}
