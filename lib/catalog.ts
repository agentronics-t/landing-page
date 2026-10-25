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
  /** USD per year when billed yearly (21% off twelve months); null = custom. */
  priceYearly: number | null;
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
  /** The plan card's list, word for word as on the home page. The first `bold` items are bold. */
  highlights: string[];
  bold?: number;
}

export const PLANS: PlanInfo[] = [
  {
    id: "free",
    name: "Free",
    tagline: "See your site through an agent’s eyes.",
    priceMonthly: 0,
    priceYearly: 0,
    cta: "Start free",
    href: "/signup?plan=free",
    highlights: [
      "1 site · 1 fix round / month",
      "Up to 5 agent actions",
      "5,000 agent visits / month",
      "7-day history",
      "1 seat · community help",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Make your site agent-ready.",
    priceMonthly: 19,
    priceYearly: 180,
    cta: "Get Starter",
    href: "/signup?plan=starter",
    highlighted: true,
    badge: "★ Most popular",
    bold: 2,
    highlights: [
      "5 fix rounds / month",
      "Auto-fixes + alerts on code changes",
      "Up to 15 actions (page + API)",
      "Agent verification (Web Bot Auth, OAuth 2.1)",
      "5 access rules · procedural memory",
      "50,000 agent visits · 30-day history",
      "2 seats · email help",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Control agents across several sites.",
    priceMonthly: 49,
    priceYearly: 465,
    cta: "Get Pro",
    href: "/signup?plan=pro",
    highlights: [
      "3 sites · 30 fix rounds / month",
      "Unlimited actions",
      "Unlimited rules + rate limits",
      "250,000 visits · 90 days · webhooks",
      "5 seats · priority email",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For large organizations.",
    priceMonthly: null,
    priceYearly: null,
    cta: "Talk to sales",
    href: "/demo",
    highlights: [
      "Unlimited sites, fixes, visits",
      "Audit log + raw trace export",
      "SSO/SAML · unlimited seats",
      "Custom retention",
      "Dedicated support, Slack, SLA",
    ],
  },
];

export interface MatrixGroup {
  group: string;
  rows: { label: string; tip?: string; values: [Cell, Cell, Cell, Cell] }[];
}

export const DETECTION_TIP =
  "WebMCP agents, browser-automation and vision-model agents operating the page, self-declared agents, and search and AI crawlers.";

export const MATRIX: MatrixGroup[] = [
  {
    group: "Agent Nic — we write the code",
    rows: [
      { label: "Sites (repositories)", values: ["1", "1", "3", "Custom"] },
      { label: "Fix rounds / month (scan → pull request)", values: ["1", "5", "30", "Unlimited"] },
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
      { label: "Tool status (callable / failed) + call health", values: [true, true, true, true] },
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
      { label: "Verified crawlers (published IP ranges + reverse DNS)", values: [true, true, true, true] },
      { label: "Agent API keys", values: ["3", "25", "Unlimited", "Unlimited"] },
      { label: "Web Bot Auth (signed requests)", values: [false, true, true, true] },
      { label: "OAuth 2.1 (incl. agents acting for a user)", values: [false, true, true, true] },
    ],
  },
  {
    group: "Authz",
    rows: [
      { label: "Rules: allow / ask first / deny", values: [false, "5", "Unlimited", "Unlimited"] },
      { label: "Per-agent rate limits", values: [false, false, true, true] },
      { label: "On-page (DOM) enforcement", values: [false, false, true, true] },
      { label: "Per-tool access from Agent Nic enforced", values: [false, true, true, true] },
    ],
  },
  {
    group: "Knaph — memory & context",
    rows: [
      { label: "AI-shortened tool descriptions (procedural memory)", values: [false, true, true, true] },
      { label: "Site memory", values: [false, true, true, true] },
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
      { label: "Team members", values: ["1", "2", "5", "Unlimited"] },
      { label: "SSO / SAML for the console", values: [false, false, false, true] },
      { label: "Support", values: ["Community", "Email", "Priority email", "Dedicated + Slack"] },
      { label: "SLA", values: [false, false, false, true] },
    ],
  },
];

/* ------------------------------ product overview ------------------------------ */

export const PRODUCT_OVERVIEW = {
  name: "Agentronics",
  tagline: "Make your website ready for AI agents.",
  what: "AI assistants now browse, compare and buy for people. Agentronics checks how AI agents see a website, fixes what's broken (Agent Nic writes the code and opens a pull request), and lets the site owner see and control what agents do.",
  webmcp:
    "WebMCP is the emerging browser standard (document.modelContext) that lets a page expose typed tools to the AI agents that visit it, so agents call the site's actions directly instead of clicking through the page.",
  sdk: "The Agentronics SDK (npm install @agentronics/sdk) publishes WebMCP tools and detects, authenticates and governs the agents that call them, with every call visible in the console.",
  howItWorks: [
    { title: "Get your score", body: "Paste your URL. In 30 seconds you see your Agent Readiness Score out of 100: what agents can and can't do on your site." },
    { title: "Agent Nic writes the fixes", body: "Our AI agent writes the code and sends it as a pull request: a proposed change you review on GitHub." },
    { title: "You approve. Agents can buy.", body: "Merge it, and agents can read your prices, recommend you and finish tasks." },
  ],
  links: {
    home: "/",
    scan: "/#score",
    pricing: "/pricing",
    developers: "/developers",
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
    path: "/docs/getting-started",
    summary: "Install the SDK, publish your first governed WebMCP tool, and see agents in the console.",
    keywords: ["start", "getting started", "install", "setup", "quickstart", "begin", "sdk", "npm", "init"],
  },
  {
    title: "Tool management",
    path: "/docs/concepts/tool-management",
    summary: "Declare typed WebMCP tools, publish them to document.modelContext, and track their status.",
    keywords: ["webmcp", "tools", "register", "schema", "modelcontext", "expose", "define", "publish"],
  },
  {
    title: "Detection",
    path: "/docs/detection",
    summary: "How WebMCP agents, browser automation, vision-model agents and crawlers are detected.",
    keywords: ["detect", "detection", "bots", "crawlers", "headless", "vision", "automation"],
  },
  {
    title: "Authentication",
    path: "/docs/auth/overview",
    summary: "Verified crawlers, agent API keys, Web Bot Auth and OAuth 2.1.",
    keywords: ["auth", "authentication", "verify", "web bot auth", "oauth", "api key", "identity", "sign"],
  },
  {
    title: "Authorization",
    path: "/docs/authorization",
    summary: "Allow, deny, or ask the person on the page first, per tool and per agent.",
    keywords: ["authz", "authorization", "permissions", "rules", "policies", "review", "deny", "allow"],
  },
  {
    title: "Procedural memory",
    path: "/docs/concepts/procedural-memory",
    summary: "AI-rewritten tool descriptions with token counts, approved in the console.",
    keywords: ["memory", "procedural", "descriptions", "tokens", "knaph", "site memory", "context"],
  },
  {
    title: "Observability",
    path: "/docs/observability",
    summary: "Trace every agent call, see sessions and latency, and export events.",
    keywords: ["observability", "logs", "traces", "audit", "monitoring", "debug", "analytics", "export"],
  },
  {
    title: "Upgrading to 0.7",
    path: "/docs/guides/upgrade-0-7",
    summary: "What changed in SDK 0.7 and how to upgrade without breaking anything.",
    keywords: ["upgrade", "migration", "0.7", "breaking", "compat", "changelog"],
  },
];
