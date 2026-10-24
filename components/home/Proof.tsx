import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/Section";
import { ScanReport } from "@/components/scan/ScanReport";
import { EXAMPLE_REPORT } from "@/lib/scan/example";

/**
 * Our own site, scored by the same scanner before and after we applied its
 * fixes (sitemap, llms.txt, structured data). Measured, not made up: re-run
 * /scan on agentronics.dev to check. Update both numbers if the checks change.
 */
const OWN_SITE = { host: "agentronics.dev", before: 85, after: 100 };

/** §6 Proof — PCB Black. No customers to quote yet, so: real scores only. */
export function Proof() {
  return (
    <Section tone="dark">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Real scores"
            title="We ran it on our own site first."
            lead="Same scan, same twelve checks. We fixed what it found: a sitemap, an llms.txt guide and structured data."
          />
          <div className="mt-10 flex items-end gap-5">
            <Score label="Before" value={OWN_SITE.before} />
            <ArrowRight size={28} className="mb-6 text-copper" aria-hidden />
            <Score label="After" value={OWN_SITE.after} highlight />
          </div>
          <p className="mt-3 font-mono text-xs text-content-muted">{OWN_SITE.host} · October 2026</p>
        </div>

        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-caps text-content-muted">
            A real report, for example.com
          </p>
          <ScanReport report={EXAMPLE_REPORT} compact />
        </div>
      </div>
    </Section>
  );
}

function Score({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-caps text-content-muted">{label}</p>
      <p className={highlight ? "font-display text-[72px] font-bold leading-none text-verdigris" : "font-display text-[72px] font-bold leading-none text-content-muted"}>
        {value}
      </p>
    </div>
  );
}
