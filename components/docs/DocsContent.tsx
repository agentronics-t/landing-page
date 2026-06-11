"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Info, KeyRound, Menu, Rocket, X } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { cn } from "@/lib/cn";

const NAV: { group: string; items: string[] }[] = [
  { group: "Getting started", items: ["Introduction", "Installation", "Authentication", "Quickstart guide"] },
  { group: "SDK reference", items: ["Browser client", "React hooks", "Gateway API"] },
  { group: "API docs", items: ["REST endpoints", "Webhooks", "Rate limits"] },
  { group: "Protocols", items: ["WebMCP discovery", "Tool execution", "Observability traces"] },
];

const ACTIVE = "Installation";

export function DocsContent() {
  const [open, setOpen] = useState(false);

  const sidebar = (
    <nav className="space-y-6">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="font-mono text-xs uppercase tracking-caps text-content-muted">{group.group}</p>
          <ul className="mt-3 space-y-1">
            {group.items.map((item) => {
              const isActive = item === ACTIVE;
              return (
                <li key={item}>
                  <Link
                    href="/docs"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-base transition-colors",
                      isActive
                        ? "bg-brand-soft font-medium text-brand"
                        : "text-content-secondary hover:text-content",
                    )}
                  >
                    {item}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)]">
      {/* mobile docs menu trigger */}
      <button
        onClick={() => setOpen(true)}
        className="mb-6 inline-flex items-center gap-2 rounded-md border border-border-strong px-3 py-2 text-base text-content lg:hidden focus-ring"
      >
        <Menu size={16} /> Docs menu
      </button>

      <div className="flex gap-10">
        {/* desktop sidebar */}
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-[240px] shrink-0 overflow-y-auto border-r border-border pr-6 lg:block">
          {sidebar}
        </aside>

        {/* mobile sheet */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-canvas p-6 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-caps text-content-muted">Docs</span>
                <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-md p-2 focus-ring">
                  <X size={20} />
                </button>
              </div>
              {sidebar}
            </motion.div>
          )}
        </AnimatePresence>

        {/* content */}
        <article className="min-w-0 max-w-[960px] flex-1 pb-12">
          <p className="font-mono text-sm text-content-muted">Docs › Getting started › Installation</p>
          <h1 className="mt-3 text-3xl font-bold tracking-display text-content md:text-4xl">Installation</h1>
          <p className="mt-4 text-pretty text-lg text-content-secondary">
            The Agentronics SDK is a browser-side toolkit published to npm as{" "}
            <code className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-sm text-content">
              @agentronics/sdk
            </code>
            . Install it, initialize a client with your publishable key, and start governing agent
            traffic through WebMCP.
          </p>

          <h2 className="mt-10 text-xl font-bold tracking-title text-content">Prerequisites</h2>
          <ul className="mt-4 space-y-2 text-base text-content-secondary">
            <li className="flex gap-2"><span className="text-brand">•</span> Node 20.9+ and a package manager (npm, pnpm, or yarn)</li>
            <li className="flex gap-2"><span className="text-brand">•</span> A bundler or framework that supports ESM (Next.js, Vite, etc.)</li>
            <li className="flex gap-2">
              <span className="text-brand">•</span> A publishable key &amp; site ID from your{" "}
              <Link href="/book" className="text-brand underline-offset-2 hover:underline">
                dashboard settings
              </Link>
            </li>
          </ul>

          {/* info callout */}
          <div
            className="mt-6 flex gap-3 rounded-lg border-l-2 p-4"
            style={{ background: "var(--info-bg)", borderColor: "var(--info)" }}
          >
            <Info size={18} className="mt-0.5 shrink-0" style={{ color: "var(--info)" }} />
            <p className="text-base text-content-secondary">
              <span className="font-semibold text-content">Enterprise environments:</span> private gateway
              deployments and self-hosted control planes are covered in the On-Premises Deployment Guide.
            </p>
          </div>

          <h2 className="mt-10 text-xl font-bold tracking-title text-content">Install</h2>
          <div className="mt-4">
            <CodeBlock
              language="bash"
              filename="terminal"
              code={`# Install the Agentronics browser SDK
npm install @agentronics/sdk`}
            />
          </div>

          <h2 className="mt-10 text-xl font-bold tracking-title text-content">Initialize the client</h2>
          <p className="mt-3 text-base text-content-secondary">
            Initialize once at app startup. The SDK auto-detects your site structure and exposes governed
            WebMCP tools to agents.
          </p>
          <div className="mt-4">
            <CodeBlock
              language="ts"
              filename="app/agentronics.ts"
              code={`import { Agentronics } from "@agentronics/sdk";

const client = Agentronics.init({
  publishableKey: "agtx_pk_…",
  siteId: "your-site",
  policy: "strict",
});

// Verify connectivity
const status = await client.ping();
// { "status": "ok", "latency_ms": 9 }`}
            />
          </div>

          <h2 className="mt-10 text-xl font-bold tracking-title text-content">Next steps</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NextCard Icon={Rocket} title="Quickstart guide" body="Expose your first governed tool to agents." />
            <NextCard Icon={KeyRound} title="Authentication" body="Issue keys and verify agent identity." />
          </div>

          {/* prev / next */}
          <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
            <Link href="/docs" className="group flex flex-col gap-1 text-content-secondary hover:text-content">
              <span className="font-mono text-xs uppercase tracking-caps text-content-muted">Previous</span>
              <span className="flex items-center gap-1 text-base"><ArrowLeft size={15} /> Introduction</span>
            </Link>
            <Link href="/docs" className="group flex flex-col items-end gap-1 text-content-secondary hover:text-content">
              <span className="font-mono text-xs uppercase tracking-caps text-content-muted">Next</span>
              <span className="flex items-center gap-1 text-base">Authentication <ArrowRight size={15} /></span>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

function NextCard({ Icon, title, body }: { Icon: typeof BookOpen; title: string; body: string }) {
  return (
    <Link
      href="/docs"
      className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">
        <Icon size={18} />
      </span>
      <span>
        <span className="block text-base font-semibold text-content">{title}</span>
        <span className="mt-0.5 block text-sm text-content-muted">{body}</span>
      </span>
    </Link>
  );
}
