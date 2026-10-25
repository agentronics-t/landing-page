// Docs live in a separate Next.js app (SDK monorepo apps/docs) deployed as the
// `agentronics-docs` Vercel project. We serve it under agentronics.dev/docs via
// multi-zone rewrites instead of a subdomain. The docs zone sets
// assetPrefix=/docs-static, so its _next + public assets route through the
// third rewrite. Override the target with DOCS_ZONE_URL if the zone moves.
const DOCS_ZONE = process.env.DOCS_ZONE_URL ?? "https://agentronics-docs.vercel.app";

// Baseline hardening. No CSP here on purpose: Calendly and Vercel Analytics each
// need their own script/frame/connect origins, and a wrong allowlist silently
// breaks the booking embed. Add it deliberately.
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
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // The home page is public/home.html, or index.md for Accept: text/markdown.
      { source: "/", headers: [{ key: "Vary", value: "Accept" }] },
      { source: "/index.md", headers: [{ key: "Content-Type", value: "text/markdown; charset=utf-8" }] },
      { source: "/llms.txt", headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }] },
      { source: "/.well-known/api-catalog", headers: [{ key: "Content-Type", value: "application/linkset+json" }] },
    ];
  },
  async redirects() {
    return [
      // Old routes.
      { source: "/sdk", destination: "/", permanent: true },
      { source: "/intelligence", destination: "/", permanent: true },
      // Log in and sign up happen on the console itself (no hop between domains);
      // a demo goes to the Calendly booking page. Query strings pass through.
      { source: "/login", destination: "https://app.agentronics.dev/sign-in", permanent: false },
      { source: "/sign-in/:path*", destination: "https://app.agentronics.dev/sign-in", permanent: false },
      { source: "/signup", destination: "https://app.agentronics.dev/sign-up", permanent: false },
      { source: "/sign-up/:path*", destination: "https://app.agentronics.dev/sign-up", permanent: false },
      { source: "/demo", destination: "/book", permanent: false },
      // The scanner lives on the home page now: /scan?url=x → /?url=x, which runs it.
      { source: "/scan", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // The home page is the redesign's static page (public/home.html), served
      // as-is for pixel parity. Agents that ask for Markdown get index.md.
      beforeFiles: [
        { source: "/", has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }], destination: "/index.md" },
        { source: "/", destination: "/home.html" },
      ],
      afterFiles: [
        { source: "/docs", destination: `${DOCS_ZONE}/docs` },
        { source: "/docs/:path+", destination: `${DOCS_ZONE}/docs/:path+` },
        { source: "/docs-static/:path+", destination: `${DOCS_ZONE}/docs-static/:path+` },
      ],
    };
  },
};

export default nextConfig;
