"use client";

import { cn } from "@/lib/cn";

interface SelectProps {
  label?: string;
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  className?: string;
}

/** Native <select> styled exactly like Input. */
export function Select({ label, options, value, onChange, disabled, className }: SelectProps) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block font-mono text-xs uppercase tracking-caps text-content-muted">
          {label}
        </span>
      )}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-10 w-full rounded-md border bg-canvas border-border-strong px-3 text-base text-content focus-ring transition-colors disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
