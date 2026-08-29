/**
 * The Agentronics site's WebMCP tools. Pure definitions — `buildTools` takes a
 * `navigate` callback so the action tools stay decoupled from Next's router.
 * All product data comes from lib/catalog (the same source the pricing UI
 * renders), so tool answers and the page can never disagree.
 */

import {
  PLANS,
  MATRIX,
  PRODUCT_OVERVIEW,
  DOCS_LINKS,
  YEARLY_DISCOUNT_PCT,
  type PlanId,
  type PlanInfo,
} from "@/lib/catalog";
import type { McpToolResult, WebMcpTool } from "@/lib/webmcp";

function result(text: string, structuredContent?: unknown): McpToolResult {
  return { content: [{ type: "text", text }], structuredContent };
}

function priceLabel(p: PlanInfo): string {
  if (p.priceMonthly === null) return "Custom (contact sales)";
  return `$${p.priceMonthly}/mo (billed yearly $${p.priceYearly}/yr, ${YEARLY_DISCOUNT_PCT}% off)`;
}

function planPublic(p: PlanInfo) {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    priceMonthly: p.priceMonthly,
    priceYearly: p.priceYearly,
    currency: "USD",
    cta: p.cta,
    highlights: p.highlights.filter((h) => !h.endsWith("plus:")),
  };
}

const planById = (id: PlanId) => PLANS.find((p) => p.id === id)!;

const DESTINATIONS: Record<string, string> = {
  home: PRODUCT_OVERVIEW.links.home,
  pricing: PRODUCT_OVERVIEW.links.pricing,
  docs: PRODUCT_OVERVIEW.links.docs,
  book: PRODUCT_OVERVIEW.links.bookDemo,
  "book-demo": PRODUCT_OVERVIEW.links.bookDemo,
  "sign-up": PRODUCT_OVERVIEW.links.signUp,
  signup: PRODUCT_OVERVIEW.links.signUp,
  "sign-in": "/sign-in",
};

