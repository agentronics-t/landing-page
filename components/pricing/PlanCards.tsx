import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { PLANS, type PlanInfo } from "@/lib/catalog";
import { cn } from "@/lib/cn";

/**
 * The four plans from lib/catalog (mirrors the limits the console enforces).
 * Pro is the highlighted middle tier: a PCB Black card with "Most popular".
 * Every tier gets a Copper CTA (guide §7).
 */
export function PlanCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4", className)}>
      {PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: PlanInfo }) {
  const price = plan.priceMonthly;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-7",
        plan.highlighted ? "tone-dark border-transparent shadow-raise xl:-my-3 xl:py-10" : "border-border bg-surface",
      )}
    >
      {plan.badge && (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-pill border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-caps text-verdigris">
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
          {plan.badge}
        </span>
      )}
      <h3 className="font-display text-xl font-bold text-content">{plan.name}</h3>
      <p className="mt-1 min-h-[48px] text-base text-content-secondary">{plan.tagline}</p>

      <div className="mt-5 flex items-end gap-1">
        <span className={cn("font-display font-bold tracking-display text-content", price === null ? "text-[34px]" : "text-[44px] leading-none")}>
          {price === null ? "Custom" : `$${price}`}
        </span>
        {price !== null && <span className="mb-1 text-base text-content-muted">/month</span>}
      </div>

      <ButtonLink href={plan.id === "enterprise" ? "/book" : "/sign-up"} fullWidth className="mt-6">
        {plan.cta}
      </ButtonLink>

      <ul className="mt-7 space-y-3">
        {plan.highlights.map((item) =>
          item.endsWith("plus:") ? (
            <li key={item} className="text-sm font-medium text-content-muted">
              {item}
            </li>
          ) : (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-bg text-success" aria-label="Included">
                <Check size={12} strokeWidth={3} aria-hidden />
              </span>
              <span className="text-sm text-content-secondary">{item}</span>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
