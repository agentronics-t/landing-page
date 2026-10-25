import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Pricing", href: "/pricing" },
  { label: "Developers", href: "/developers" },
  { label: "Docs", href: "/docs" },
];

/**
 * The home page's nav (public/home.html), for every other page. SiteEffects
 * adds `.is-scrolled` (white, blurred) once the page scrolls. Like the home
 * page, phones show the logo and "Get my score" only.
 */
export function Navbar() {
  return (
    <header className="nav" data-nav>
      <div className="wrap nav__inner">
        <Logo />
        <nav className="nav__links" aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav__right">
          <a className="nav__login" href="/login">
            Log in
          </a>
          <a className="btn btn--go btn--sm" href="/#score">
            Get my score
          </a>
        </div>
      </div>
    </header>
  );
}
