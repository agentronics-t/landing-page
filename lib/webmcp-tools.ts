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
  MAA_DEFINITION,
  YEARLY_DISCOUNT_PCT,
  formatPrice,
  type PlanId,
  type PlanInfo,
} from "@/lib/catalog";
import type { McpToolResult, WebMcpTool } from "@/lib/webmcp";

function result(text: string, structuredContent?: unknown): McpToolResult {
  return { content: [{ type: "text", text }], structuredContent };
}

function priceLabel(p: PlanInfo): string {
  if (!p.prices) return "Custom (contact sales)";
  if (p.prices.monthly === 0) return "Free";
  return (
    `${formatPrice(p.prices.monthly)}/mo or ${formatPrice(p.prices.yearly)}/yr (USD);` +
    ` yearly is ${YEARLY_DISCOUNT_PCT}% off`
  );
}

function planPublic(p: PlanInfo) {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    monthlyActiveAgents: p.maa,
    prices: p.prices,
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
        "Get Agentronics pricing: plans priced by monthly active agents (MAA), with monthly and yearly prices in USD and headline features. Yearly billing is 16% off.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute() {
        const lines = PLANS.map((p) => `• ${p.name} — ${priceLabel(p)}: ${p.tagline}`).join("\n");
        return result(`Agentronics plans (${MAA_DEFINITION}):\n${lines}`, {
          currency: "USD",
          yearlyDiscountPct: YEARLY_DISCOUNT_PCT,
          maaDefinition: MAA_DEFINITION,
          plans: PLANS.map(planPublic),
        });
      },
    },
    {
      name: "recommend_plan",
      description:
        "Recommend the best-fit Agentronics plan from a site's expected monthly active agents (unique agent identities per month) and the authentication features it needs, with the price and the reasons.",
      inputSchema: {
        type: "object",
        properties: {
          monthlyActiveAgents: {
            type: "number",
            description: "Expected unique agent identities authenticating per month.",
          },
          needOAuth2: { type: "boolean", description: "Agents authenticate with OAuth2 client-credentials tokens." },
          needWebhooks: { type: "boolean", description: "Webhooks for agent sign-in events." },
          needEnterpriseIdentity: {
            type: "boolean",
            description: "Agent identity via SSO/OIDC, SPIFFE or mTLS.",
          },
          needSla: { type: "boolean", description: "Contractual uptime SLA or SAML SSO for the team." },
        },
        additionalProperties: false,
      },
      execute(args) {
        const maa = typeof args.monthlyActiveAgents === "number" ? args.monthlyActiveAgents : 0;
        const reasons: string[] = [];
        let id: PlanId;
        if (args.needSla === true || maa > 50_000) {
          id = "enterprise";
          if (args.needSla === true) reasons.push("An SLA and SAML SSO are Enterprise features.");
          if (maa > 50_000) reasons.push("Over 50,000 monthly active agents needs custom volume.");
        } else if (args.needEnterpriseIdentity === true || maa > 10_000) {
          id = "business";
          if (args.needEnterpriseIdentity === true) reasons.push("SSO/OIDC, SPIFFE and mTLS agent identity start at Business.");
          if (maa > 10_000) reasons.push("Over 10,000 monthly active agents exceeds Pro.");
        } else if (args.needOAuth2 === true || args.needWebhooks === true || maa > 1_000) {
          id = "pro";
          if (args.needOAuth2 === true) reasons.push("OAuth2 agent tokens start at Pro.");
          if (args.needWebhooks === true) reasons.push("Webhooks start at Pro.");
          if (maa > 1_000) reasons.push("Over 1,000 monthly active agents exceeds Free.");
        } else {
          id = "free";
          reasons.push("Up to 1,000 monthly active agents with Web Bot Auth, verified crawlers and agent API keys fits Free.");
        }
        const plan = planById(id);
        return result(`Recommended plan: ${plan.name} — ${priceLabel(plan)}.\nWhy: ${reasons.join(" ")}`, {
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
        "Explain what Agentronics is (authentication for AI agents), which authentication methods it supports, and how a verification works in three steps.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      execute() {
        const o = PRODUCT_OVERVIEW;
        const steps = o.howItWorks.map((s, i) => `${i + 1}. ${s.title} — ${s.body}`).join("\n");
        const text = `${o.name}: ${o.what}\n\nMethods: ${o.methods.join(", ")}.\n\nSDK: ${o.sdk}\n\nHow it works:\n${steps}`;
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
        const STOP = new Set(["how", "do", "i", "a", "an", "the", "to", "my", "is", "can", "what", "with", "for", "of", "on", "in", "and", "or"]);
        const terms = q.split(/[^a-z0-9.-]+/).filter((t) => t.length > 1 && !STOP.has(t));
        const hay = (d: (typeof DOCS_LINKS)[number]) => `${d.title} ${d.summary} ${d.keywords.join(" ")}`.toLowerCase();
        // Rarer terms count more (IDF): "googlebot" outweighs "verify", which is on most pages.
        const idf = (t: string) => Math.log(1 + DOCS_LINKS.length / (1 + DOCS_LINKS.filter((d) => hay(d).includes(t)).length));
        const scored = DOCS_LINKS.map((doc) => {
          let score = 0;
          for (const t of terms) {
            if (doc.keywords.some((k) => k.includes(t))) score += 3 * idf(t);
            else if (hay(doc).includes(t)) score += idf(t);
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
