"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (c: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** 18px rounded square; fills bg-brand-solid with white check when on. */
export function Checkbox({ label, checked = false, onChange, disabled, className }: CheckboxProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer select-none", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "grid h-[18px] w-[18px] place-items-center rounded-[6px] border transition-colors duration-[var(--dur-fast)] focus-ring disabled:opacity-50",
          checked ? "bg-brand-solid border-brand-solid text-white" : "bg-canvas border-border-strong",
        )}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </button>
      {label && <span className="text-base text-content">{label}</span>}
    </label>
  );
}
