"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/** URL box + the Copper "Check my site free" button. Sends people to /scan?url=… (a shareable report). */
export function ScanForm({
  id,
  className,
  defaultValue = "",
  microcopy = "No signup. 30 seconds.",
  secondary = false,
}: {
  id?: string;
  className?: string;
  defaultValue?: string;
  microcopy?: string | null;
  /** Outline button, for screens where another Copper action is the primary one. */
  secondary?: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = url.trim();
    if (!value || !/[a-z0-9-]\.[a-z]{2,}/i.test(value)) {
      setError("Enter your website, like yourshop.com");
      return;
    }
    setError(null);
    router.push(`/scan?url=${encodeURIComponent(value)}`);
  };

  return (
    <form id={id} onSubmit={submit} className={cn("w-full scroll-mt-28", className)} noValidate>
      <div className="flex flex-col gap-2 rounded-lg border border-border-strong bg-surface p-2 shadow-raise focus-within:border-copper sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-3 px-3">
          <Globe size={18} className="shrink-0 text-content-muted" aria-hidden />
          <span className="sr-only">Your website address</span>
          <input
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourwebsite.com"
            aria-invalid={!!error}
            aria-describedby={error ? `${id ?? "scan"}-error` : undefined}
            className="h-12 w-full min-w-0 bg-transparent font-mono text-[15px] text-content placeholder:text-content-muted focus:outline-none"
          />
        </label>
        <Button type="submit" size="lg" variant={secondary ? "outline" : "primary"} className="w-full sm:w-auto">
          {secondary ? "Check another site" : "Check my site free"}
          <ArrowRight size={18} aria-hidden />
        </Button>
      </div>
      {error ? (
        <p id={`${id ?? "scan"}-error`} role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : (
        microcopy && <p className="mt-3 text-sm text-content-muted">{microcopy}</p>
      )}
    </form>
  );
}
