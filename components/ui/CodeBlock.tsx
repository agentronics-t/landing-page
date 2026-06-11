"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

interface CodeBlockProps {
  code: string;
  language?: string;
  copyable?: boolean;
  /** Render a filename/label header row. */
  filename?: string;
  className?: string;
}

/**
 * Dark code island (stays near-black even in light mode). On-palette tokens:
 * comments → --code-comment, strings → muted indigo, property keys → amber.
 * Deliberately lightweight (no rainbow theme), per DS.
 */
export function CodeBlock({ code, language, copyable = true, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={cn("relative bg-code-bg rounded-lg overflow-hidden border border-white/10", className)}
    >
      {filename && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="font-mono text-xs text-[var(--code-comment)]">{filename}</span>
          {language && (
            <span className="font-mono text-xs uppercase tracking-caps text-[var(--code-comment)]">
              {language}
            </span>
          )}
        </div>
      )}
      {copyable && (
        <button
          onClick={copy}
          aria-label="Copy code"
          className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs text-[var(--code-comment)] hover:text-[var(--code-fg)] hover:bg-white/5 transition-colors focus-ring"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-base leading-[1.6] text-[var(--code-fg)]">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}

/** Minimal, on-palette highlighter. Order matters: comments → strings → keys. */
function highlight(code: string): React.ReactNode[] {
  return code.split("\n").map((line, i) => (
    <span key={i} className="block">
      {highlightLine(line)}
      {"\n"}
    </span>
  ));
}

function highlightLine(line: string): React.ReactNode {
  // Whole-line comment
  const trimmed = line.trimStart();
  if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith(">>>")) {
    if (trimmed.startsWith(">>>")) {
      // Python REPL prompt — keep prompt muted, rest base
      return (
        <>
          <span className="text-[var(--code-comment)]">{line.slice(0, line.indexOf(">>>") + 3)}</span>
          {line.slice(line.indexOf(">>>") + 3)}
        </>
      );
    }
    return <span className="text-[var(--code-comment)]">{line}</span>;
  }

  // Inline comment split
  const commentIdx = line.indexOf("//");
  let codePart = line;
  let commentPart = "";
  if (commentIdx >= 0) {
    codePart = line.slice(0, commentIdx);
    commentPart = line.slice(commentIdx);
  }

  const nodes: React.ReactNode[] = [];
  // Tokenize codePart: strings (amber-less indigo), object keys (`word:` → amber), default base.
  const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|([A-Za-z_$][\w$]*)(\s*:)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(codePart)) !== null) {
    if (m.index > last) nodes.push(codePart.slice(last, m.index));
    if (m[1]) {
      nodes.push(
        <span key={key++} className="text-[var(--indigo-300)]">
          {m[1]}
        </span>,
      );
    } else if (m[2]) {
      nodes.push(
        <span key={key++} className="text-[var(--code-property)]">
          {m[2]}
        </span>,
      );
      nodes.push(m[3]);
    }
    last = regex.lastIndex;
  }
  if (last < codePart.length) nodes.push(codePart.slice(last));

  if (commentPart) {
    nodes.push(
      <span key="c" className="text-[var(--code-comment)]">
        {commentPart}
      </span>,
    );
  }
  return nodes;
}
