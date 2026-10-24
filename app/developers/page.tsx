import type { Metadata } from "next";
import { ArrowRight, BarChart3, Brain, Fingerprint, KeyRound, Radar, Scale, Wrench } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionHeading } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Developers — Agentronics SDK",
  description:
    "The Agentronics SDK: publish WebMCP tools, detect and authenticate AI agents, set allow / review / deny rules, and see every call in the console.",
};

const PILLARS = [
  { icon: Wrench, title: "WebMCP tools", body: "Publish typed tools with document.modelContext. See each tool's status (callable, failed) and token cost per page." },
  { icon: Radar, title: "Detection", body: "WebMCP agents, browser automation, vision-model agents that drive the page by screenshots, self-declared agents and crawlers." },
  { icon: Fingerprint, title: "Authentication", body: "Verified crawlers (published IP ranges + reverse DNS), agent API keys, Web Bot Auth signatures and OAuth 2.1 with delegation." },
  { icon: Scale, title: "Authorization", body: "Allow, deny, or review: ask the person on the page first. Deny makes a tool uncallable; it never blocks browsing." },
  { icon: Brain, title: "Procedural memory", body: "AI-rewritten tool descriptions with before/after token counts. Approve them in the console; the SDK serves them." },
  { icon: BarChart3, title: "Observability", body: "Every detection, auth decision and tool call as a trace: sessions, latency, failures, and export." },
];

const INIT = `import { Agentronics } from '@agentronics/sdk'

const client = Agentronics.init({
  publishableKey: process.env.NEXT_PUBLIC_AGENTRONICS_KEY!,
  siteId: 'shop',
})

client.registerTool({
  name: 'search_products',
  title: 'Search products',
  description: 'Search the catalogue by keyword.',
  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
  annotations: { readOnlyHint: true },
  execute: async ({ query }) => searchCatalogue(query),
})

client.publishToWebMcp() // → document.modelContext.registerTool(…)`;

export default function DevelopersPage() {
  return (
    <>
      <Navbar dark />
      <main>
        <Section tone="dark" className="pt-32 md:pt-40">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
                For developers
              </p>
              <h1 className="mt-4 font-display text-[40px] font-bold leading-[1.08] tracking-display md:text-[52px]">
                The SDK behind <span className="text-verdigris">agent-ready</span> sites.
              </h1>
              <p className="mt-6 max-w-[520px] text-lg text-content-secondary">
                Publish your site&apos;s actions as WebMCP tools, know which agents are calling them, and decide what each one may
                do. Agent Nick writes it for you, or you write it yourself.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/docs" size="lg">
                  Read the docs
                  <ArrowRight size={18} aria-hidden />
                </ButtonLink>
                <ButtonLink href="https://github.com/agentronics-t" variant="outline" size="lg">
                  GitHub
                </ButtonLink>
              </div>
            </div>
            <CodePanel file="app/agentronics.ts" code={INIT} />
          </div>
        </Section>

        <Section>
          <SectionHeading eyebrow="What's in the SDK" title="Six parts, one install." lead="npm install @agentronics/sdk. Every part reports to the same console." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border bg-surface p-6">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Icon size={18} aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-content">{title}</h3>
                <p className="mt-2 text-base text-content-secondary">{body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section tone="dark">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <SectionHeading
              eyebrow="Agent Nick"
              title="Or let Agent Nick write it."
              lead="Connect a GitHub repository. Agent Nick reads your routes and forms, writes the WebMCP tools with the SDK, and opens a pull request. From Starter up, it also fixes CI failures on that pull request."
            />
            <ol className="space-y-4">
              {["Connect a GitHub repository", "Agent Nick proposes tools, page by page", "You review the pull request and merge"].map((s, i) => (
                <li key={s} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-verdigris font-mono text-xs">{i + 1}</span>
                  <span className="text-md text-content">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <Section innerClassName="text-center">
          <h2 className="font-display text-[30px] font-bold tracking-display md:text-3xl">Start with the quickstart.</h2>
          <p className="mx-auto mt-4 max-w-[520px] text-lg text-content-secondary">Five steps from npm install to your first agent call in the console.</p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/docs/getting-started" size="lg">
              Open the quickstart
              <ArrowRight size={18} aria-hidden />
            </ButtonLink>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function CodePanel({ file, code }: { file: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-code-bg">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-verdigris" aria-hidden />
        <span className="font-mono text-xs text-content-muted">{file}</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-[1.7] text-code-fg">
        <code>{code}</code>
      </pre>
    </div>
  );
}
