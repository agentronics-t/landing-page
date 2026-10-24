import { HeroTraces } from "@/components/brand/Traces";
import { ScanForm } from "@/components/scan/ScanForm";

/** §9 Final CTA — PCB Black. The URL box again. */
export function FinalCta() {
  return (
    <section className="tone-dark relative overflow-hidden px-4 py-24 sm:px-[clamp(20px,5vw,48px)] md:py-32">
      <HeroTraces className="opacity-50" />
      <div className="relative mx-auto max-w-[720px] text-center">
        <h2 className="font-display text-[32px] font-bold leading-[1.15] tracking-display md:text-[44px]">
          See what agents see on your site.
        </h2>
        <ScanForm id="scan-bottom" className="mx-auto mt-10 max-w-[620px] text-left" />
      </div>
    </section>
  );
}
