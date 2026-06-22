// Docs live in a separate Next.js app (SDK monorepo apps/docs) deployed as the
// `agentronics-docs` Vercel project. We serve it under agentronics.dev/docs via
// multi-zone rewrites instead of a subdomain. The docs zone sets
// assetPrefix=/docs-static, so its _next + public assets route through the
// third rewrite. Override the target with DOCS_ZONE_URL if the zone moves.
const DOCS_ZONE = process.env.DOCS_ZONE_URL ?? "https://agentronics-docs.vercel.app";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // SDK story was promoted to the home page
      { source: "/sdk", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/docs", destination: `${DOCS_ZONE}/docs` },
      { source: "/docs/:path+", destination: `${DOCS_ZONE}/docs/:path+` },
      { source: "/docs-static/:path+", destination: `${DOCS_ZONE}/docs-static/:path+` },
    ];
  },
};

export default nextConfig;
