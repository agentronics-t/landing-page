"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Check, Eye, Minus, Rocket, Users } from "lucide-react";
import { EyebrowPill } from "@/components/layout/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Pricing (spec: UI/pricing-page.md). Center-anchor strategy: Team is the
 * conversion target — centered, "Most popular", dark surface + indigo glow,
 * and the only solid CTA. Observer/Starter/Business are positioning rails with
 * ghost CTAs. Observer is the intelligence-only tier: dashboard + analytics +
 * forecasting, but no SDK / WebMCP serving (that exclusion is rendered with a
 * muted Minus mark on the card). Full feature-comparison matrix below the
 * cards. Self-serve CTAs open the launching-soon popup (signup isn't live);
 * Contact sales → /book.
 */

type PlanId = "observer" | "starter" | "team" | "business";

interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  Icon: typeof Rocket;
  priceMonthly: number | null; // null = custom
  priceYearly: number | null; // annual = 2 months free
  cta: string;
  highlighted?: boolean;
  badge?: string;
  // string = feature (green check). { label, excluded } = an exclusion, shown
  // with a muted Minus mark. A string ending in "plus:" is a lead-in label.
  highlights: (string | Highlight)[];
}

interface Highlight {
  label: string;
  excluded: true;
}

const PLANS: Plan[] = [
  {
    id: "observer",
    name: "Observer",
    tagline: "Intelligence only — see what agents do on your site.",
    Icon: Eye,
    priceMonthly: 29,
    priceYearly: 290,
    cta: "Get started",
    highlights: [
      "Intelligence dashboard & analytics",
      "Agent traffic measurement",
      "ML forecasting + statistical analysis",
      "Natural-language insights (LLM)",
      "Agent chat (conversational analytics)",
      "1 connected data source",
      { label: "No SDK / WebMCP serving", excluded: true },
      "Email support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Measure agent traffic on a single source.",
    Icon: Rocket,
    priceMonthly: 49,
    priceYearly: 490,
    cta: "Get started",
    highlights: [
      "1 connected data source",
      "SDK + WebMCP tool serving",
      "ML forecasting + statistical analysis",
      "Agent detection & basic authentication",
      "Basic observability",
      "25K agent requests / mo",
      "Community support",
    ],
  },
  {
    id: "team",
    name: "Team",
    tagline: "Full governance for growing agent traffic.",
    Icon: Users,
    priceMonthly: 199,
    priceYearly: 1990,
    cta: "Start free trial",
    highlighted: true,
    badge: "Most popular",
    highlights: [
      "Everything in Starter, plus:",
      "All data sources connected",
      "Natural-language insights + agent chat",
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
    Icon: Building2,
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

/* ----------------------- feature comparison matrix ------------------------ */

type Cell = boolean | string;

interface MatrixGroup {
  group: string;
  rows: { label: string; tip?: string; values: [Cell, Cell, Cell, Cell] }[];
}

const DETECTION_TIP =
  "Detection lanes: WebMCP-native (navigator.modelContext), Web Bot Auth–signed agents, and stealth Chromium fingerprinting.";

const MATRIX: MatrixGroup[] = [
  {
    group: "Measurement & analytics",
    rows: [
      { label: "Agent traffic measurement", values: [true, true, true, true] },
      {
        label: "Connected data sources",
        values: ["1 source", "1 source", "All (Cloudflare, Profound, Scrunch)", "All + licensed enrichment"],
      },
      { label: "ML forecasting", values: [true, true, true, true] },
      { label: "Statistical analysis & anomaly detection", values: [true, true, true, true] },
      { label: "Natural-language insights (LLM)", values: [true, false, true, true] },
      { label: "Agent chat (conversational analytics)", values: [true, false, true, true] },
    ],
  },
  {
    group: "Governance",
    rows: [
      { label: "SDK / WebMCP tool serving", values: [false, true, true, true] },
      { label: "Agent detection & fingerprinting", tip: DETECTION_TIP, values: [false, true, true, true] },
      { label: "Authentication", values: [false, "Basic", "Full", "Full + SSO"] },
      { label: "Authorization (scoped permissions)", values: [false, false, true, "Advanced"] },
      { label: "Agent memory & context transfer", values: [false, false, true, true] },
      { label: "Observability & audit trail", values: [false, "Basic", "Full", "Audit-grade + export"] },
    ],
  },
  {
    group: "Platform",
    rows: [
      { label: "Agent requests / mo", values: [false, "25K", "1M", "Unlimited"] },
      { label: "Data retention", values: ["14 days", "30 days", "90 days", "Custom"] },
      { label: "Team seats", values: ["1", "2", "10", "Unlimited"] },
      { label: "SSO / SAML", values: [false, false, false, true] },
      { label: "SLA & uptime guarantee", values: [false, false, false, true] },
      { label: "Dedicated onboarding", values: [false, false, false, true] },
      { label: "Support", values: ["Email", "Community", "Email", "Dedicated + Slack"] },
    ],
  },
];

/* --------------------------------- section -------------------------------- */

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="pricing"
      data-screen-label="pricing"
      className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-content text-center">
        <div className="flex justify-center">
          <EyebrowPill>Pricing</EyebrowPill>
        </div>
        <h2 className="mt-5 text-3xl font-bold tracking-display text-content md:text-4xl">
          Simple pricing that grows with your team
        </h2>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
          <SegBtn active={!yearly} onClick={() => setYearly(false)}>
            Monthly
          </SegBtn>
          <SegBtn active={yearly} onClick={() => setYearly(true)}>
            <span className="flex items-center gap-2">
              Yearly
              <span className="rounded-pill bg-brand-soft px-1.5 py-0.5 font-mono text-xs text-brand">
                2 months free
              </span>
            </span>
          </SegBtn>
        </div>
      </div>

      {/* plan cards — Team centered + dominant */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto mt-12 grid max-w-[1240px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
      >
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} yearly={yearly} />
        ))}
      </motion.div>

      <p className="mt-6 text-center text-sm text-content-muted">
        Prices in USD. Annual billing saves ~2 months.
      </p>

      {/* feature comparison matrix */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto mt-16 max-w-content"
      >
        <h3 className="text-center text-2xl font-bold tracking-title text-content">
          Compare plans
        </h3>
        <ComparisonTable />
      </motion.div>
    </section>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-pill px-4 py-1.5 text-base transition-colors focus-ring",
        active ? "bg-content text-surface" : "text-content-secondary hover:text-content",
      )}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- cards --------------------------------- */

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const dark = !!plan.highlighted;
  const price = plan.priceMonthly === null ? null : yearly ? plan.priceYearly : plan.priceMonthly;

  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "relative flex flex-col rounded-xl border p-7",
        dark ? "bg-neutral-950 text-white" : "border-border bg-surface",
      )}
      style={
        dark
          ? {
              borderColor: "color-mix(in srgb, var(--brand) 45%, transparent)",
              boxShadow: "0 24px 60px -20px color-mix(in srgb, var(--brand) 45%, transparent)",
            }
          : undefined
      }
    >
      {plan.badge && (
        <span className="absolute right-5 top-5 rounded-pill bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
          {plan.badge}
        </span>
      )}

      <span
        className={cn(
          "grid h-10 w-10 place-items-center rounded-md",
          dark ? "bg-white/10 text-white" : "bg-brand-soft text-brand",
        )}
      >
        <plan.Icon size={20} />
      </span>

      <h3 className={cn("mt-4 text-xl font-bold", dark ? "text-white" : "text-content")}>
        {plan.name}
      </h3>
      <p className={cn("mt-1 text-base", dark ? "text-[#b6bcca]" : "text-content-secondary")}>
        {plan.tagline}
      </p>

      {/* price */}
      <div className="mt-6 flex items-end gap-1">
        <span
          className={cn(
            "font-sans text-4xl font-extrabold tracking-display",
            dark ? "text-white" : "text-content",
          )}
        >
          {price === null ? "Custom" : `$${price.toLocaleString("en-US")}`}
        </span>
        {price !== null && (
          <span className={cn("mb-1 text-base", dark ? "text-[#8b93a4]" : "text-content-muted")}>
            /{yearly ? "year" : "month"}
          </span>
        )}
      </div>

      {/* CTA — Team is the only solid action; rails recede */}
      <div className="mt-6">
        {plan.id === "business" ? (
          <ButtonLink href="/book" variant="ghost" fullWidth onDark={dark}>
            {plan.cta}
          </ButtonLink>
        ) : (
          <ButtonLink href="/sign-up" variant={dark ? "primary" : "ghost"} fullWidth glow={dark}>
            {plan.cta}
          </ButtonLink>
        )}
      </div>

      {/* highlights */}
      <ul className="mt-7 space-y-3.5">
        {plan.highlights.map((item) => {
          // Exclusion — muted Minus mark instead of the green check.
          if (typeof item === "object") {
            return (
              <li key={item.label} className="flex items-start gap-3">
                <span
                  aria-label="not included"
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center",
                    dark ? "text-white/40" : "text-content-muted",
                  )}
                >
                  <Minus size={14} aria-hidden />
                </span>
                <span className={cn("text-base", dark ? "text-white/40" : "text-content-muted")}>
                  {item.label}
                </span>
              </li>
            );
          }
          return item.endsWith("plus:") ? (
            <li
              key={item}
              className={cn(
                "text-sm font-medium",
                dark ? "text-white/60" : "text-content-muted",
              )}
            >
              {item}
            </li>
          ) : (
            <li key={item} className="flex items-start gap-3">
              <span
                aria-label="included"
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                style={{ background: "var(--success-bg)", color: "var(--success)" }}
              >
                <Check size={12} strokeWidth={3} aria-hidden />
              </span>
              <span className={cn("text-base", dark ? "text-[#b6bcca]" : "text-content-secondary")}>
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

/* ------------------------------- comparison ------------------------------- */

function CellValue({ value }: { value: Cell }) {
  if (value === true) {
    return (
      <span
        aria-label="included"
        className="inline-grid h-5 w-5 place-items-center rounded-full"
        style={{ background: "var(--success-bg)", color: "var(--success)" }}
      >
        <Check size={12} strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (value === false) {
    return (
      <span aria-label="not included" className="inline-grid h-5 w-5 place-items-center text-content-muted">
        <Minus size={14} aria-hidden />
      </span>
    );
  }
  return <span className="font-mono text-xs text-content-secondary">{value}</span>;
}

function ComparisonTable() {
  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-5 py-4 text-sm font-medium text-content-muted">
              Features
            </th>
            {PLANS.map((p) => (
              <th
                key={p.id}
                scope="col"
                className={cn(
                  "px-5 py-4 text-center text-sm font-bold",
                  p.highlighted ? "text-brand" : "text-content",
                )}
              >
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        {MATRIX.map((group) => (
          <tbody key={group.group}>
            <tr className="border-b border-border bg-surface-raised">
              <th
                scope="rowgroup"
                colSpan={5}
                className="px-5 py-2.5 font-mono text-xs uppercase tracking-caps text-content-muted"
              >
                {group.group}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <th scope="row" className="px-5 py-3 text-sm font-normal text-content-secondary">
                  {row.tip ? (
                    <span title={row.tip} className="cursor-help underline decoration-dotted underline-offset-4">
                      {row.label}
                    </span>
                  ) : (
                    row.label
                  )}
                </th>
                {row.values.map((v, i) => (
                  <td key={i} className="px-5 py-3 text-center">
                    <CellValue value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
