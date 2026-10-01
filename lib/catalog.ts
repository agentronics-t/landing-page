/**
 * Product catalog — the single source of truth for plans, the feature matrix,
 * the product overview, and docs links. Both the Pricing UI
 * (components/sections/Pricing) and the WebMCP tools (components/webmcp) read
 * from here, so an agent calling `get_pricing` can never disagree with what a
 * human sees on the pricing page. Update pricing here.
 */

export type PlanId = "free" | "pro" | "business" | "enterprise";
export type Currency = "USD" | "INR";
export type Cycle = "monthly" | "yearly";
export type Cell = boolean | string;

export const YEARLY_DISCOUNT_PCT = 16; // yearly = 10 × monthly
export const CURRENCIES: Currency[] = ["USD", "INR"];

export interface PlanPrice {
  monthly: number;
  yearly: number;
}

export interface PlanInfo {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly active agents included; null = custom. */
  maa: number | null;
  /** null = custom / contact sales. Free is { monthly: 0, yearly: 0 }. */
  prices: Record<Currency, PlanPrice> | null;
  cta: string;
  highlighted?: boolean;
  badge?: string;
  /** A string ending in "plus:" is a lead-in label (e.g. "Everything in Free, plus:"). */
  highlights: string[];
}

/**
 * Monthly active agent (MAA): a unique agent identity — a Web Bot Auth signer,
 * agent API key, OAuth client or verified crawler — that authenticates at least
 * once in a calendar month. Human visitors are free and unlimited.
 */
