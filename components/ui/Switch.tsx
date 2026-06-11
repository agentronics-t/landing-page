"use client";

import { cn } from "@/lib/cn";

interface SwitchProps {
  label?: string;
  checked?: boolean;
  onChange?: (c: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** Pill track; turns bg-brand-solid when on; knob slides. */
export function Switch({ label, checked = false, onChange, disabled, className }: SwitchProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer select-none", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-pill transition-colors duration-[var(--dur-fast)] focus-ring disabled:opacity-50",
          checked ? "bg-brand-solid" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-[var(--dur-fast)]",
            checked && "translate-x-5",
          )}
        />
      </button>
      {label && <span className="text-base text-content">{label}</span>}
    </label>
  );
}
