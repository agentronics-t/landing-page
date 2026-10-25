import { ScanForm } from "./ScanForm";

/** The home page's lime closing section (`.final`), with the score input. */
export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="wrap final__grid">
        <div>
          <h2 className="h2 final__title" id="final-title">
            Agents are visiting today. Can they use your site?
          </h2>
          <p className="final__sub">
            If they can’t read your prices or finish a signup, they send your customers to a competitor. Find out where you
            stand.
          </p>
          <ScanForm
            className="scanform--final"
            variant="ink"
            ticks={["Score out of 100", "Free", "No signup", "If it’s low, Agent Nic writes the fixes"]}
          />
        </div>
        <div className="final__q" aria-hidden="true">
          <span>?</span>
          <small>/100</small>
        </div>
      </div>
    </section>
  );
}
