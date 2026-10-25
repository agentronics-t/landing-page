import type { MetadataRoute } from "next";

const BASE = "https://www.agentronics.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/index.md", "/llms.txt", "/pricing", "/developers", "/book", "/docs"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
