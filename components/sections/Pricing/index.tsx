"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Users, Building2 } from "lucide-react";
import { EyebrowPill } from "@/components/layout/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Spec 09C — Pricing. Layout is complete; PRICES + FEATURE LISTS are intentional
 * placeholders (pricing not yet decided). Fill `price`/`features` per plan when
 * the numbers are confirmed.  TODO: confirm pricing
 */
interface Plan {
  name: string;
  sub: string;
  Icon: typeof Rocket;
  cta: string;
  featureCount: number;
  popular?: boolean;
}

const PLANS: Plan[] = [
  { name: "Starter", sub: "Best for trying WebMCP", Icon: Rocket, cta: "Start free", featureCount: 4 },
  { name: "Team", sub: "Growing agent traffic", Icon: Users, cta: "Start free trial", featureCount: 6, popular: true },
  { name: "Business", sub: "Established platforms", Icon: Building2, cta: "Contact sales", featureCount: 6 },
];

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
                20% off
              </span>
            </span>
          </SegBtn>
        </div>
        <p className="mt-3 font-mono text-xs uppercase tracking-caps text-content-muted">
          Plans, pricing &amp; features are being finalized
        </p>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inViewOnce}
        className="mx-auto mt-12 grid max-w-content grid-cols-1 gap-5 md:grid-cols-3"
      >
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} yearly={yearly} />
        ))}
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

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const dark = plan.popular;
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "relative flex flex-col rounded-xl border p-6",
        dark ? "border-transparent bg-neutral-950 text-white" : "border-border bg-surface",
      )}
      style={dark ? { boxShadow: "0 20px 60px -24px var(--brand)" } : undefined}
    >
      {plan.popular && (
        <div className="absolute right-5 top-5">
          <Badge tone="brand">Most popular</Badge>
        </div>
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
        {plan.sub}
      </p>

      {/* price — placeholder until confirmed */}
      <div className="mt-6 flex items-end gap-1">
        <span className={cn("font-sans text-4xl font-extrabold tracking-display", dark ? "text-white" : "text-content")}>
          $—
        </span>
        <span className={cn("mb-1 text-base", dark ? "text-[#8b93a4]" : "text-content-muted")}>
          /{yearly ? "year" : "month"}
        </span>
      </div>

      <Button variant={dark ? "primary" : "ghost"} fullWidth className="mt-6">
        {plan.cta}
      </Button>

      {/* features — placeholder skeleton rows (TODO: confirm feature list) */}
      <ul className="mt-6 space-y-3">
        {Array.from({ length: plan.featureCount }).map((_, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dark ? "bg-white/30" : "bg-border-strong")} />
            <span
              className={cn("h-2.5 rounded-pill", dark ? "bg-white/10" : "bg-surface-raised border border-border")}
              style={{ width: `${55 + ((i * 13) % 35)}%` }}
            />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
