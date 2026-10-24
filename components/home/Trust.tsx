"use client";

import { useEffect, useState } from "react";
import { Eye, FolderGit2, GitPullRequest, Lock, LockOpen } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { useInView } from "@/lib/useInView";

/**
 * Spec v3 §3.10 — Trust & security, PCB Black, right after pricing where
 * code-access worry peaks. Every claim matches how Agent Nick works
 * (Dashboard/docs/AGENT_NICK.md): its own branch, a PR, merge only on the
 * customer's click; a GitHub App on the repos they choose.
 */
const TILES = [
  {
    icon: GitPullRequest,
    title: "You approve every change.",
    body: "Agent Nick works on its own branch and opens a pull request. Nothing merges until you click Merge.",
  },
  {
    icon: FolderGit2,
    title: "Only the repos you pick.",
    body: "Installed as a GitHub App on the repositories you choose. Remove it anytime in your GitHub settings.",
  },
  {
    icon: Eye,
    title: "The scan reads public pages only.",
    body: "No login or code access needed for your score.",
  },
  {
    icon: null,
    title: "Agents see what people see.",
    body: "No separate content for bots, so no cloaking.",
  },
] as const;

export function Trust() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const id = setTimeout(() => setLocked(true), 500);
    return () => clearTimeout(id);
  }, [inView]);

  return (
    <Section tone="dark">
      <div ref={ref}>
        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-caps text-content-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
          Trust &amp; security
        </p>
        <h2 className="mt-4 max-w-[720px] font-display text-[32px] font-semibold leading-[1.15] tracking-display md:text-[44px]">
          Your code stays yours.
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile, i) => {
            const Icon = tile.icon ?? (locked ? Lock : LockOpen);
            return (
              <div
                key={tile.title}
                className="rounded-xl border border-border bg-surface p-6"
                style={{ opacity: inView ? 1 : 0, transition: `opacity var(--dur-slow) var(--ease-out) ${i * 80}ms` }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-verdigris">
                  <Icon size={19} aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-content">{tile.title}</h3>
                <p className="mt-2 text-base text-content-secondary">{tile.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
