import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";

export const metadata: Metadata = {
  title: "Book a demo: Agentronics",
  description: "Talk to the Agentronics team: we'll check your site live and show you what agents see and how to fix it.",
};

export default function BookPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <section className="section scanner page-top" aria-labelledby="book-title">
          <div className="wrap">
            <div className="section-head section-head--center" data-reveal>
              <p className="eyebrow">Book a demo</p>
              <h1 className="h2" id="book-title">
                Let’s make your site <span className="mark">ready for agents.</span>
              </h1>
              <p className="sub">
                30 minutes with the team. We check your site live, walk through what agents see, and show you how the fixes
                land in your code.
              </p>
            </div>
            <div className="book__frame">
              <CalendlyEmbed />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
