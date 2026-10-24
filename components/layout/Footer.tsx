import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Free Agent Readiness Score", href: "/#scan" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "SDK overview", href: "/developers" },
      { label: "Docs", href: "/docs" },
      { label: "GitHub", href: "https://github.com/agentronics-t" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Book a demo", href: "/book" },
      { label: "X / Twitter", href: "https://x.com/agentronics" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/agentronicss" },
    ],
  },
];

/** PCB Black, like the hero: the page closes on the board it opened on. */
export function Footer() {
  return (
    <footer className="tone-dark border-t border-border px-4 sm:px-[clamp(20px,5vw,48px)]">
      <div className="mx-auto grid max-w-content grid-cols-2 gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-[260px] text-sm text-content-muted">
            Make your website ready for AI agents.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="font-mono text-xs uppercase tracking-caps text-content-muted">{col.heading}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="rounded-sm text-sm text-content-secondary transition-colors hover:text-content focus-ring">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 border-t border-border py-6 text-xs text-content-muted sm:pb-20">
        <span>© 2026 Agentronics</span>
        <Link
          href="/scan?url=agentronics.dev"
          className="inline-flex items-center gap-2 rounded-pill border border-border px-3 py-1.5 text-content transition-colors hover:border-verdigris focus-ring"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-verdigris" aria-hidden />
          Agent Readiness Score: 100/100 ✓
        </Link>
      </div>
    </footer>
  );
}
