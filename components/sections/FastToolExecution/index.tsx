"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { Logomark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { popIn } from "@/lib/motion";
import { cn } from "@/lib/cn";

const CODE_LINES = [
  `import { Agentronics } from "@agentronics/sdk";`,
  ``,
  `const guard = new Agentronics({ policy: "strict" });`,
  ``,
  `// WebMCP: expose a governed tool to agents`,
  `guard.tool("getOrders", async (query) => {`,
  `  const orders = await db.orders.search(query);`,
  `  return guard.verify(orders);        // → Verified`,
  `});`,
  ``,
  `guard.listen();   // tool calls now logged + governed`,
];

const FEATURES = [
  "Sub-10ms tool calls",
  "Structured results",
  "Full audit log",
  "Policy-gated execution",
];

export function FastToolExecution() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section
      data-screen-label="fast-tool-execution"
      className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-28"
    >
      <div className="mx-auto max-w-content text-center">
        <Eyebrow>Developer experience</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-display text-content md:text-4xl">
          Fast, structured tool calls
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-pretty text-lg text-content-secondary">
          Agents call your tools through WebMCP and get structured results in milliseconds.
        </p>
      </div>

      {/* editor window */}
      <div
        ref={ref}
        className="mx-auto mt-12 max-w-content overflow-hidden rounded-xl border border-white/10 bg-code-bg"
      >
        {/* title bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-2 flex gap-1 text-xs">
            <span className="rounded-md bg-white/10 px-3 py-1 font-mono text-[var(--code-fg)]">App.tsx</span>
            <span className="rounded-md px-3 py-1 font-mono text-[var(--code-comment)]">utils.ts</span>
          </div>
          <span className="ml-auto font-mono text-sm text-[var(--code-comment)]">+</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
          <CodeTyper inView={inView} reduce={!!reduce} />
          <AssistantPanel inView={inView} reduce={!!reduce} />
        </div>
      </div>

      {/* feature row */}
      <div className="mx-auto mt-8 grid max-w-content grid-cols-2 gap-4 md:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f}
            variants={popIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: reduce ? 0 : i * 0.08 }}
            className="flex items-center gap-2"
          >
            <span
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white"
              style={{ background: "var(--success)" }}
            >
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-base text-content-secondary">{f}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CodeTyper({ inView, reduce }: { inView: boolean; reduce: boolean }) {
  const [visible, setVisible] = useState(reduce ? CODE_LINES.length : 0);

  useEffect(() => {
    if (reduce) {
      setVisible(CODE_LINES.length);
      return;
    }
    if (!inView) return;
    setVisible(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVisible(i);
      if (i >= CODE_LINES.length) clearInterval(id);
    }, 260);
    return () => clearInterval(id);
  }, [inView, reduce]);

  return (
    <pre className="overflow-x-auto p-4 font-mono text-base leading-[1.7]">
      <code>
        {CODE_LINES.map((line, i) => {
          const shown = i < visible;
          const isCurrent = i === visible - 1 && visible < CODE_LINES.length;
          return (
            <div key={i} className={cn("flex gap-4 transition-opacity", shown ? "opacity-100" : "opacity-0")}>
              <span className="w-5 shrink-0 select-none text-right text-[var(--code-comment)]">
                {i + 1}
              </span>
              <span className="text-[var(--code-fg)]">
                {renderLine(line)}
                {isCurrent && !reduce && <span className="caret" />}
              </span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}

/** On-palette inline highlight: comments grey, strings indigo, keys amber. */
function renderLine(line: string): React.ReactNode {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("//")) return <span className="text-[var(--code-comment)]">{line}</span>;

  const ci = line.indexOf("//");
  const code = ci >= 0 ? line.slice(0, ci) : line;
  const comment = ci >= 0 ? line.slice(ci) : "";

  const out: React.ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")|([A-Za-z_$][\w$]*)(\s*:)|\b(import|from|const|async|await|return|new)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) out.push(code.slice(last, m.index));
    if (m[1]) out.push(<span key={k++} className="text-[var(--indigo-300)]">{m[1]}</span>);
    else if (m[2]) {
      out.push(<span key={k++} className="text-[var(--code-property)]">{m[2]}</span>);
      out.push(m[3]);
    } else if (m[4]) out.push(<span key={k++} className="text-[var(--indigo-400)]">{m[4]}</span>);
    last = re.lastIndex;
  }
  if (last < code.length) out.push(code.slice(last));
  if (comment) out.push(<span key="c" className="text-[var(--code-comment)]">{comment}</span>);
  return out;
}

function AssistantPanel({ inView, reduce }: { inView: boolean; reduce: boolean }) {
  // 0: nothing, 1: user, 2: typing, 3: assistant
  const [phase, setPhase] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce) {
      setPhase(3);
      return;
    }
    if (!inView) return;
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 2600);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [inView, reduce]);

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 bg-neutral-900 p-4 lg:border-l lg:border-t-0">
      <div className="flex items-center gap-2">
        <Logomark size={18} onDark />
        <span className="font-mono text-sm text-[var(--code-fg)]">AI Assistant</span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {phase >= 1 && (
          <Bubble align="right">How do I expose my orders API to agents safely?</Bubble>
        )}
        {phase === 2 && (
          <div className="flex items-center gap-1 self-start rounded-lg bg-white/5 px-3 py-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white/50"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
        {phase >= 3 && (
          <Bubble align="left">
            Wrap it in a governed WebMCP tool with <code className="text-accent">policy: &quot;strict&quot;</code>.
            I&rsquo;ve scaffolded <code className="text-accent">getOrders</code> with verification and audit
            logging — every agent call is rate-limited and logged. Want me to add approval gating?
          </Bubble>
        )}
      </div>

      <Input placeholder="you@company.com" mono onDark className="mt-2" />
      <Button variant="primary" fullWidth>
        Start building with AI
      </Button>
    </div>
  );
}

function Bubble({ align, children }: { align: "left" | "right"; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
        align === "right"
          ? "self-end bg-brand/20 text-white"
          : "self-start bg-white/5 text-[#cbc7fb]",
      )}
    >
      {children}
    </motion.div>
  );
}
