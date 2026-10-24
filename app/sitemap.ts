import type { MetadataRoute } from "next";

const BASE = "https://agentronics.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/scan", "/pricing", "/developers", "/book", "/docs"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
