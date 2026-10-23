"use client";

import { motion } from "framer-motion";
import { Building2, Check, Minus, Rocket, Sparkles, Zap } from "lucide-react";
import { EyebrowPill } from "@/components/layout/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { MATRIX, PLANS, type Cell, type PlanId, type PlanInfo } from "@/lib/catalog";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Pricing (spec: UI/pricing-page.md). Plans and the comparison matrix come
 * from lib/catalog — the same data the site's WebMCP tools answer with, and a
 * mirror of the limits the console enforces. Center-anchor strategy: Pro is
 * the conversion target — "Most popular", dark surface + indigo glow, and the
 * only solid CTA. Free/Starter/Enterprise are rails with ghost CTAs. Billed
 * monthly in USD. Contact sales → /book.
 */

const ICONS: Record<PlanId, typeof Rocket> = {
  free: Sparkles,
  starter: Zap,
  pro: Rocket,
  enterprise: Building2,
};

/* --------------------------------- section -------------------------------- */

export function Pricing() {
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
          Start free. Pay when agents start paying off.
        </h2>
        <p className="mx-auto mt-4 max-w-[620px] text-lg text-content-secondary">
          Every plan includes Agent Nick — we write the WebMCP code into your own site and open a pull request.
        </p>
      </div>

      {/* plan cards — Pro is the dominant card */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto mt-12 grid max-w-[1240px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
      >
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </motion.div>

      <p className="mx-auto mt-6 max-w-[680px] text-center text-sm text-content-muted">
        Prices in USD, billed monthly. Limits never block agents: at a limit your site keeps working and we just stop
        recording until the next month.
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

/* ---------------------------------- cards --------------------------------- */

function PlanCard({ plan }: { plan: PlanInfo }) {
  const dark = !!plan.highlighted;
  const price = plan.priceMonthly;
  const Icon = ICONS[plan.id];

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
        <Icon size={20} />
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
            "font-sans font-extrabold tracking-display",
            price === null ? "text-3xl" : "text-4xl",
            dark ? "text-white" : "text-content",
          )}
        >
          {price === null ? "Custom" : `$${price.toLocaleString("en-US")}`}
        </span>
        {price !== null && (
          <span className={cn("mb-1 text-base", dark ? "text-[#8b93a4]" : "text-content-muted")}>
            /month
          </span>
        )}
      </div>

      {/* CTA — Pro is the only solid action; rails recede */}
      <div className="mt-6">
        {plan.id === "enterprise" ? (
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
