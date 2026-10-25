import { PLANS } from "@/lib/catalog";

/** The home page's Monthly / Yearly switch (styles in home-assets/styles.css; pure CSS). */
export function BillingSwitch() {
  return (
    <div className="billing" role="radiogroup" aria-label="Billing period">
      <input type="radio" name="billing" id="bill-month" defaultChecked />
      <label htmlFor="bill-month">Monthly</label>
      <input type="radio" name="billing" id="bill-year" />
      <label htmlFor="bill-year">
        Yearly <span className="billing__save">Save 21%</span>
      </label>
    </div>
  );
}

/** The four plan cards from the home page's pricing section, rendered from lib/catalog. */
export function Plans() {
  return (
    <div className="plans">
      {PLANS.map((p) => (
        <article key={p.id} className={p.highlighted ? "plan plan--hot" : "plan"} data-reveal>
          {p.badge && <span className="plan__badge">{p.badge}</span>}
          <h3 className="plan__name">{p.name}</h3>
          <p className="plan__for">{p.tagline}</p>
          <p className="plan__price">
            <b className={p.priceYearly ? "per-month" : undefined}>{p.priceMonthly === null ? "Custom" : `$${p.priceMonthly}`}</b>
            {!!p.priceYearly && <b className="per-year">${Math.round((p.priceYearly / 12) * 100) / 100}</b>}
            {!!p.priceMonthly && <span>/month</span>}
          </p>
          {!!p.priceYearly && <p className="plan__billed per-year">${p.priceYearly} billed yearly</p>}
          <a className={`${p.highlighted ? "btn btn--go" : "btn btn--line"}${p.priceYearly ? " per-month" : ""}`} href={p.href} data-plan={p.id}>
            {p.cta}
          </a>
          {!!p.priceYearly && (
            <a className={`${p.highlighted ? "btn btn--go" : "btn btn--line"} per-year`} href={`${p.href}&interval=year`} data-plan={`${p.id}-yearly`}>
              {p.cta}
            </a>
          )}
          <ul className="plan__list">
            {p.highlights.map((h, i) => (
              <li key={h}>{i < (p.bold ?? 0) ? <b>{h}</b> : h}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
