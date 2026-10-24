"use client";

import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { PLANS, type PlanInfo } from "@/lib/catalog";
import { useInView } from "@/lib/useInView";
import { cn } from "@/lib/cn";

/**
 * The four plans from lib/catalog (mirrors the limits the console enforces).
 * Spec v3 §3.9: Starter is "Most popular" — taller, a 2px Copper border, the
 * only solid Copper CTA; the rest are outlined. On phones it's a snap
 * carousel that opens on Starter.
 */
export function PlanCards({ className }: { className?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView<HTMLDivElement>({ amount: 0.2 });

  useEffect(() => {
    const el = scroller.current;
    const card = el?.querySelector<HTMLElement>("[data-highlighted]");
    if (el && card && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
    }
  }, []);

  return (
    <div ref={ref} className={className}>
      <div
        ref={scroller}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-6 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 xl:grid-cols-4 xl:items-start"
      >
        {PLANS.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} index={i} shown={inView} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan, index, shown }: { plan: PlanInfo; index: number; shown: boolean }) {
  const price = plan.priceMonthly;
  const star = !!plan.highlighted;
  // stagger rise; the highlighted plan lands last, a touch larger
  const order = star ? PLANS.length : index;
  return (
    <div
      data-highlighted={star || undefined}
      className={cn(
        "relative flex w-[84%] shrink-0 snap-center flex-col rounded-[16px] bg-surface p-7 md:w-auto",
        star ? "border-2 border-copper shadow-raise xl:py-10" : "border border-border",
      )}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? (star ? "scale(1.03)" : "none") : "translateY(16px)",
        transition: `opacity var(--dur-slow) var(--ease-out) ${order * 80}ms, transform var(--dur-slow) var(--ease-out) ${order * 80}ms`,
      }}
    >
      {plan.badge && (
        <span
          className="absolute -top-3.5 left-7 overflow-hidden rounded-pill bg-copper px-3 py-1 text-xs font-semibold text-pcb"
          style={{
            backgroundImage: "linear-gradient(110deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%)",
            backgroundSize: "200% 100%",
            backgroundRepeat: "no-repeat",
            animation: shown ? "shine var(--dur-slower) var(--ease-out) 600ms 1 both" : undefined,
          }}
        >
          ★ {plan.badge}
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

      <ButtonLink
        href={plan.id === "enterprise" ? "/book" : "/sign-up"}
        variant={star ? "primary" : "outline"}
        fullWidth
        className="mt-6"
        onClick={() => track("plan_click", { plan: plan.id })}
      >
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
