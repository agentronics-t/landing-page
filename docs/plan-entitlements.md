# Plan Entitlements — Source of Truth

This is the authoritative spec the backend implements for plan gating: **which
plan gets which capability, and at what limits**. Agentronics is authentication
for AI agents. When the pricing page (`lib/catalog.ts`) and this document
disagree, this document wins — update both in the same PR.

## Plans

| Plan       | USD / month | USD / year | INR / month | INR / year | Monthly active agents |
|------------|------------:|-----------:|------------:|-----------:|----------------------:|
| Free       | 0           | 0          | 0           | 0          | 1,000                 |
| Pro        | 25          | 250        | 1,999       | 19,990     | 10,000                |
| Business   | 99          | 990        | 7,999       | 79,990     | 50,000                |
| Enterprise | custom      | custom     | custom      | custom     | custom                |

Yearly = 10 × monthly (16% off). Plan ids: `"free" | "pro" | "business" | "enterprise"`.
Paid self-serve plans are billed by Razorpay Subscriptions — one Razorpay plan
per (tier, cycle, currency), i.e. 8 plans (see the console's `lib/billing`).

### Monthly active agents (MAA)

A **monthly active agent** is a unique agent identity that authenticates
successfully at least once in a calendar month (UTC). Identity =
`metadata.subject` of an `auth.identity_presented` success event: a Web Bot
Auth signer URL, `key:<agentId>`, `oauth2:<clientId>`, `crawler:<name>`, or a
browser-verified subject. Unverified agents and human visitors never count.

## Capability × plan

### Authentication methods

| Capability                           | Free | Pro | Business | Enterprise |
|--------------------------------------|:----:|:---:|:--------:|:----------:|
| Web Bot Auth (signed agents)          | ✓    | ✓   | ✓        | ✓          |
| Verified crawlers (reverse DNS)       | ✓    | ✓   | ✓        | ✓          |
| Agent API keys                        | ✓    | ✓   | ✓        | ✓          |
| WebMCP & browser agents               | ✓    | ✓   | ✓        | ✓          |
| OAuth2 agent tokens                   | —    | ✓   | ✓        | ✓          |
| SSO / OIDC agent identity             | —    | —   | ✓        | ✓          |
| SPIFFE & mTLS                         | —    | —   | ✓        | ✓          |

### Access rules & sessions

| Capability                           | Free | Pro | Business | Enterprise |
|--------------------------------------|:----:|:---:|:--------:|:----------:|
| Allow / block unverified agents       | ✓    | ✓   | ✓        | ✓          |
| Custom allow & block lists            | —    | ✓   | ✓        | ✓          |
| Auth logs & sessions                  | ✓    | ✓   | ✓        | ✓          |
| Webhooks                              | —    | ✓   | ✓        | ✓          |
| Audit log export                      | —    | —   | ✓        | ✓          |

### Limits & support

| Limit                  | Free      | Pro    | Business | Enterprise |
|------------------------|:---------:|:------:|:--------:|:----------:|
| Monthly active agents  | 1,000     | 10,000 | 50,000   | custom     |
| Sites                  | 1         | 3      | 10       | unlimited  |
| Auth log retention     | 7 days    | 30 days| 90 days  | custom     |
| Team members           | 1         | 5      | 20       | unlimited  |
| Support                | Community | Email  | Priority | Dedicated  |
| Uptime SLA             | —         | —      | —        | 99.9%      |
| SAML SSO for the team  | —         | —      | —        | ✓          |

## Enforcement

### Where the plan lives

- The tenant's plan is derived from `billing_subscriptions` in Neon: the most
  recent subscription in `active`, `authenticated` or `pending` status sets the
  plan; otherwise the tenant is on **Free**. (`pending` = a renewal charge is
  being retried — the plan stays active during Razorpay's retry window; it
  drops to Free when the subscription is `halted`, `cancelled`, `completed` or
  `expired`.)
- Razorpay webhooks are the source of truth for status. The checkout callback
  is verified (HMAC of `payment_id|subscription_id`) and re-reads the
  subscription from Razorpay before recording anything, so a forged callback
  can't grant a plan.

### MAA limits

- Soft limit: the console shows usage vs. the plan's MAA and warns at 80% and
  100%.
- **Never fail closed on human traffic.** Over the limit, newly seen agents are
  still authenticated and logged; the account is flagged and asked to upgrade.
  Hard enforcement (treating new agents as unverified) is Enterprise-contract
  only and off by default.

### Feature gates

- The console hides / disables configuration for methods above the plan
  (OAuth2 on Free; SSO, SPIFFE, mTLS below Business) with an upgrade prompt.
- The gateway rejects saving configuration for a method above the plan with
  **403** `PLAN_UPGRADE_REQUIRED` `{capability, currentPlan, requiredPlan}`.
- Downgrades never delete configuration: gated methods stop being offered and
  are re-enabled on upgrade. Logs beyond the new retention window are pruned by
  the daily retention job.
