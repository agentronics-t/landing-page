import { HeroTraces } from "@/components/brand/Traces";
import { ScanForm } from "@/components/scan/ScanForm";

/** §1 Hero — PCB Black. One primary action: the URL box. Traces run in from both edges to it. */
export function Hero() {
  return (
    <section className="tone-dark relative overflow-hidden px-4 pb-24 pt-36 sm:px-[clamp(20px,5vw,48px)] md:pb-32 md:pt-44">
      <HeroTraces className="opacity-90" />
      <div className="relative mx-auto max-w-[820px] text-center">
        <h1 className="font-display text-[40px] font-bold leading-[1.08] tracking-display sm:text-[52px] md:text-5xl">
          Make your website ready for <span className="text-verdigris">AI agents</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-[620px] text-lg text-content-secondary">
          AI assistants now browse, compare and buy for your customers. Agentronics makes sure they can understand and use
          your site.
        </p>
        <ScanForm id="scan" className="mx-auto mt-10 max-w-[620px] text-left" />
      </div>
    </section>
  );
}
