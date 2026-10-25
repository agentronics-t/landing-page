import { Navbar } from "@/components/layout/Navbar";
import { hasClerkKey } from "@/lib/clerk";

/**
 * The frame around Clerk's sign-in and sign-up cards: the site's nav, a short
 * heading, and a link to the demo for people who'd rather talk first. Without
 * Clerk keys (local dev) it says so instead of crashing.
 */
export function AuthFrame({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="auth">
        <div className="hero__dots" aria-hidden="true" />
        <div className="wrap auth__inner">
          <div className="auth__head">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="h2">{title}</h1>
          </div>
          {hasClerkKey() ? children : <p className="auth__demo">Sign-in isn&rsquo;t available on this deployment.</p>}
          <p className="auth__demo">
            Want a walkthrough first? <a href="/book">Book a demo</a>
          </p>
        </div>
      </main>
    </>
  );
}
