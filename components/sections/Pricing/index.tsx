"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Check, Minus, Rocket, Sparkles, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";
import {
  MAA_DEFINITION,
  MATRIX,
  PLANS,
  YEARLY_DISCOUNT_PCT,
  formatPrice,
  type Cell,
  type Cycle,
  type PlanId,
  type PlanInfo,
} from "@/lib/catalog";

/**
 * Pricing — Monthly Active Agent (MAA) tiers. Plan + matrix data lives in
 * lib/catalog (shared with the WebMCP pricing tools, so an agent can never
 * disagree with the page). Pro is the conversion target: centred emphasis and
 * the only solid CTA. All prices are USD. Paid plans check out in the console (Razorpay) at
 * <console>/billing; Free → sign-up; Enterprise → /book.
 */

const ICONS: Record<PlanId, typeof Rocket> = {
  free: Sparkles,
  pro: Rocket,
  business: Users,
  enterprise: Building2,
};

/** Console origin for checkout, from NEXT_PUBLIC_DASHBOARD_URL (any path on it). */
function consoleOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_DASHBOARD_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function ctaHref(plan: PlanInfo, cycle: Cycle): string {
  if (plan.id === "enterprise") return "/book";
  if (plan.id === "free") return "/sign-up";
  const origin = consoleOrigin();
  if (!origin) return "/sign-up";
  const q = new URLSearchParams({ plan: plan.id, cycle });
  return `${origin}/billing?${q.toString()}`;
}

/* --------------------------------- section -------------------------------- */

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section
      id="pricing"
      data-screen-label="pricing"
      className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-content text-center">
        <h2 className="text-3xl font-bold tracking-display text-content md:text-4xl">
          Pricing that grows with your agent traffic
        </h2>
        <p className="mx-auto mt-4 max-w-[620px] text-pretty text-lg text-content-secondary">
          Pay for the agents that authenticate, not for your human visitors. Start free — upgrade
          when agents become a real share of your traffic.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {/* Monthly / Yearly */}
          <div className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
            <SegBtn active={cycle === "monthly"} onClick={() => setCycle("monthly")}>
              Monthly
            </SegBtn>
            <SegBtn active={cycle === "yearly"} onClick={() => setCycle("yearly")}>
              <span className="flex items-center gap-2">
                Yearly
                <span className="rounded-pill bg-brand-soft px-1.5 py-0.5 font-mono text-xs text-brand">
                  {YEARLY_DISCOUNT_PCT}% off
                </span>
              </span>
            </SegBtn>
          </div>
        </div>
      </div>

      {/* plan cards — Pro dominant */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto mt-12 grid max-w-[1240px] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        {PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} />
        ))}
      </motion.div>

      <p className="mx-auto mt-6 max-w-[720px] text-center text-sm text-content-muted">
        {MAA_DEFINITION} Prices are in US dollars and exclude applicable taxes. Payments are processed securely by
        Razorpay.
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
      type="button"
      onClick={onClick}
      aria-pressed={active}
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

function PlanCard({ plan, cycle }: { plan: PlanInfo; cycle: Cycle }) {
  const dark = !!plan.highlighted;
  const Icon = ICONS[plan.id];
  const price = plan.prices ? plan.prices[cycle] : null;
  const perMonthYearly = plan.prices && cycle === "yearly" && price ? Math.round(price / 12) : null;

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
      <p className={cn("mt-1 min-h-12 text-base", dark ? "text-[#b6bcca]" : "text-content-secondary")}>
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
          {price === null ? "Custom" : formatPrice(price)}
        </span>
        {price !== null && price > 0 && (
          <span className={cn("mb-1 text-base", dark ? "text-[#8b93a4]" : "text-content-muted")}>
            /{cycle === "yearly" ? "year" : "month"}
          </span>
        )}
      </div>
      <p className={cn("mt-1 min-h-5 text-sm", dark ? "text-[#8b93a4]" : "text-content-muted")}>
        {perMonthYearly !== null
          ? `${formatPrice(perMonthYearly)}/month, billed yearly`
          : price === 0
            ? "Free forever"
            : ""}
      </p>

      {/* CTA — Pro is the only solid action; the rest recede */}
      <div className="mt-5">
        <ButtonLink
          href={ctaHref(plan, cycle)}
          prefetch={false}
          variant={dark ? "primary" : "ghost"}
          fullWidth
          glow={dark}
          onDark={dark}
        >
          {plan.cta}
        </ButtonLink>
      </div>

      {/* highlights */}
      <ul className="mt-7 space-y-3.5">
        {plan.highlights.map((item) =>
          item.endsWith("plus:") ? (
            <li
              key={item}
              className={cn("text-sm font-medium", dark ? "text-white/60" : "text-content-muted")}
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
          ),
        )}
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
      <table className="w-full min-w-[760px] border-collapse text-left">
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
                colSpan={PLANS.length + 1}
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
