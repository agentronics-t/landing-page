import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Plans } from "@/components/site/Plans";
import { FinalCta } from "@/components/site/FinalCta";
import { MATRIX, PLANS, type Cell } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Pricing: Agentronics",
  description:
    "Start free with your Agent Readiness Score and Agent Nic. Starter $19/mo (most popular) and Pro $49/mo add more fix rounds, agent actions, rules and history. Enterprise plans are custom.",
};

const cell = (v: Cell) => (v === true ? "✓" : v === false ? "–" : v);

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <section className="section pricing page-top" aria-labelledby="pricing-title">
          <div className="wrap">
            <div className="section-head section-head--center" data-reveal>
              <p className="eyebrow">Pricing</p>
              <h1 className="h2" id="pricing-title">
                Start free. Upgrade when agents <span className="mark">start bringing you business.</span>
              </h1>
              <p className="sub">Every plan includes Agent Nic.</p>
            </div>

            <Plans />

            <p className="pricing__note" data-reveal>
              Prices in USD, billed monthly. Merged fixes stay in your code, even if you cancel.
            </p>
            <p className="pricing__limits">
              Limits never block agents: at a limit your site keeps working and we stop recording until next month.
            </p>

            <div className="compare" data-reveal>
              <h2 className="compare__title">Compare every feature</h2>
              <div className="compare__scroll">
                <table>
                  <caption className="visually-hidden">Full plan comparison</caption>
                  <thead>
                    <tr>
                      <th scope="col">Feature</th>
                      {PLANS.map((p) => (
                        <th key={p.id} scope="col">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {MATRIX.map((g) => (
                    <tbody key={g.group}>
                      <tr className="compare__group">
                        <th scope="colgroup" colSpan={5}>
                          {g.group}
                        </th>
                      </tr>
                      {g.rows.map((r) => (
                        <tr key={r.label}>
                          <th scope="row" title={r.tip}>
                            {r.label}
                          </th>
                          {r.values.map((v, i) => (
                            <td key={i}>{cell(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
            </div>
          </div>
        </section>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
