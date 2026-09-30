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
  tagline: "Stop losing agent traffic. Make your site agent-native.",
  what: "Agentronics is developer-facing infrastructure for the agent web: a WebMCP SDK that lets your site serve structured, governed tools to AI agents, plus a dashboard that governs and observes that traffic.",
  webmcp:
    "WebMCP is the emerging browser standard (navigator.modelContext) that lets a page expose typed tools to the AI agents that visit it — so agents call your capabilities directly instead of scraping the DOM.",
  sdk: "The Agentronics SDK installs via npm or a script tag, auto-detects your site, and lets you declare your capabilities as typed WebMCP tools in a few lines.",
  howItWorks: [
    {
      title: "Expose tools",
      body: "Declare your site's capabilities as typed WebMCP tools — products, orders, bookings — in a few lines of SDK code.",
    },
    {
      title: "Agents load context",
      body: "Visiting agents discover your tools and load them straight into context. No scraping, no guessing, no broken cursors.",
    },
    {
      title: "Act in milliseconds",
      body: "Agents call tools directly and complete tasks on your site in under 10ms — structured, governed, and fully logged.",
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
    title: "Getting started",
    path: "/docs",
    summary: "Install the SDK, connect your site, and serve your first WebMCP tool.",
    keywords: ["start", "getting started", "install", "setup", "quickstart", "begin"],
  },
  {
    title: "SDK installation",
    path: "/docs/sdk/install",
    summary: "Add the Agentronics SDK via npm or a script tag and initialize it.",
    keywords: ["sdk", "install", "npm", "script tag", "init", "initialize", "package"],
  },
  {
    title: "Defining WebMCP tools",
    path: "/docs/webmcp/tools",
    summary: "Declare typed tools with input schemas that agents can call.",
    keywords: ["webmcp", "tools", "register", "schema", "navigator.modelcontext", "expose", "define"],
  },
  {
    title: "Authentication",
    path: "/docs/auth",
    summary: "Verify and authenticate agents connecting to your tools.",
    keywords: ["auth", "authentication", "verify", "web bot auth", "identity", "sign"],
  },
  {
    title: "Authorization & scopes",
    path: "/docs/authz",
    summary: "Scope exactly what each agent is permitted to reach.",
    keywords: ["authz", "authorization", "permissions", "scopes", "access control", "rbac"],
  },
  {
    title: "Memory & context",
    path: "/docs/memory",
    summary: "Carry sessions, preferences, and context across agent visits.",
    keywords: ["memory", "context", "session", "preferences", "knaph", "state"],
  },
  {
    title: "Observability & logs",
    path: "/docs/observability",
    summary: "Trace every agent call and audit outcomes.",
    keywords: ["observability", "logs", "traces", "audit", "monitoring", "debug"],
  },
  {
    title: "Analytics",
    path: "/docs/analytics",
    summary: "Measure agent traffic and understand how agents use your site.",
    keywords: ["analytics", "measure", "traffic", "metrics", "dashboard", "insights"],
  },
];
