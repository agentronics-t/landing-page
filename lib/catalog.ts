/**
 * Product catalog — the single source of truth for plans, the feature matrix,
 * the product overview, and docs links. Both the Pricing UI
 * (components/sections/Pricing) and the WebMCP tools (components/webmcp) read
 * from here, so an agent calling `get_pricing` can never disagree with what a
 * human sees on the pricing page. Update pricing here.
 */

export type PlanId = "free" | "starter" | "pro" | "enterprise";
export type Cell = boolean | string;

// Mirrors Dashboard/packages/intel-schema/src/plans.ts — the limits the console
// and APIs enforce. Change both together.

export interface PlanInfo {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number | null; // null = custom / contact sales
  cta: string;
  highlighted?: boolean;
  badge?: string;
  /** A string ending in "plus:" is a lead-in label (e.g. "Everything in Starter, plus:"). */
  highlights: string[];
}

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    name: "Free",
    tagline: "See your site through an agent's eyes.",
    priceMonthly: 0,
    cta: "Start free",
    highlights: [
      "Agent Nick: 1 site, 1 run / mo, up to 5 form tools",
      "WebMCP tool serving + token-cost estimates",
      "Agent detection (crawlers, WebMCP, browser agents)",
      "Verified crawlers, self-declared agents, 3 API keys",
      "5K agent requests / mo · 7-day history",
      "1 seat · Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Make your site agent-ready.",
    priceMonthly: 19,
    cta: "Get started",
    highlights: [
      "Everything in Free, plus:",
      "Agent Nick: 5 runs / mo, 15 tools incl. page actions & API calls",
      "Automatic CI fixes + code-change alerts",
      "Web Bot Auth & OAuth2 · 25 API keys",
      "Scoped permissions (5 policies) + site memory",
      "50K agent requests / mo · 30-day history",
      "2 seats · Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Govern every agent across your sites.",
    priceMonthly: 49,
    cta: "Get started",
    highlighted: true,
    badge: "Most popular",
    highlights: [
      "Everything in Starter, plus:",
      "Agent Nick: 3 sites, 30 runs / mo, unlimited tools",
      "SSO/OIDC, SPIFFE, mTLS & browser-agent auth",
      "Unlimited policies, rate limits, on-page enforcement",
      "Context transfer between agents",
      "250K agent requests / mo · 90-day history · webhook export",
      "5 seats · Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom limits, SSO and an SLA.",
    priceMonthly: null,
    cta: "Contact sales",
    highlights: [
      "Everything in Pro, plus:",
      "Unlimited sites, runs and agent volume",
      "Custom identity provider",
      "Audit log + raw trace export",
      "SSO / SAML for your team · unlimited seats",
      "Custom retention · SLA · Dedicated support + Slack",
    ],
  },
];

export interface MatrixGroup {
  group: string;
  rows: { label: string; tip?: string; values: [Cell, Cell, Cell, Cell] }[];
}

export const DETECTION_TIP =
  "Search and AI crawlers (verified by reverse DNS), WebMCP agents and in-browser agents operating the page.";

export const MATRIX: MatrixGroup[] = [
  {
    group: "Agent Nick — we write the code",
    rows: [
      { label: "Sites (repositories)", values: ["1", "1", "3", "Custom"] },
      { label: "Runs / month (scan → pull request)", values: ["1", "5", "30", "Unlimited"] },
      { label: "WebMCP tools per site", values: ["5", "15", "Unlimited", "Unlimited"] },
      {
        label: "Tool types",
        values: ["Forms", "Forms, page actions, API calls", "+ Server actions", "All"],
      },
      { label: "Automatic CI fix", values: [false, true, true, true] },
      { label: "Code-change alerts + one-click re-scan", values: [false, true, true, true] },
    ],
  },
  {
    group: "WebMCP tools",
    rows: [
      { label: "Tool serving + registry sync", values: [true, true, true, true] },
      { label: "Token-cost estimate per tool / page", values: [true, true, true, true] },
      { label: "Tool groups + progressive disclosure", values: [false, true, true, true] },
    ],
  },
  {
    group: "Detect",
    rows: [
      { label: "Agent detection", tip: DETECTION_TIP, values: [true, true, true, true] },
      { label: "Agent signature updates", values: ["Monthly", "Weekly", "Live", "Live"] },
    ],
  },
  {
    group: "Auth",
    rows: [
      { label: "Verified crawlers, self-declared agents, X-Agent header", values: [true, true, true, true] },
      { label: "Agent API keys", values: ["3", "25", "Unlimited", "Unlimited"] },
      { label: "Web Bot Auth (signed requests), OAuth2", values: [false, true, true, true] },
      { label: "SSO/OIDC, SPIFFE, mTLS, browser-agent tokens", values: [false, false, true, true] },
      { label: "Custom identity provider", values: [false, false, false, true] },
    ],
  },
  {
    group: "Authz",
    rows: [
      { label: "Scoped permissions (policies)", values: [false, "5", "Unlimited", "Unlimited"] },
      { label: "Per-agent rate limits", values: [false, false, true, true] },
      { label: "On-page (DOM) enforcement", values: [false, false, true, true] },
      { label: "Per-tool access from Agent Nick enforced", values: [false, true, true, true] },
    ],
  },
  {
    group: "Knaph — memory & context",
    rows: [
      { label: "Site memory", values: [false, true, true, true] },
      { label: "Context transfer between agents / sessions", values: [false, false, true, true] },
    ],
  },
  {
    group: "Observability",
    rows: [
      { label: "Agent requests recorded / month", values: ["5K", "50K", "250K", "Custom"] },
      { label: "Data retention", values: ["7 days", "30 days", "90 days", "Custom"] },
      { label: "Logs + analytics", values: [true, true, true, true] },
      { label: "Webhook export", values: [false, false, true, true] },
      { label: "Audit log + raw trace export", values: [false, false, false, true] },
    ],
  },
  {
    group: "Workspace & support",
    rows: [
      { label: "Team seats", values: ["1", "2", "5", "Unlimited"] },
      { label: "SSO / SAML for the console", values: [false, false, false, true] },
      { label: "Support", values: ["Community", "Email", "Priority email", "Dedicated + Slack"] },
      { label: "SLA", values: [false, false, false, true] },
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
