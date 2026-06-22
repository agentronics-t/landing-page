import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Platform",
    links: [
      { label: "SDK", href: "/" },
      { label: "Intelligence", href: "/intelligence" },
      { label: "Docs", href: "https://docs.agentronics.dev" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Mission", href: "/#mission" },
      { label: "Vision", href: "/#vision" },
      { label: "Team", href: "/#team" },
      { label: "Contact", href: "/book" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Twitter / X", href: "https://x.com" },
      { label: "LinkedIn", href: "https://linkedin.com" },
      { label: "GitHub", href: "https://github.com/agentronics-t" },
      { label: "Email", href: "/book" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-raised">
      <div className="mx-auto max-w-content px-[clamp(20px,5vw,48px)] pb-12 pt-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* brand block */}
          <div className="col-span-2 md:col-span-1">
            <Logo size={26} href="/" />
            <p className="mt-4 max-w-[220px] text-sm text-content-secondary">
              Engineered for technical rigor.
            </p>
            <p className="mt-6 text-sm text-content-muted">
              © 2026 Agentronics. All rights reserved.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="font-mono text-xs uppercase tracking-caps text-content-muted">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-base text-content-secondary transition-colors hover:text-content focus-ring rounded-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
