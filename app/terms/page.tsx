import type { Metadata } from "next";
import { LegalPage, Mail } from "@/components/site/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service: Agentronics",
  description: "The agreement for using Agentronics: the Agent Readiness Score, the console, the SDK and Agent Nic.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms of Service"
      lede="The agreement between you and Agentronics when you use our website, the Agent Readiness Score, the console, the SDK or Agent Nic."
    >
      <h2>1. Who we are</h2>
      <p>
        {LEGAL.name} is operated by {LEGAL.operators}, based in {LEGAL.country} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By
        using the service you agree to these terms. If you use it for a company, you confirm you can agree for that
        company. Contact: <Mail />.
      </p>

      <h2>2. What the service is</h2>
      <ul>
        <li>
          <b>Agent Readiness Score</b>: a free scan of a website&rsquo;s public pages that scores how well AI agents can
          find, read and act on it.
        </li>
        <li>
          <b>Console and SDK</b>: tools to publish WebMCP actions on your site, see which AI agents visit, and set rules
          for what they may do.
        </li>
        <li>
          <b>Agent Nic</b>: our AI agent, which reads the GitHub repositories you connect and opens pull requests with
          proposed fixes.
        </li>
      </ul>
      <p>Features and limits for each plan are on the <a href="/pricing">pricing page</a>.</p>

      <h2>3. Your account</h2>
      <p>
        Keep your login details safe and tell us at <Mail /> if you think someone else has used your account. You are
        responsible for what happens in your workspace, including what your team members do.
      </p>

      <h2>4. Scanning and acceptable use</h2>
      <ul>
        <li>Only scan, connect or install the SDK on websites and repositories you own or are allowed to work on.</li>
        <li>
          Don&rsquo;t use the service to break the law, to attack, overload or probe systems you don&rsquo;t control, or
          to get around our rate limits and security.
        </li>
        <li>Don&rsquo;t resell or copy the service, or reverse-engineer it except where the law allows.</li>
      </ul>
      <p>We may suspend accounts that break these rules.</p>

      <h2>5. Agent Nic and your code</h2>
      <ul>
        <li>
          Agent Nic works only on the repositories where you install our GitHub App, with the permissions GitHub shows
          you when you install it. You can remove it at any time in your GitHub settings.
        </li>
        <li>
          It commits to its own branch and opens a pull request. It never pushes to your main branch, and it merges only
          when you click Accept &amp; merge.
        </li>
        <li>
          Its changes are written with AI and can contain mistakes. Review every pull request before you merge it. Once
          you merge a change, you are responsible for it in your code.
        </li>
      </ul>

      <h2>6. Plans, billing and payments</h2>
      <ul>
        <li>The Free plan costs nothing. Paid plans are billed monthly or yearly in advance, in US dollars.</li>
        <li>
          Payments are processed by Dodo Payments, our merchant of record. Dodo handles your card details, taxes and
          invoices, and its buyer terms also apply to your purchase.
        </li>
        <li>
          If you go over a plan&rsquo;s limit, your website keeps working and agents are never blocked; we stop recording
          new agent activity until the next month or until you upgrade.
        </li>
        <li>
          We may change prices. We&rsquo;ll tell you at least 30 days before a change applies to your plan, and you can
          cancel before then.
        </li>
        <li>
          Cancellation and refunds are covered by our <a href="/refunds">Refund &amp; Cancellation Policy</a>.
        </li>
      </ul>

      <h2>7. Your data and your code</h2>
      <p>
        You own your code, your website content and the data your site sends us. You give us permission to use them
        only to run the service for you. Fixes you merge stay in your code, even if you cancel. How we handle data is
        explained in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>8. Our service</h2>
      <p>
        We own the Agentronics service, website, software and brand. The SDK is licensed under its own open-source
        licence, which is shown in its repository.
      </p>

      <h2>9. No guarantees</h2>
      <p>
        We work to keep the service accurate and available, but it is provided &ldquo;as is&rdquo;. A score or a fix
        doesn&rsquo;t guarantee how any particular AI agent, search engine or browser will treat your site.
      </p>

      <h2>10. Limit of liability</h2>
      <p>
        To the extent the law allows, we aren&rsquo;t liable for indirect or consequential losses, such as lost profits
        or data. Our total liability for any claim is limited to what you paid us in the 12 months before the claim.
        Nothing here limits liability that the law doesn&rsquo;t allow us to limit.
      </p>

      <h2>11. Ending the agreement</h2>
      <p>
        You can stop using the service and cancel your plan at any time. We may suspend or end your access if you break
        these terms, with notice where we reasonably can.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms. If a change matters, we&rsquo;ll tell you by email or in the console before it takes
        effect. The date at the top shows the latest version.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of {LEGAL.country}, and disputes go to the courts of {LEGAL.country}. If
        you are a consumer, you keep any rights the law of your own country gives you.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these terms: <Mail />.
      </p>
    </LegalPage>
  );
}
