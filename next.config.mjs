// Docs live in a separate Next.js app (SDK monorepo apps/docs) deployed as the
// `agentronics-docs` Vercel project. We serve it under agentronics.dev/docs via
// multi-zone rewrites instead of a subdomain. The docs zone sets
// assetPrefix=/docs-static, so its _next + public assets route through the
// third rewrite. Override the target with DOCS_ZONE_URL if the zone moves.
const DOCS_ZONE = process.env.DOCS_ZONE_URL ?? "https://agentronics-docs.vercel.app";

// Baseline hardening. No CSP here on purpose: Clerk, Calendly and Vercel
// Analytics each need their own script/frame/connect origins, and a wrong
// allowlist silently breaks sign-in or the booking embed. Add it deliberately.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      // Intelligence was promoted back to the home page; /sdk is a real route again
      { source: "/intelligence", destination: "/", permanent: true },
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
