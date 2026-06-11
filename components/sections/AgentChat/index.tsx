"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  LifeBuoy, KeyRound, UserPlus, FolderKanban, TrendingUp, Wrench,
  Users, CalendarCheck, FileCheck, GitBranch, Mail, Database,
} from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/cn";

const TILES = [
  { label: "Support tickets", Icon: LifeBuoy },
  { label: "Access requests", Icon: KeyRound },
  { label: "Onboard employees", Icon: UserPlus },
  { label: "Project updates", Icon: FolderKanban },
  { label: "Sales follow-ups", Icon: TrendingUp },
  { label: "IT helpdesk", Icon: Wrench },
  { label: "HR questions", Icon: Users },
  { label: "Meeting summaries", Icon: CalendarCheck },
  { label: "Content reviews", Icon: FileCheck },
  { label: "Approvals & routing", Icon: GitBranch },
  { label: "Email triage", Icon: Mail },
  { label: "Data sync", Icon: Database },
];

interface Msg {
  from: "user" | "agent";
  text: string;
}

const SCRIPT: Msg[] = [
  { from: "user", text: "A new teammate joined today. Create an onboarding checklist and request tool access for them." },
  { from: "agent", text: "What's their role and start date? Also, which tools do they need: Slack, Notion, Jira, or GitHub?" },
  { from: "user", text: "Marketing agent starting today, connected to Slack, Notion, and Jira to coordinate updates." },
  { from: "agent", text: "Got it. I created an onboarding checklist with week-1 tasks and drafted access requests for Slack, Notion, and Jira." },
];

export function AgentChat() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });

  const [activeTile, setActiveTile] = useState(-1);
  useEffect(() => {
    if (reduce || !inView) return;
    const id = setInterval(() => {
      setActiveTile(Math.floor(Math.random() * TILES.length));
    }, 1500);
    return () => clearInterval(id);
  }, [reduce, inView]);

  return (
    <section
      ref={ref}
      data-screen-label="agent-chat"
      className="relative overflow-hidden bg-neutral-950 px-[clamp(20px,5vw,48px)] py-20 text-white md:py-28"
    >
      {/* header */}
      <div className="relative z-10 mx-auto max-w-content text-center">
        <Eyebrow variant="accent">Real-time agent demo</Eyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-display md:text-4xl">
          Live demo of common use cases
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-pretty text-lg text-[#b6bcca]">
          A real-time chat showing how common team workflows are handled from request to completion.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/book" variant="primary" size="lg" glow>
            Get started for free
          </ButtonLink>
          <ButtonLink href="/book" variant="ghost" size="lg" onDark>
            Start with a template
          </ButtonLink>
        </div>
      </div>

      {/* stage: tile grid + chat card */}
      <div className="relative z-10 mx-auto mt-16 max-w-content">
        {/* background tile grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden grid-cols-4 gap-3 opacity-90 md:grid"
        >
          {TILES.map((t, i) => (
            <div
              key={t.label}
              className={cn(
                "flex h-20 items-center gap-2 rounded-2xl border px-3 transition-colors duration-500",
                i === activeTile
                  ? "border-brand bg-brand/10"
                  : "border-white/[0.06] bg-white/[0.03]",
              )}
            >
              <t.Icon size={16} className="text-[#8b93a4]" />
              <span className="text-sm text-[#8b93a4]">{t.label}</span>
            </div>
          ))}
        </div>

        {/* chat card */}
        <div className="relative mx-auto max-w-[480px] py-6">
          <ChatCard inView={inView} reduce={!!reduce} />
        </div>
      </div>

      {/* avatars + stats */}
      <Footer inView={inView} />
    </section>
  );
}

function ChatCard({ inView, reduce }: { inView: boolean; reduce: boolean }) {
  const [shown, setShown] = useState(reduce ? SCRIPT.length : 0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) {
      setShown(SCRIPT.length);
      return;
    }
    if (!inView) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      setShown(0);
      setTyping(false);
      let delay = 600;
      SCRIPT.forEach((msg, i) => {
        if (msg.from === "agent") {
          timers.push(setTimeout(() => !cancelled && setTyping(true), delay));
          delay += 1100;
        }
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setTyping(false);
            setShown(i + 1);
          }, delay),
        );
        delay += 1400;
      });
      // loop after a pause
      timers.push(setTimeout(run, delay + 2500));
    };
    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  return (
    <div
      className="rounded-2xl border border-brand/40 bg-[#0e1017] p-4"
      style={{ boxShadow: "0 0 0 1px color-mix(in srgb, var(--brand) 30%, transparent), 0 20px 60px -20px var(--brand)" }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="text-base font-semibold">Agent conversation</p>
          <p className="font-mono text-xs uppercase tracking-caps text-[#8b93a4]">AI agent ↔ User</p>
        </div>
        <Badge tone="success">Live</Badge>
      </div>

      <div ref={scrollRef} className="flex max-h-[260px] flex-col gap-3 overflow-hidden py-4">
        {SCRIPT.slice(0, shown).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
              msg.from === "user"
                ? "self-end bg-brand/20 text-white"
                : "self-start bg-white/5 text-[#cbc7fb]",
            )}
          >
            {msg.text}
          </motion.div>
        ))}
        {typing && (
          <div className="flex items-center gap-1 self-start rounded-lg bg-white/5 px-3 py-2.5">
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
      </div>

      <p className="border-t border-white/10 pt-3 text-center text-sm text-[#8b93a4]">
        Example workflow: onboarding + access request
      </p>
    </div>
  );
}

function Footer({ inView }: { inView: boolean }) {
  const [wRef, workflows] = useCountUp({ to: 20, suffix: "+" });
  const [fRef, faster] = useCountUp({ to: 10, suffix: "x" });
  const avatars = ["AK", "JL", "MR", "SD", "TP", "NB"];
  const tints = ["var(--brand)", "var(--accent)", "var(--neutral-500)"];

  return (
    <div className="relative z-10 mx-auto mt-14 flex max-w-content flex-col items-center gap-8 sm:flex-row sm:justify-center">
      <div className="flex -space-x-2">
        {avatars.map((a, i) => (
          <span
            key={a}
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-neutral-950 font-mono text-xs font-bold text-accent-content"
            style={{ background: tints[i % tints.length] }}
          >
            {a}
          </span>
        ))}
        {/* TODO: real avatars */}
      </div>
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="font-mono text-2xl font-extrabold text-white">
            <span ref={wRef}>{workflows}</span>
          </div>
          <div className="mt-1 text-sm text-[#8b93a4]">workflows automated</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-2xl font-extrabold text-white">
            <span ref={fRef}>{faster}</span>
          </div>
          <div className="mt-1 text-sm text-[#8b93a4]">faster than manual</div>
        </div>
      </div>
    </div>
  );
}
