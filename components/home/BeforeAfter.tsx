import { Check, X } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/Section";

/** §3 Before / After — PCB Black. Show, don't explain: the same task, two outcomes. */
export function BeforeAfter() {
  return (
    <Section tone="dark">
      <SectionHeading center eyebrow="Same site, same request" title="What an AI agent sees on your site" />

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {/* before: flat Fog, broken traces */}
        <Panel label="Today" tone="before">
          <AgentAsk>Find the price of the Pro plan and sign me up.</AgentAsk>
          <ul className="mt-5 space-y-3">
            <Line bad>Prices are drawn by JavaScript. The page looks empty.</Line>
            <Line bad>Button &ldquo;&nbsp;&rdquo; has no label. Is it Buy or Close?</Line>
            <Line bad>Sign-up form: 4 fields, no labels.</Line>
          </ul>
          <p className="mt-6 font-mono text-sm text-content-muted">→ Can&apos;t find pricing. Trying another site.</p>
          <BrokenTrace />
        </Panel>

        {/* after: lit copper, verdigris nodes */}
        <Panel label="With Agentronics" tone="after">
          <AgentAsk>Find the price of the Pro plan and sign me up.</AgentAsk>
          <ul className="mt-5 space-y-3 font-mono text-sm">
            <Tool name="get_pricing()" result="4 plans · Pro $49/mo" />
            <Tool name='start_signup({ plan: "pro" })' result="form filled" />
            <Tool name="confirm()" result="asks you first" />
          </ul>
          <p className="mt-6 font-mono text-sm text-verdigris">→ Done in 3 steps.</p>
          <LiveTrace />
        </Panel>
      </div>
    </Section>
  );
}

function Panel({ label, tone, children }: { label: string; tone: "before" | "after"; children: React.ReactNode }) {
  return (
    <div
      className={
        tone === "before"
          ? "relative overflow-hidden rounded-xl border border-border bg-surface p-6 pb-14 grayscale sm:p-8 sm:pb-14"
          : "relative overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--verdigris)_45%,transparent)] bg-surface p-6 pb-14 sm:p-8 sm:pb-14"
      }
    >
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
        <span className={tone === "after" ? "h-2 w-2 rounded-full bg-verdigris" : "h-2 w-2 rounded-full bg-fog"} aria-hidden />
        {label}
      </p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function AgentAsk({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-border bg-surface-raised px-4 py-3 text-base text-content">
      <span className="mr-2 font-mono text-xs uppercase tracking-caps text-content-muted">Agent</span>
      {children}
    </p>
  );
}

function Line({ children }: { bad?: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-base text-content-secondary">
      <X size={16} className="mt-1 shrink-0 text-content-muted" aria-label="Failed" />
      <span>{children}</span>
    </li>
  );
}

function Tool({ name, result }: { name: string; result: string }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-bg text-success">
        <Check size={12} strokeWidth={3} aria-label="Worked" />
      </span>
      <span className="text-content">{name}</span>
      <span className="text-content-muted">→ {result}</span>
    </li>
  );
}

function BrokenTrace() {
  return (
    <svg viewBox="0 0 400 24" className="absolute inset-x-0 bottom-5 h-6 w-full" preserveAspectRatio="none" aria-hidden>
      <path d="M0 12 H120 M150 12 H230 M262 12 H400" stroke="var(--trace-off)" strokeWidth="1.5" strokeDasharray="0" />
      <circle cx="120" cy="12" r="3.5" fill="var(--trace-off)" />
      <circle cx="262" cy="12" r="3.5" fill="var(--trace-off)" />
    </svg>
  );
}

function LiveTrace() {
  return (
    <svg viewBox="0 0 400 24" className="absolute inset-x-0 bottom-5 h-6 w-full" preserveAspectRatio="none" aria-hidden>
      <path d="M0 12 H400" stroke="var(--copper)" strokeWidth="1.5" />
      {[80, 200, 320].map((x) => (
        <circle key={x} cx={x} cy="12" r="4" fill="var(--verdigris)" />
      ))}
    </svg>
  );
}
