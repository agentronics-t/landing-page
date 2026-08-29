# Plan Entitlements — Source of Truth

This document is the authoritative spec the backend must implement for plan
gating: **which plan gets access to which capability**. Agentronics is one
product — the SDK / WebMCP tooling (serving tools to agents) and the dashboard
it feeds (governance, observability, analytics) — plus platform limits. When the
pricing page and this document disagree, this document wins; update it in the
same PR that changes pricing.

## Plans

| Plan     | Monthly | Yearly (16% off) | Positioning |
|----------|---------|------------------------|-------------|
| Starter  | $49     | $490                   | Serve and govern agents on a single source. |
| Team     | $199    | $1,990                 | Full governance for growing agent traffic. |
| Business | Custom  | Custom                 | Enterprise-grade for established platforms. |

Plan ids used everywhere in code: `"starter" | "team" | "business"`.

Every plan includes the SDK and the dashboard — there is no intelligence-only
tier. Plans differ by scope of governance, volume, and support.

## Capability × Plan matrix

### SDK & governance

| Capability                              | Starter | Team | Business |
|-----------------------------------------|:-------:|:----:|:--------:|
| SDK install & site registration         | ✓       | ✓    | ✓        |
| WebMCP tool serving                     | ✓       | ✓    | ✓        |
| Tool management / registry              | ✓       | ✓    | ✓        |
| Agent detection & fingerprinting        | ✓       | ✓    | ✓        |
| Agent authentication                    | Basic   | Full | Full + SSO |
| Authorization (scoped permissions)      | —       | ✓    | Advanced |
| Agent memory & context transfer         | —       | ✓    | ✓        |
| Observability & audit trail             | Basic   | Full | Audit-grade + export |

### Measurement & analytics

| Capability                              | Starter | Team | Business |
|-----------------------------------------|:-------:|:----:|:--------:|
| Agent-traffic measurement               | ✓       | ✓    | ✓        |
| Analytics dashboard                     | Basic   | Full | Full     |
| Data-source connectors                  | 1 source | All  | All + licensed enrichment |

Analytics is the dashboard view over what the SDK serves — there is nothing to
measure until the SDK is installed and a data source is connected.

### Platform limits

| Limit                | Starter    | Team       | Business  |
|----------------------|:----------:|:----------:|:---------:|
| Agent requests / mo  | 25K        | 1M         | Unlimited |
| Data retention       | 30 days    | 90 days    | Custom    |
| Team seats           | 2          | 10         | Unlimited |
| SSO / SAML           | —          | —          | ✓         |
| SLA & uptime         | —          | —          | ✓         |
| Dedicated onboarding | —          | —          | ✓         |
| Support              | Community  | Email      | Dedicated + Slack |

SLA is **Business only**.

## Enforcement

### Plan storage & propagation

- Plan is stored in Clerk `publicMetadata.plan`, one of
  `"starter" | "team" | "business"`.
- It is mirrored into the **session JWT** (custom claim `plan`) so both the
  Next.js middleware and the backend API gateway can read it without a DB hit.
- The JWT is the read path for gating decisions; `publicMetadata` is the write
  path (updated by billing webhooks). On plan change, force a token refresh so
  the claim is current.

### API gateway

- Each endpoint is tagged with a **required capability** (e.g.
  `sdk.serve`, `sdk.authz`, `sdk.memory`).
- A static map resolves **capability → minimum plan**.
- If the caller's plan is below the minimum, respond **403** with an
  upgrade-hint payload:

  ```json
  {
    "error": "PLAN_UPGRADE_REQUIRED",
    "capability": "sdk.authz",
    "currentPlan": "starter",
    "requiredPlan": "team"
  }
  ```

### Quota enforcement

- Per-plan **monthly request counters** keyed by account + billing period.
- **Hard-stop** at the limit: further requests return 429 with an upgrade
  prompt payload.
- **Overage grace of 10%** above the plan limit before the hard stop engages
  (e.g. Starter 25K → soft ceiling 27.5K), to avoid abrupt mid-month cutoffs.
- Counters reset at the start of each billing period.

### Downgrade / upgrade semantics

- Feature flags **flip immediately** on plan change (both unlocks on upgrade and
  restrictions on downgrade), driven by the refreshed JWT claim.
- On downgrade, data retained **beyond the new retention window** is
  **archived, not deleted, for 30 days**, giving the user a window to re-upgrade
  or export before permanent deletion.
- Seat counts over the new limit block new invites but do not forcibly remove
  existing members; the account is flagged over-limit until reconciled.