export function buildTools(navigate: (path: string) => void): WebMcpTool[] {
  return [
    /* ------------------------------ read tools ------------------------------ */
    {
      name: "get_pricing",
      description:
        "Get Agentronics pricing: all plans with monthly and yearly prices (USD) and headline features. Yearly billing is 16% off.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute() {
        const lines = PLANS.map((p) => `• ${p.name} — ${priceLabel(p)}: ${p.tagline}`).join("\n");
        return result(`Agentronics plans:\n${lines}`, {
          currency: "USD",
          yearlyDiscountPct: YEARLY_DISCOUNT_PCT,
          plans: PLANS.map(planPublic),
        });
      },
    },
    {
      name: "recommend_plan",
      description:
        "Recommend the best-fit Agentronics plan from a customer's needs (monthly agent request volume and which governance features they need), with the price and the reasons.",
      inputSchema: {
        type: "object",
        properties: {
          monthlyAgentRequests: {
            type: "number",
            description: "Expected agent requests per month.",
          },
          needSSO: { type: "boolean", description: "Requires SSO / SAML." },
          needAuthz: {
            type: "boolean",
            description: "Requires scoped authorization (per-agent permissions).",
          },
          needMemory: {
            type: "boolean",
            description: "Requires agent memory & context transfer across sessions.",
          },
          dataSources: {
            description: 'Number of connected data sources, or "all".',
            oneOf: [{ type: "number" }, { type: "string", enum: ["all"] }],
          },
        },
        additionalProperties: false,
      },
      execute(args) {
        const reqs = typeof args.monthlyAgentRequests === "number" ? args.monthlyAgentRequests : 0;
        const needSSO = args.needSSO === true;
        const needAuthz = args.needAuthz === true;
        const needMemory = args.needMemory === true;
        const wantsAll =
          args.dataSources === "all" ||
          (typeof args.dataSources === "number" && args.dataSources > 1);

        const reasons: string[] = [];
        let id: PlanId;
        if (needSSO || reqs > 1_000_000) {
          id = "business";
          if (needSSO) reasons.push("SSO / SAML is Business-only.");
          if (reqs > 1_000_000) reasons.push("Over 1M requests/mo exceeds Team's included volume.");
        } else if (needAuthz || needMemory || wantsAll || reqs > 25_000) {
          id = "team";
          if (needAuthz) reasons.push("Scoped authorization starts at Team.");
          if (needMemory) reasons.push("Agent memory & context transfer starts at Team.");
          if (wantsAll) reasons.push("Multiple / all data sources start at Team.");
          if (reqs > 25_000) reasons.push("Over 25K requests/mo exceeds Starter's included volume.");
        } else {
          id = "starter";
          reasons.push("Single source, core SDK + governance, and volume within 25K/mo fit Starter.");
        }

        const plan = planById(id);
        const text =
          `Recommended plan: ${plan.name} — ${priceLabel(plan)}.\n` +
          `Why: ${reasons.join(" ")}`;
        return result(text, {
          recommendedPlanId: id,
          plan: planPublic(plan),
          reasons,
        });
      },
    },
    {
      name: "compare_features",
      description:
        "Get the full Agentronics plan-by-plan feature comparison matrix (SDK & governance, measurement & analytics, and platform limits) as structured data.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute() {
        const planIds = PLANS.map((p) => p.id);
        const groups = MATRIX.map((g) => ({
          group: g.group,
          rows: g.rows.map((r) => ({
            feature: r.label,
            values: Object.fromEntries(planIds.map((pid, i) => [pid, r.values[i]])),
          })),
        }));
        const text =
          `Feature comparison across ${PLANS.map((p) => p.name).join(", ")}:\n` +
          MATRIX.map(
            (g) => `${g.group}: ${g.rows.map((r) => r.label).join(", ")}`,
          ).join("\n");
        return result(text, { plans: planIds, groups });
      },
    },
    {
      name: "get_product_overview",
      description:
        "Explain what Agentronics is, what WebMCP is, what the SDK does, and how it works in three steps.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute() {
        const o = PRODUCT_OVERVIEW;
        const steps = o.howItWorks.map((s, i) => `${i + 1}. ${s.title} — ${s.body}`).join("\n");
        const text = `${o.name}: ${o.what}\n\nWebMCP: ${o.webmcp}\n\nSDK: ${o.sdk}\n\nHow it works:\n${steps}`;
        return result(text, o);
      },
    },
    {
      name: "search_docs",
      description:
        "Find the most relevant Agentronics documentation pages for a query. Returns doc titles, summaries, and links.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "What you want to find in the docs." },
        },
        required: ["query"],
        additionalProperties: false,
      },
      execute(args) {
        const q = String(args.query ?? "").toLowerCase().trim();
        const terms = q.split(/\s+/).filter(Boolean);
        const scored = DOCS_LINKS.map((doc) => {
          const hay = `${doc.title} ${doc.summary} ${doc.keywords.join(" ")}`.toLowerCase();
          let score = 0;
          for (const t of terms) {
            if (doc.keywords.some((k) => k.includes(t))) score += 3;
            else if (hay.includes(t)) score += 1;
          }
          return { doc, score };
        })
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        const matches = (scored.length ? scored.map((s) => s.doc) : DOCS_LINKS.slice(0, 3)).map(
          (d) => ({ title: d.title, summary: d.summary, url: d.path }),
        );
        const text = scored.length
          ? `Top docs for "${args.query}":\n` +
            matches.map((m) => `• ${m.title} — ${m.summary} (${m.url})`).join("\n")
          : `No exact match for "${args.query}". Start here:\n` +
            matches.map((m) => `• ${m.title} (${m.url})`).join("\n");
        return result(text, { query: args.query, matches });
      },
    },

    /* ----------------------------- action tools ----------------------------- */
    {
      name: "book_demo",
      description:
        "Take the visitor to the Agentronics demo-booking page (Calendly) to schedule a technical demo.",
      inputSchema: {
        type: "object",
        properties: {
          note: { type: "string", description: "Optional context about what to cover." },
        },
        additionalProperties: false,
      },
      execute(args) {
        navigate(PRODUCT_OVERVIEW.links.bookDemo);
        const note = typeof args.note === "string" && args.note.trim() ? ` Note noted: "${args.note.trim()}".` : "";
        return result(
          `Opening the demo-booking page (${PRODUCT_OVERVIEW.links.bookDemo}). Pick a time on the calendar to confirm.${note}`,
          { navigatedTo: PRODUCT_OVERVIEW.links.bookDemo },
        );
      },
    },
    {
      name: "start_signup",
      description: "Take the visitor to the Agentronics sign-up page to create an account.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute() {
        navigate(PRODUCT_OVERVIEW.links.signUp);
        return result(`Opening the sign-up page (${PRODUCT_OVERVIEW.links.signUp}).`, {
          navigatedTo: PRODUCT_OVERVIEW.links.signUp,
        });
      },
    },
    {
      name: "navigate_to",
      description:
        "Navigate the visitor to a page on the Agentronics site: home, pricing, docs, book (demo), sign-up, or sign-in.",
      inputSchema: {
        type: "object",
        properties: {
          destination: {
            type: "string",
            enum: ["home", "pricing", "docs", "book", "sign-up", "sign-in"],
            description: "Where to go.",
          },
        },
        required: ["destination"],
        additionalProperties: false,
      },
      execute(args) {
        const key = String(args.destination ?? "").toLowerCase();
        const path = DESTINATIONS[key];
        if (!path) {
          return result(
            `Unknown destination "${args.destination}". Valid: home, pricing, docs, book, sign-up, sign-in.`,
            undefined,
          );
        }
        navigate(path);
        return result(`Navigating to ${key} (${path}).`, { navigatedTo: path });
      },
    },
  ];
}
