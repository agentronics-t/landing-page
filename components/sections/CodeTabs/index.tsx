"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

/** Developer section — the drop-in middleware for each runtime. */

const TABS: { id: string; label: string; file: string; code: string }[] = [
  {
    id: "next",
    label: "Next.js",
    file: "middleware.ts",
    code: `import { agentronicsMiddleware } from '@agentronics/sdk/next'

export default agentronicsMiddleware({
  rules: { unverified: 'block' },
})`,
  },
  {
    id: "express",
    label: "Express",
    file: "server.ts",
    code: `import { expressAgentAuth } from '@agentronics/sdk/server'

app.use(expressAgentAuth({ rules: { unverified: 'block' } }))

app.get('/api/products', (req, res) => {
  // req.agent → { status: 'verified', agent: { id, name, method } }
})`,
  },
  {
    id: "workers",
    label: "Workers",
    file: "worker.ts",
    code: `import { createAgentAuthHandler } from '@agentronics/sdk/server'

const agentAuth = createAgentAuthHandler({ rules: { unverified: 'block' } })

export default {
  async fetch(request: Request) {
    const out = await agentAuth(request)
    return out.blocked ?? fetch(new Request(request, { headers: out.headers }))
  },
}`,
  },
];

export function CodeTabs() {
  const [tab, setTab] = useState(TABS[0]!.id);
  const [copied, setCopied] = useState(false);
  const current = TABS.find((t) => t.id === tab)!;

  return (
    <section data-screen-label="code-tabs" className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-24">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={inViewOnce}>
          <motion.div variants={fadeUp}>
            <Eyebrow>For developers</Eyebrow>
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-4 text-3xl font-bold tracking-display text-content md:text-4xl">
            Five lines of middleware.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-[480px] text-pretty text-lg text-content-secondary">
            Drop it in front of your app and every agent is authenticated before it reaches a route — with the
            verified identity passed along as request headers.
          </motion.p>
          <motion.ul variants={stagger} className="mt-6 space-y-2.5">
            {["Web Bot Auth and verified crawlers on by default", "Runs on Node, edge and Cloudflare Workers", "Typed, open source, no proprietary agent protocol"].map((t) => (
              <motion.li key={t} variants={fadeUp} className="flex items-start gap-3 text-base text-content-secondary">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                  <Check size={12} strokeWidth={3} />
                </span>
                {t}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-raise"
        >
          <div className="flex items-center gap-1 border-b border-white/10 px-3 pt-3" role="tablist" aria-label="Runtime">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={t.id === tab}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-t-md px-3.5 py-2 text-sm font-medium transition-colors focus-ring",
                  t.id === tab ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80",
                )}
              >
                {t.label}
              </button>
            ))}
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(current.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              aria-label="Copy code"
              className="ml-auto mb-1 grid h-8 w-8 place-items-center rounded-md text-white/60 hover:text-white focus-ring"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <div className="px-5 pb-1 pt-3 font-mono text-[11px] text-white/40">{current.file}</div>
          <pre className="overflow-x-auto px-5 pb-6 font-mono text-[13px] leading-relaxed text-white/90">
            <code>{current.code}</code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
