"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { ScanForm } from "@/components/scan/ScanForm";
import { ScanReport } from "@/components/scan/ScanReport";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/layout/Section";
import type { ScanReport as Report } from "@/lib/scan/types";
import { cn } from "@/lib/cn";

const STEPS = [
  "Opening the page the way an agent does, without JavaScript",
  "Reading robots.txt, llms.txt and the sitemap",
  "Checking headings, labels and structured data",
  "Looking for WebMCP tools agents can call",
  "Scoring",
];

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "done"; report: Report };

export function ScanClient() {
  const params = useSearchParams();
  const url = params.get("url") ?? "";
  const [state, setState] = useState<State>({ kind: "idle" });
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!url) return setState({ kind: "idle" });
    let cancelled = false;
    setState({ kind: "loading" });
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2200);
    fetch("/api/scan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) })
      .then(async (res) => {
        const data = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
        if (cancelled) return;
        setState(res.ok ? { kind: "done", report: data as Report } : { kind: "error", message: data.error ?? "Something went wrong." });
      })
      .catch(() => !cancelled && setState({ kind: "error", message: "We couldn't run the check. Check your connection and try again." }))
      .finally(() => clearInterval(timer));
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [url]);

  return (
    <>
      <Section tone="dark" className="pb-14 pt-32 md:pb-16 md:pt-36">
        <div className="mx-auto max-w-[760px] text-center">
          <h1 className="font-display text-[34px] font-bold leading-[1.1] tracking-display md:text-[48px]">
            {state.kind === "done" ? (
              <>How AI agents see {state.report.host}</>
            ) : (
              <>See your site the way AI agents do</>
            )}
          </h1>
          <ScanForm key={url} defaultValue={url} className="mx-auto mt-8 max-w-[640px] text-left" microcopy={state.kind === "done" ? null : undefined} secondary={state.kind === "done"} />
        </div>
      </Section>

      {state.kind !== "idle" && (
        <Section className="pt-12 md:pt-16">
          {state.kind === "loading" && (
            <div className="mx-auto max-w-[560px]" role="status" aria-live="polite">
              <div className="scan-sweep relative h-1 overflow-hidden rounded-pill bg-border" />
              <ul className="mt-8 space-y-4">
                {STEPS.map((s, i) => (
                  <li key={s} className={cn("flex items-center gap-3 text-base", i > step ? "text-content-muted" : "text-content")}>
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                        i < step ? "border-transparent bg-success-bg text-success" : i === step ? "border-copper" : "border-border",
                      )}
                    >
                      {i < step && <Check size={12} strokeWidth={3} aria-hidden />}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {state.kind === "error" && (
            <div className="mx-auto max-w-[560px] rounded-xl border border-border bg-surface p-8 text-center">
              <p className="font-display text-xl font-bold text-content">We couldn&apos;t check that site</p>
              <p className="mt-2 text-content-secondary">{state.message}</p>
            </div>
          )}

          {state.kind === "done" && (
            <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
              <ScanReport report={state.report} />
              <aside className="tone-dark rounded-xl p-6 lg:sticky lg:top-24">
                <p className="font-display text-xl font-bold leading-snug">
                  {state.report.score >= 80 ? "Keep it that way." : "We'll fix this for you."}
                </p>
                <p className="mt-3 text-sm text-content-secondary">
                  Agent Nick reads your code, writes the fixes (WebMCP tools, labels, structured data) and sends them as a pull
                  request. Nothing changes until you approve it.
                </p>
                <ButtonLink href="/book" fullWidth className="mt-6">
                  Fix my site
                  <ArrowRight size={18} aria-hidden />
                </ButtonLink>
                <p className="mt-4 text-xs text-content-muted">
                  Checked {new Date(state.report.scannedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.
                  We read this one page plus robots.txt, llms.txt and the sitemap, the way an agent would.
                </p>
              </aside>
            </div>
          )}
        </Section>
      )}
    </>
  );
}
