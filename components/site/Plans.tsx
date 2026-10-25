import { PLANS } from "@/lib/catalog";

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
            <b>{p.priceMonthly === null ? "Custom" : `$${p.priceMonthly}`}</b>
            {!!p.priceMonthly && <span>/month</span>}
          </p>
          <a className={p.highlighted ? "btn btn--go" : "btn btn--line"} href={p.href} data-plan={p.id}>
            {p.cta}
          </a>
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
