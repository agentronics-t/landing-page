"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const LOOKS_LIKE_SITE = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(:\d+)?(\/\S*)?$/i;

/**
 * The score input (spec v3 §3.2, §5.4): a visible label, one fused pill with
 * the Copper "Get my score →" button, and a shareable result at /scan?url=….
 * Accepts the address with or without https://.
 */
export function ScanForm({
  id,
  className,
  defaultValue = "",
  label = "Get your free Agent Readiness Score",
  microcopy = "Score out of 100 · Free · No signup · 30 seconds",
  secondary = false,
  source = "hero",
  onFocus,
}: {
  id?: string;
  className?: string;
  defaultValue?: string;
  label?: string | null;
  microcopy?: string | null;
  /** Outline button, for screens where another Copper action is the primary one. */
  secondary?: boolean;
  /** Where the scan started, for the scan_start event. */
  source?: string;
  onFocus?: () => void;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const inputId = `${id ?? "scan"}-url`;
  const valid = LOOKS_LIKE_SITE.test(url.trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = url.trim();
    if (!LOOKS_LIKE_SITE.test(value)) {
      setError("Enter a website like yourcompany.com");
      setShake((n) => n + 1);
      return;
    }
    setError(null);
    setBusy(true);
    track("scan_start", { source });
    router.push(`/scan?url=${encodeURIComponent(value)}`);
  };

  return (
    <form id={id} onSubmit={submit} className={cn("w-full scroll-mt-28", className)} noValidate>
      {label && (
        <label htmlFor={inputId} className="mb-3 block text-base font-semibold text-content">
          {label}
        </label>
      )}
      <div
        key={shake}
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-border-strong bg-surface p-1.5 shadow-raise transition-colors duration-[var(--dur-fast)] focus-within:border-copper sm:h-[60px] sm:flex-row sm:items-center sm:rounded-pill sm:p-1.5",
          shake > 0 && "shake",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
          <input
            id={inputId}
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={onFocus}
            placeholder="yourcompany.com"
            aria-label={label ? undefined : "Your website address"}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="h-12 w-full min-w-0 bg-transparent font-mono text-[16px] text-content placeholder:text-content-muted focus:outline-none"
          />
          {valid && <Check size={18} className="shrink-0 text-success" aria-label="Looks like a website" />}
        </div>
        <Button
          type="submit"
          size="lg"
          variant={secondary ? "outline" : "primary"}
          aria-busy={busy}
          className="group w-full sm:h-12 sm:w-auto sm:rounded-pill"
        >
          {busy ? (
            <>
              Scanning
              <span className="inline-flex gap-0.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="node-pulse h-1 w-1 rounded-full bg-current" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </span>
            </>
          ) : (
            <>
              {secondary ? "Score another site" : "Get my score"}
              <ArrowRight size={18} aria-hidden className="transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : (
        microcopy && <p className="mt-3 text-sm text-content-muted">{microcopy}</p>
      )}
    </form>
  );
}
