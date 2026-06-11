"use client";

import { cn } from "@/lib/cn";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  mono?: boolean;
  disabled?: boolean;
  type?: string;
  name?: string;
  error?: string;
  className?: string;
  onDark?: boolean;
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  mono = false,
  disabled,
  type = "text",
  name,
  error,
  className,
  onDark = false,
}: InputProps) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block font-mono text-xs uppercase tracking-caps text-content-muted">
          {label}
        </span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-md border px-3 text-base text-content placeholder:text-content-muted focus-ring transition-colors disabled:opacity-50",
          onDark ? "bg-white/5 border-white/15 text-white" : "bg-canvas border-border-strong",
          mono && "font-mono",
          error && "border-danger",
        )}
      />
      {error && <span className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  );
}

interface TextareaProps extends Omit<InputProps, "type"> {
  rows?: number;
}

export function Textarea({
  label,
  placeholder,
  value,
  onChange,
  mono = false,
  disabled,
  name,
  error,
  rows = 4,
  className,
}: TextareaProps) {
  return (
    <label className={cn("block", className)}>
      {label && (
        <span className="mb-1.5 block font-mono text-xs uppercase tracking-caps text-content-muted">
          {label}
        </span>
      )}
      <textarea
        name={name}
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={!!error}
        className={cn(
          "w-full rounded-md border bg-canvas border-border-strong px-3 py-2 text-base text-content placeholder:text-content-muted focus-ring transition-colors resize-y disabled:opacity-50",
          mono && "font-mono",
          error && "border-danger",
        )}
      />
      {error && <span className="mt-1 block text-sm text-danger">{error}</span>}
    </label>
  );
}
