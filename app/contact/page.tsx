import type { Metadata } from "next";
import { LegalPage, Mail } from "@/components/site/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact: Agentronics",
  description: "Email Agentronics for support, billing, refunds or privacy, or book a demo with the team.",
};

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Contact"
      title="Talk to us"
      lede="Support, billing, refunds, privacy or partnerships: one inbox, read by the founders."
    >
      <h2>Email</h2>
      <p>
        <Mail />
      </p>
      <p>We usually reply within {LEGAL.replyDays} business days. For billing, include your account email and the invoice.</p>

      <h2>Book a demo</h2>
      <p>
        30 minutes with the team: we check your site live and show you what agents see. <a href="/book">Pick a time</a>.
      </p>

      <h2>Who we are</h2>
      <p>
        {LEGAL.name} is operated by {LEGAL.operators}, based in {LEGAL.country}.
      </p>

      <h2>Policies</h2>
      <ul>
        <li><a href="/terms">Terms of Service</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
        <li><a href="/refunds">Refund &amp; Cancellation Policy</a></li>
      </ul>
    </LegalPage>
  );
}
