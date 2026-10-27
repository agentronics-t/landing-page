import type { Metadata } from "next";
import { BarChart3, Brain, Fingerprint, Radar, Scale, Wrench } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Developers: the Agentronics SDK",
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

const STEPS = ["Connect a GitHub repository", "Agent Nic proposes tools, page by page", "You review the pull request and merge"];

// [class, text] lines, coloured with the agent log's palette (.term__body .d/.g/.a/.w)
const INIT: [string, string][] = [
  ["w", "import { Agentronics } from '@agentronics/sdk'"],
  ["", ""],
  ["", "const client = Agentronics.init({"],
  ["", "  publishableKey: process.env.NEXT_PUBLIC_AGENTRONICS_KEY!,"],
  ["", "  siteId: 'shop',"],
  ["", "})"],
  ["", ""],
  ["", "client.registerTool({"],
  ["", "  name: 'search_products',"],
  ["", "  title: 'Search products',"],
  ["", "  description: 'Search the catalogue by keyword.',"],
  ["", "  inputSchema: { type: 'object', properties: { query: { type: 'string' } } },"],
  ["", "  annotations: { readOnlyHint: true },"],
  ["", "  execute: async ({ query }) => searchCatalogue(query),"],
  ["", "})"],
  ["", ""],
  ["g", "client.publishToWebMcp()"],
  ["d", "// → document.modelContext.registerTool(…)"],
];

export default function DevelopersPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <section className="hero" aria-labelledby="dev-title">
          <div className="hero__dots" aria-hidden="true" />
          <div className="wrap hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">For developers</p>
              <h1 className="h1" id="dev-title">
                <span className="line">
                  <span className="line__in">The SDK behind</span>
                </span>
                <span className="line">
                  <span className="line__in">
                    <span className="mark">agent-ready</span> sites.
                  </span>
                </span>
              </h1>
              <p className="lede">
                Publish your site’s actions as WebMCP tools, know which agents are calling them, and decide what each one may
                do. Agent Nic writes it for you, or you write it yourself.
              </p>
              <div className="dev-actions">
                <ButtonLink href="/docs" size="lg" arrow>
                  Read the docs
                </ButtonLink>
              </div>
            </div>
            <div className="hero__visual">
              <figure className="term dev-code">
                <div className="term__bar">
                  <span className="duo__dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>app/agentronics.ts</span>
                </div>
                <pre className="term__body">
                  <code>
                    {INIT.map(([c, t], i) => (
                      <span key={i} className={c}>
                        {t}
                        {"\n"}
                      </span>
                    ))}
                  </code>
                </pre>
              </figure>
            </div>
          </div>
        </section>

        <section className="section trust" aria-labelledby="sdk-title">
          <div className="wrap">
            <div className="section-head" data-reveal>
              <p className="eyebrow">What’s in the SDK</p>
              <h2 className="h2" id="sdk-title">
                Six parts, <span className="mark">one install.</span>
              </h2>
              <p className="sub">
                <code>npm install @agentronics/sdk</code>. Every part reports to the same console.
              </p>
            </div>
            <ul className="trust__grid">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <li key={title} data-reveal>
                  <Icon aria-hidden />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section dark" aria-labelledby="nick-title">
          <div className="wrap proof__grid">
            <div className="section-head" data-reveal style={{ marginBottom: 0 }}>
              <p className="eyebrow">Agent Nic</p>
              <h2 className="h2" id="nick-title">
                Or let Agent Nic <span className="mark">write it.</span>
              </h2>
              <p className="sub">
                Connect a GitHub repository. Agent Nic reads your routes and forms, writes the WebMCP tools with the SDK, adds
                a sitemap, llms.txt and structured data if they’re missing, and opens a pull request. From Starter up, it also
                fixes CI failures on that pull request.
              </p>
            </div>
            <ol className="dev-steps">
              {STEPS.map((s, i) => (
                <li key={s} className={i === STEPS.length - 1 ? "step--go" : undefined} data-reveal>
                  <span className="step__n">{i + 1}</span>
                  <h3>{s}</h3>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section how" aria-labelledby="qs-title">
          <div className="wrap">
            <div className="section-head section-head--center" data-reveal style={{ marginBottom: 34 }}>
              <h2 className="h2" id="qs-title">
                Do it yourself, <span className="mark">or let Agent Nic.</span>
              </h2>
              <p className="sub">
                The quickstart takes you from npm install to your first agent call in five steps. Or sign up, and Agent Nic writes it
                into your code and opens a pull request for you to review.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }} data-reveal>
              <ButtonLink href="/docs/getting-started" size="lg" arrow>
                Open the quickstart
              </ButtonLink>
              <ButtonLink href="/signup" variant="line" size="lg">
                Sign up for Agent Nic
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