export const MAA_DEFINITION =
  "A monthly active agent is a unique agent identity — a signer, API key, OAuth client or verified crawler — that authenticates at least once in a month. Human visitors are always free.";

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Authenticate your first agents.",
    maa: 1_000,
    prices: { USD: { monthly: 0, yearly: 0 }, INR: { monthly: 0, yearly: 0 } },
    cta: "Start free",
    highlights: [
      "1,000 monthly active agents",
      "Web Bot Auth, verified crawlers & agent API keys",
      "WebMCP & browser agents",
      "Allow or block unverified agents",
      "7-day auth logs",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For products agents already use.",
    maa: 10_000,
    prices: { USD: { monthly: 25, yearly: 250 }, INR: { monthly: 1_999, yearly: 19_990 } },
    cta: "Upgrade to Pro",
    highlighted: true,
    badge: "Most popular",
    highlights: [
      "Everything in Free, plus:",
      "10,000 monthly active agents",
      "OAuth2 agent tokens",
      "Custom allow & block lists",
      "Webhooks",
      "30-day auth logs",
      "Email support",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Enterprise-grade agent identity.",
    maa: 50_000,
    prices: { USD: { monthly: 99, yearly: 990 }, INR: { monthly: 7_999, yearly: 79_990 } },
    cta: "Upgrade to Business",
    highlights: [
      "Everything in Pro, plus:",
      "50,000 monthly active agents",
      "SSO/OIDC, SPIFFE & mTLS agent identity",
      "90-day auth logs & audit export",
      "20 team members",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom volume, SLA and deployment.",
    maa: null,
    prices: null,
    cta: "Contact sales",
    highlights: [
      "Everything in Business, plus:",
      "Custom agent volume",
      "SAML SSO for your team",
      "99.9% uptime SLA",
      "Dedicated support & onboarding",
      "Private deployment options",
    ],
  },
];

export interface MatrixGroup {
  group: string;
  rows: { label: string; tip?: string; values: [Cell, Cell, Cell, Cell] }[];
}

export const WEB_BOT_AUTH_TIP =
  "Cryptographically signed agent requests (IETF Web Bot Auth / RFC 9421) — how OpenAI's ChatGPT agent and other signed agents prove who they are.";
export const CRAWLER_TIP =
  "Search and AI crawlers verified by forward-confirmed reverse DNS, so a spoofed user agent never passes as Googlebot.";

export const MATRIX: MatrixGroup[] = [
  {
    group: "Usage",
    rows: [
      { label: "Monthly active agents", values: ["1,000", "10,000", "50,000", "Custom"] },
      { label: "Sites", values: ["1", "3", "10", "Unlimited"] },
      { label: "Auth log retention", values: ["7 days", "30 days", "90 days", "Custom"] },
      { label: "Team members", values: ["1", "5", "20", "Unlimited"] },
    ],
  },
  {
    group: "Authentication methods",
    rows: [
      { label: "Web Bot Auth (signed agents)", tip: WEB_BOT_AUTH_TIP, values: [true, true, true, true] },
      { label: "Verified crawlers", tip: CRAWLER_TIP, values: [true, true, true, true] },
      { label: "Agent API keys", values: [true, true, true, true] },
      { label: "WebMCP & browser agents", values: [true, true, true, true] },
      { label: "OAuth2 agent tokens", values: [false, true, true, true] },
      { label: "SSO / OIDC agent identity", values: [false, false, true, true] },
      { label: "SPIFFE & mTLS", values: [false, false, true, true] },
    ],
  },
  {
    group: "Access rules & sessions",
    rows: [
      { label: "Allow / block unverified agents", values: [true, true, true, true] },
      { label: "Custom allow & block lists", values: [false, true, true, true] },
      { label: "Auth logs & sessions", values: [true, true, true, true] },
      { label: "Webhooks", values: [false, true, true, true] },
      { label: "Audit log export", values: [false, false, true, true] },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Support", values: ["Community", "Email", "Priority", "Dedicated"] },
      { label: "Uptime SLA", values: [false, false, false, "99.9%"] },
      { label: "SAML SSO for your team", values: [false, false, false, true] },
    ],
  },
];

/** Format a price for display, e.g. "$25", "₹1,999". */
export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ------------------------------ product overview ------------------------------ */

export const PRODUCT_OVERVIEW = {
  name: "Agentronics",
  tagline: "Authentication for AI agents. Know which agents are real.",
  what: "Agentronics is authentication for AI agents: it verifies every agent on your site — signed agents, crawlers, API agents and browser agents — with any method, and lets you decide what each one can do. A middleware does the verification; a console shows every agent sign-in.",
  webmcp:
    "WebMCP (navigator.modelContext) lets a page expose typed tools to visiting agents. Agentronics authenticates WebMCP and other in-page agents with its browser SDK, alongside the server middleware for agents that never run your JavaScript.",
  sdk: "The Agentronics SDK is Apache-2.0. `@agentronics/sdk/server` and `@agentronics/sdk/next` add agent-authentication middleware for Next.js, Express and any Fetch runtime; the browser SDK covers in-page agents.",
  methods: [
    "Web Bot Auth (RFC 9421 signed requests)",
    "Agent API keys",
    "Verified crawlers (forward-confirmed reverse DNS)",
    "OAuth2 client-credentials tokens",
    "SSO / OIDC",
    "SPIFFE",
    "mTLS",
    "WebMCP & browser agents",
  ],
  howItWorks: [
    {
      title: "The agent presents proof",
      body: "A signed request, an API key, an OAuth2 token — or just a user agent claiming to be a crawler.",
    },
    {
      title: "Agentronics verifies it",
      body: "Signatures against the signer's published keys, tokens against your issuer, crawler claims against reverse DNS.",
    },
    {
      title: "You decide",
      body: "Verified agents get in with their identity attached; unverified ones are allowed and logged, or blocked.",
    },
  ],
  links: {
    home: "/",
    pricing: "/pricing",
    docs: "/docs",
    bookDemo: "/book",
    signUp: "/sign-up",
  },
} as const;

/* --------------------------------- docs index --------------------------------- */

export interface DocLink {
  title: string;
  path: string;
  summary: string;
  keywords: string[];
}

export const DOCS_LINKS: DocLink[] = [
  {
    title: "Quickstart",
    path: "/docs/getting-started",
    summary: "Add the middleware and verify your first agent in five minutes.",
    keywords: ["start", "getting started", "quickstart", "install", "setup", "begin", "middleware"],
  },
  {
    title: "Authentication methods",
    path: "/docs/auth/overview",
    summary: "Every way an agent can prove who it is, by plan.",
    keywords: ["auth", "authentication", "methods", "verify", "identity"],
  },
  {
    title: "Web Bot Auth",
    path: "/docs/auth/web-bot-auth",
    summary: "Verify cryptographically signed agent requests (RFC 9421).",
    keywords: ["web bot auth", "signature", "signed", "rfc 9421", "http message signatures", "chatgpt"],
  },
  {
    title: "Agent API keys",
    path: "/docs/auth/api-keys",
    summary: "Issue keys to your agents and verify them on every request.",
    keywords: ["api key", "keys", "agk", "token", "bearer"],
  },
  {
    title: "Verified crawlers",
    path: "/docs/auth/verified-crawlers",
    summary: "Tell real Googlebot from scrapers using reverse DNS.",
    keywords: ["crawler", "googlebot", "bingbot", "bot", "reverse dns", "spoof", "user agent"],
  },
  {
    title: "OAuth2",
    path: "/docs/auth/oauth2",
    summary: "Verify client-credentials tokens from your identity provider.",
    keywords: ["oauth", "oauth2", "jwt", "token", "issuer", "scopes"],
  },
  {
    title: "WebMCP & browser agents",
    path: "/docs/auth/browser-agents",
    summary: "Authenticate agents operating your pages.",
    keywords: ["webmcp", "browser", "modelcontext", "in-page", "react"],
  },
  {
    title: "Access rules",
    path: "/docs/access-rules",
    summary: "Block unverified agents; keep allow and block lists.",
    keywords: ["rules", "block", "allow", "allowlist", "blocklist", "access", "authorization"],
  },
  {
    title: "Auth logs & sessions",
    path: "/docs/auth-logs",
    summary: "Every agent sign-in and why it passed or failed.",
    keywords: ["logs", "sessions", "audit", "events", "console", "dashboard"],
  },
];
