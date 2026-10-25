"use client";

import { useId, useRef, useState } from "react";
import { ARROW } from "@/components/ui/Button";

// Same rule as cleanUrl() in public/home-assets/app.js.
function cleanUrl(value: string): URL | null {
  let v = value.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) v = `https://${v.replace(/^\/+/, "")}`;
  try {
    const u = new URL(v);
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname);
    if (!u.hostname.includes(".") && !isIp) return null;
    return u;
  } catch {
    return null;
  }
}

/**
 * The home page's score input (`.scanform`). The scan runs in the home page's
 * scanner: submitting opens /?url=…#score, which app.js picks up on arrival.
 */
export function ScanForm({
  label = "Get your free Agent Readiness Score",
  ticks = ["Score out of 100", "Free", "No signup", "30 seconds"],
  variant = "go",
  className = "",
}: {
  label?: string;
  ticks?: string[];
  variant?: "go" | "ink";
  className?: string;
}) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [invalid, setInvalid] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = cleanUrl(input.current?.value ?? "");
    if (!u) {
      // restart the shake, like app.js
      form.current?.classList.remove("is-invalid");
      void form.current?.offsetWidth;
      form.current?.classList.add("is-invalid");
      setInvalid(true);
      input.current?.focus();
      return;
    }
    const shown = (u.host + (u.pathname !== "/" ? u.pathname : "")).replace(/\/$/, "");
    location.href = `/?url=${encodeURIComponent(shown)}#score`;
  };

  return (
    <form
      ref={form}
      className={`scanform ${className} ${invalid ? "is-invalid" : ""}`}
      action="/"
      method="get"
      onSubmit={submit}
      noValidate
    >
      <label className="scanform__label" htmlFor={id}>
        {label}
      </label>
      <div className="scanform__row">
        <div className="scanform__field">
          <span className="scanform__prefix" aria-hidden="true">
            https://
          </span>
          <input
            ref={input}
            id={id}
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="yourcompany.com"
            required
            onInput={() => invalid && setInvalid(false)}
          />
        </div>
        <button className={`btn btn--${variant} btn--lg`} type="submit">
          <span className="btn__text">Get my score</span>
          {ARROW}
        </button>
      </div>
      <p className="scanform__error" role="alert" hidden={!invalid}>
        Enter a website like yourcompany.com
      </p>
      <ul className="ticks">
        {ticks.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </form>
  );
}
