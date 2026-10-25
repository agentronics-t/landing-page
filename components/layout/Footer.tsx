import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Developers", href: "/developers" },
  { label: "Book a demo", href: "/demo" },
  { label: "Log in", href: "/login" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refunds", href: "/refunds" },
  { label: "Contact", href: "/contact" },
];

/** The home page's footer (public/home.html). The badge opens the home scanner on this site. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <Logo light />
          <p className="footer__tag">Make your website ready for AI agents.</p>
          <a className="live-badge" href="/?url=www.agentronics.dev#score">
            <span className="live-badge__dot" />
            Agent Readiness Score: <b>100/100 ✓</b>
          </a>
        </div>
        <nav className="footer__links" aria-label="Footer">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="footer__agents">
          <p>For AI agents</p>
          <a href="/llms.txt">llms.txt</a>
          <a href="/index.md">Markdown version</a>
          <a href="/openapi.json">Scan API (OpenAPI)</a>
          <a href="/sitemap.xml">Sitemap</a>
        </div>
      </div>
      <div className="wrap footer__base">© 2026 Agentronics</div>
    </footer>
  );
}
