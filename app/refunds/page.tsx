import type { Metadata } from "next";
import { LegalPage, Mail } from "@/components/site/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy: Agentronics",
  description: "Cancel any paid Agentronics plan at any time. How cancellation, plan changes and refunds work.",
};

export default function RefundsPage() {
  return (
    <LegalPage
      eyebrow="Refunds"
      title="Refund & Cancellation Policy"
      lede="Cancel any paid plan at any time. You keep what you paid for until the end of the month, and merged fixes stay in your code."
    >
      <h2>Free plan</h2>
      <p>The Free plan costs nothing and needs no payment.</p>

      <h2>How paid plans are billed</h2>
      <p>
        Starter and Pro are billed monthly in advance, in US dollars, through Dodo Payments, our merchant of record. Prices
        are on the <a href="/pricing">pricing page</a>.
      </p>

      <h2>Cancelling</h2>
      <ul>
        <li>
          Cancel at any time from the console: <b>Account → Invoices &amp; payment method</b> opens the billing portal.
          You can also email <Mail /> from your account email and we&rsquo;ll cancel for you.
        </li>
        <li>
          Cancelling stops the next charge. Your plan stays active until the end of the month you&rsquo;ve paid for, then
          your workspace moves to Free.
        </li>
        <li>Fixes you merged from Agent Nic stay in your code.</li>
      </ul>

      <h2>Refunds</h2>
      <ul>
        <li>
          We don&rsquo;t refund partial months or unused time after you cancel, except where the law or Dodo&rsquo;s
          buyer terms require it.
        </li>
        <li>
          If you were charged by mistake, for example a duplicate charge or a charge after you cancelled, we&rsquo;ll
          refund it in full.
        </li>
        <li>Refunds go back to your original payment method through Dodo Payments.</li>
      </ul>

      <h2>Changing plans</h2>
      <p>
        Moving between Starter and Pro takes effect right away. The price difference for the rest of the month is
        prorated by Dodo Payments.
      </p>

      <h2>Enterprise</h2>
      <p>Enterprise plans follow the terms in your agreement.</p>

      <h2>How to ask</h2>
      <p>
        Email <Mail /> with your account email and the invoice or charge in question. We usually reply within{" "}
        {LEGAL.replyDays} business days.
      </p>
    </LegalPage>
  );
}
