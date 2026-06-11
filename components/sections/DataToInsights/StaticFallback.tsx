import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { Logomark } from "@/components/ui/Logo";

/**
 * Reduced-motion / no-WebGL fallback for spec 02: three bordered tiles
 * Ingestion → Agentronics core → Output, so the message survives without WebGL.
 */
export function StaticFallback() {
  return (
    <section
      data-screen-label="data-to-insights"
      className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-content text-center">
        <Eyebrow>Ingestion → insight</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-display text-content md:text-4xl">
          Data to decisions
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-pretty text-lg text-content-secondary">
          Agentronics turns disparate, unstructured agent traffic into structured, governable
          intelligence.
        </p>

        <div className="mt-14 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <Tile label="Ingestion node">
            <div className="relative h-24 w-full">
              {[
                [20, 30], [55, 18], [78, 44], [38, 62], [66, 70], [12, 74],
              ].map(([l, t], i) => (
                <span
                  key={i}
                  className="absolute h-2 w-2 rounded-full bg-content-muted"
                  style={{ left: `${l}%`, top: `${t}%` }}
                />
              ))}
            </div>
          </Tile>

          <Arrow />

          <Tile label="Agentronics core" emphasized>
            <div className="grid h-24 place-items-center">
              <Logomark size={56} />
            </div>
          </Tile>

          <Arrow />

          <Tile label="Output layer">
            <div className="flex h-24 items-end justify-center gap-2">
              {[40, 64, 90, 52].map((h, i) => (
                <span
                  key={i}
                  className="w-5 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 2 ? "var(--brand)" : "var(--neutral-300)",
                  }}
                />
              ))}
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({
  label,
  emphasized,
  children,
}: {
  label: string;
  emphasized?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        emphasized ? "border-brand bg-brand-soft" : "border-border bg-surface"
      }`}
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-caps text-content-muted">{label}</p>
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden justify-center text-content-muted md:flex">
      <ArrowRight size={20} />
    </div>
  );
}
