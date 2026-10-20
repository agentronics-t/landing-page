/**
 * Product catalog — the single source of truth for plans, the feature matrix,
 * the product overview, and docs links. Both the Pricing UI
 * (components/sections/Pricing) and the WebMCP tools (components/webmcp) read
 * from here, so an agent calling `get_pricing` can never disagree with what a
 * human sees on the pricing page. Update pricing here.
 */

export type PlanId = "starter" | "team" | "business";
export type Cell = boolean | string;

export const YEARLY_DISCOUNT_PCT = 16;

export interface PlanInfo {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number | null; // null = custom / contact sales
  priceYearly: number | null;
  cta: string;
  highlighted?: boolean;
  badge?: string;
  /** A string ending in "plus:" is a lead-in label (e.g. "Everything in Starter, plus:"). */
  highlights: string[];
}

export const PLANS: PlanInfo[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Serve and govern agents on a single source.",
    priceMonthly: 49,
    priceYearly: 490,
    cta: "Get started",
    highlights: [
      "SDK + WebMCP tool serving",
      "1 connected data source",
      "Agent detection & basic authentication",
      "Basic observability & analytics",
      "25K agent requests / mo",
      "Community support",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "Full governance for growing agent traffic.",
    priceMonthly: 199,
    priceYearly: 1990,
    cta: "Start free trial",
    highlighted: true,
    badge: "Most popular",
    highlights: [
      "Everything in Starter, plus:",
      "All data sources connected",
      "Full auth, authz, memory & context",
      "Full observability & audit trail",
      "1M agent requests / mo",
      "Email support",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Enterprise-grade for established platforms.",
    priceMonthly: null,
    priceYearly: null,
    cta: "Contact sales",
    highlights: [
      "Everything in Team, plus:",
      "Unlimited volume + licensed data enrichment",
      "SSO / SAML + audit-grade export",
      "SLA + dedicated onboarding",
      "Custom data retention",
      "Dedicated support + Slack",
    ],
  },
];

export interface MatrixGroup {
  group: string;
  rows: { label: string; tip?: string; values: [Cell, Cell, Cell] }[];
}

export const DETECTION_TIP =
  "Detection lanes: WebMCP-native (navigator.modelContext), Web Bot Auth–signed agents, and stealth Chromium fingerprinting.";

export const MATRIX: MatrixGroup[] = [
  {
    group: "SDK & governance",
    rows: [
      { label: "SDK / WebMCP tool serving", values: [true, true, true] },
      { label: "Agent detection & fingerprinting", tip: DETECTION_TIP, values: [true, true, true] },
      { label: "Authentication", values: ["Basic", "Full", "Full + SSO"] },
      { label: "Authorization (scoped permissions)", values: [false, true, "Advanced"] },
      { label: "Agent memory & context transfer", values: [false, true, true] },
      { label: "Observability & audit trail", values: ["Basic", "Full", "Audit-grade + export"] },
    ],
  },
  {
    group: "Measurement & analytics",
    rows: [
      { label: "Agent traffic measurement", values: [true, true, true] },
      {
        label: "Connected data sources",
        values: ["1 source", "All (Cloudflare, Profound, Scrunch)", "All + licensed enrichment"],
      },
      { label: "Analytics dashboard", values: ["Basic", "Full", "Full"] },
    ],
  },
  {
    group: "Platform",
    rows: [
      { label: "Agent requests / mo", values: ["25K", "1M", "Unlimited"] },
      { label: "Data retention", values: ["30 days", "90 days", "Custom"] },
      { label: "Team seats", values: ["2", "10", "Unlimited"] },
      { label: "SSO / SAML", values: [false, false, true] },
      { label: "SLA & uptime guarantee", values: [false, false, true] },
      { label: "Dedicated onboarding", values: [false, false, true] },
      { label: "Support", values: ["Community", "Email", "Dedicated + Slack"] },
    ],
  },
];

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
