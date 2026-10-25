import type { Metadata } from "next";
import { LegalPage, Mail } from "@/components/site/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy: Agentronics",
  description: "What data Agentronics collects, why, who processes it, how long we keep it, and your rights.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      lede="What we collect, why we collect it, who helps us process it, and how to ask us to see or delete it."
    >
      <h2>1. Who is responsible</h2>
      <p>
        {LEGAL.name} is operated by {LEGAL.operators}, based in {LEGAL.country}. For anything about your data, write to{" "}
        <Mail />.
      </p>

      <h2>2. What we collect</h2>
      <h3>When you visit agentronics.dev</h3>
      <ul>
        <li>
          <b>Usage analytics.</b> Vercel Web Analytics counts page views and events such as &ldquo;scan started&rdquo;. It
          doesn&rsquo;t use cookies, and we don&rsquo;t use advertising trackers.
        </li>
        <li>
          <b>The free scan.</b> When you enter a website, our server fetches that site&rsquo;s public pages and files
          (such as robots.txt and the sitemap) to score it. We don&rsquo;t keep the result. Your IP address is used briefly
          to rate-limit scans and isn&rsquo;t stored with it.
        </li>
        <li>
          <b>Booking a demo.</b> If you book a call, Calendly collects your name, email and anything you type in the
          form.
        </li>
      </ul>

      <h3>When you use the console</h3>
      <ul>
        <li>
          <b>Account details.</b> Your name, email and, if you sign in with GitHub, your GitHub profile. Sign-in is handled
          by Clerk.
        </li>
        <li>
          <b>Billing.</b> Dodo Payments handles card details; we never see them. We receive your plan, subscription status
          and billing email.
        </li>
        <li>
          <b>Agent activity from your site.</b> If you install the SDK, it sends us records of AI-agent activity on your
          site: the page, the action an agent called, the kind of agent, whether it was verified, the outcome and the
          timing. The SDK checks a crawler&rsquo;s IP address on your own server to verify it; IP addresses aren&rsquo;t
          among the fields it sends us. For this data we act on your behalf, as your processor.
        </li>
        <li>
          <b>Agent Nick.</b> If you connect GitHub, Agent Nick reads the repositories you chose through our GitHub App.
          It sends relevant parts of your code to Google&rsquo;s Gemini models on Vertex AI to write fixes. We store what
          it proposes and the pull requests it opens, not a copy of your repository.
        </li>
      </ul>

      <h2>3. Why we use it</h2>
      <ul>
        <li>To run the service: score sites, show your dashboard, apply your rules, and open pull requests you asked for.</li>
        <li>To bill paid plans and enforce plan limits.</li>
        <li>To keep the service secure, prevent abuse and fix problems.</li>
        <li>To answer you when you contact us.</li>
      </ul>
      <p>
        We don&rsquo;t sell your data, and we don&rsquo;t use your code or your site&rsquo;s data to train AI models.
      </p>

      <h2>4. Who processes it for us</h2>
      <ul>
        <li><b>Vercel</b>: hosts the website and console, and provides web analytics.</li>
        <li><b>Google Cloud</b>: runs our API and Agent Nick (United States), and provides Gemini through Vertex AI.</li>
        <li><b>Neon</b>: our database (United States).</li>
        <li><b>Clerk</b>: sign-in and accounts.</li>
        <li><b>GitHub</b>: repository access for Agent Nick, through the app you install.</li>
        <li><b>Dodo Payments</b>: payments, taxes and invoices, as merchant of record.</li>
        <li><b>Calendly</b>: demo bookings.</li>
      </ul>
      <p>
        Your data may be processed outside your country, mainly in the United States. We use providers that protect it
        under their own security and privacy commitments.
      </p>

      <h2>5. How long we keep it</h2>
      <ul>
        <li>Agent activity: 7 days on Free, 30 on Starter, 90 on Pro, or as agreed for Enterprise. Then it is deleted.</li>
        <li>Account and billing records: while your account is open, and afterwards as long as the law requires.</li>
        <li>Agent Nick&rsquo;s proposals and pull request records: while your account is open.</li>
      </ul>

      <h2>6. Cookies</h2>
      <p>
        The marketing site doesn&rsquo;t set advertising or tracking cookies. The console uses cookies to keep you signed
        in. The Calendly booking page may set its own cookies.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You can ask to see, correct, export or delete your personal data, or object to how we use it. Email <Mail /> and
        we&rsquo;ll respond within the time the law requires. These rights include those under India&rsquo;s Digital
        Personal Data Protection Act and, where they apply, the GDPR. You can also complain to your local data
        protection authority.
      </p>

      <h2>8. Security</h2>
      <p>
        Data is encrypted in transit. Secrets are kept in a managed secret store, and access is limited to what each
        part of the service needs.
      </p>

      <h2>9. Children</h2>
      <p>The service is for businesses and isn&rsquo;t meant for anyone under 18.</p>

      <h2>10. Changes</h2>
      <p>
        If we change this policy in a way that matters, we&rsquo;ll update the date at the top and tell account holders.
      </p>
    </LegalPage>
  );
}
