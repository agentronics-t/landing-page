"use client";

import { cn } from "@/lib/cn";

interface TabsProps {
  tabs: string[];
  active: string;
  onChange?: (t: string) => void;
  className?: string;
}

/** Underline strip on a hairline rule; active tab → 2px brand underline. */
export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(tab)}
            className={cn(
              "relative -mb-px px-3 py-2 text-base transition-colors duration-[var(--dur-fast)] focus-ring rounded-sm",
              isActive ? "text-content" : "text-content-muted hover:text-content-secondary",
            )}
          >
            {tab}
            {isActive && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" aria-hidden />
            )}
          </button>
        );
      })}
    </div>
  );
}
