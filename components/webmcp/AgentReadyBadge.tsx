"use client";

import { useEffect, useState } from "react";
import { Zap, X, ChevronRight } from "lucide-react";
import type { ToolDescriptor } from "@/lib/webmcp";

const DISMISS_KEY = "ag-webmcp-badge";

/**
 * Small, dismissible corner badge that shows this site is itself agent-native:
 * it lists the WebMCP tools the page exposes via `navigator.modelContext`.
 * Pure showcase — the tools work whether or not the badge is shown.
 */
export function AgentReadyBadge({ tools }: { tools: ToolDescriptor[] }) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true); // hidden until we read storage (avoids flash)

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || tools.length === 0) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage unavailable — badge just won't persist dismissal */
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden sm:block">
      {open ? (
        <div className="w-[320px] overflow-hidden rounded-xl border border-border bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] shadow-raise backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="flex items-center gap-2">
              <Zap size={15} className="text-brand" />
              <span className="text-sm font-semibold text-content">Agent-ready</span>
              <span className="rounded-pill bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] text-brand">
                {tools.length} tools
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                aria-label="Collapse"
                className="rounded-md p-1 text-content-muted hover:text-content focus-ring"
              >
                <ChevronRight size={15} className="rotate-90" />
              </button>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="rounded-md p-1 text-content-muted hover:text-content focus-ring"
              >
                <X size={15} />
              </button>
            </div>
          </div>
          <p className="px-4 pt-3 text-xs text-content-secondary">
            This site exposes typed tools to visiting AI agents via{" "}
            <code className="font-mono text-[11px] text-content">navigator.modelContext</code> — no
            scraping needed.
          </p>
          <ul className="max-h-[240px] overflow-y-auto px-2 py-2">
            {tools.map((t) => (
              <li key={t.name} className="rounded-lg px-2 py-1.5">
                <p className="font-mono text-xs text-content">{t.name}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-content-muted">{t.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-pill border border-border bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-3.5 py-2 shadow-raise backdrop-blur-md transition-colors hover:border-brand focus-ring"
        >
          <Zap size={14} className="text-brand" />
          <span className="text-xs font-medium text-content">Agent-ready</span>
          <span className="rounded-pill bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] text-brand">
            {tools.length} WebMCP tools
          </span>
        </button>
      )}
    </div>
  );
}
