import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LEGAL } from "@/lib/legal";

/** Shared frame for the policy pages: the site's nav and footer, a readable column. */
export function LegalPage({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main id="main">
        <section className="section page-top" aria-labelledby="legal-title">
          <div className="wrap legal">
            <div className="section-head">
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="h2" id="legal-title">
                {title}
              </h1>
              <p className="sub">{lede}</p>
              <p className="legal__updated">Last updated {LEGAL.updated}</p>
            </div>
            <div className="legal__body">{children}</div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/** The support address as a link, so every page uses the same one. */
export function Mail() {
  return <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>;
}
