# Plan Entitlements — Source of Truth

This document is the authoritative spec the backend must implement for plan
gating: **which plan gets access to which tool**. It covers both product
surfaces — the Intelligence platform (dashboard, analytics, forecasting) and
the SDK / WebMCP tooling (serving tools to agents) — plus platform limits. When
the pricing page and this document disagree, this document wins; update it in
the same PR that changes pricing.

## Plans

| Plan     | Monthly | Yearly (2 months free) | Positioning |
|----------|---------|------------------------|-------------|
| Observer | $29     | $290                   | Intelligence only — see what agents do on your site. No SDK. |
| Starter  | $49     | $490                   | Measure + serve tools on a single source. |
| Team     | $199    | $1,990                 | Full governance for growing agent traffic. |
| Business | Custom  | Custom                 | Enterprise-grade for established platforms. |

Plan ids used everywhere in code: `"observer" | "starter" | "team" | "business"`.

## Key rule — Observer has zero SDK access

Observer is an **intelligence-only** tier. It receives no SDK capabilities of
any kind:

- No site registration.
- No WebMCP tool serving (cannot expose tools to agents).
- No tool management / registry.

Enforcement:

- The SDK **rejects an Observer-plan key at init** with error code
  `PLAN_NO_SDK` (HTTP 403 from the key-validation endpoint). The SDK must fail
  loudly at `init()`, not silently no-op.
- The dashboard **hides all SDK sections** behind an upgrade prompt for Observer
  users (registration, tool registry, auth config, serving analytics).

Upgrading Observer → Starter (or higher) unlocks SDK access immediately.

## Capability × Plan matrix

### Intelligence platform tools

| Capability                              | Observer | Starter | Team | Business |
|-----------------------------------------|:--------:|:-------:|:----:|:--------:|
| Intelligence dashboard                  | ✓        | ✓       | ✓    | ✓        |
| Agent-traffic analytics                 | ✓        | ✓       | ✓    | ✓        |
| ML forecasting                          | ✓        | ✓       | ✓    | ✓        |
| Statistical / anomaly analysis          | ✓        | ✓       | ✓    | ✓        |
| Natural-language insights (LLM)         | —        | —       | ✓    | ✓        |
| Agent chat (conversational analytics)   | —        | —       | ✓    | ✓        |
| Data-source connectors                  | 1 source | 1 source | All  | All + licensed enrichment |

### SDK / WebMCP tools

| Capability                              | Observer | Starter | Team | Business |
|-----------------------------------------|:--------:|:-------:|:----:|:--------:|
| SDK install & site registration         | —        | ✓       | ✓    | ✓        |
| WebMCP tool serving                     | —        | ✓       | ✓    | ✓        |
| Tool management / registry              | —        | ✓       | ✓    | ✓        |
| Agent authentication                    | —        | Basic   | Full | Full + SSO |
| Authorization (scoped permissions)      | —        | —       | ✓    | Advanced |
| Agent memory & context transfer         | —        | —       | ✓    | ✓        |
| Observability & audit trail             | Basic    | Basic   | Full | Audit-grade + export |

Notes:

- **Agent detection & fingerprinting** is measurement-side and available to all
  plans, including Observer (it does not require the SDK).
- Observer's "Basic" observability applies to measured traffic only (no served
  tools to audit).

### Platform limits

| Limit                | Observer   | Starter    | Team       | Business  |
|----------------------|:----------:|:----------:|:----------:|:---------:|
| Agent requests / mo  | 10K        | 25K        | 1M         | Unlimited |
| Data retention       | 14 days    | 30 days    | 90 days    | Custom    |
| Team seats           | 1          | 2          | 10         | Unlimited |
| SSO / SAML           | —          | —          | —          | ✓         |
| SLA & uptime         | —          | —          | —          | ✓         |
| Dedicated onboarding | —          | —          | —          | ✓         |
| Support              | Community  | Community  | Email      | Dedicated + Slack |

SLA is **Business only**.

## Enforcement

### Plan storage & propagation

- Plan is stored in Clerk `publicMetadata.plan`, one of
  `"observer" | "starter" | "team" | "business"`.
- It is mirrored into the **session JWT** (custom claim `plan`) so both the
  Next.js middleware and the backend API gateway can read it without a DB hit.
- The JWT is the read path for gating decisions; `publicMetadata` is the write
  path (updated by billing webhooks). On plan change, force a token refresh so
  the claim is current.

### API gateway

- Each endpoint is tagged with a **required capability** (e.g.
  `sdk.serve`, `intel.nl_insights`, `intel.agent_chat`).
- A static map resolves **capability → minimum plan**.
- If the caller's plan is below the minimum, respond **403** with an
  upgrade-hint payload:

  ```json
  {
    "error": "PLAN_UPGRADE_REQUIRED",
    "capability": "sdk.serve",
    "currentPlan": "observer",
    "requiredPlan": "starter"
  }
  ```

- The SDK key-validation path is a special case: an Observer key hitting any
  `sdk.*` capability returns `PLAN_NO_SDK` at `init()`.

### Quota enforcement

- Per-plan **monthly request counters** keyed by account + billing period.
- **Hard-stop** at the limit: further requests return 429 with an upgrade
  prompt payload.
- **Overage grace of 10%** above the plan limit before the hard stop engages
  (e.g. Observer 10K → soft ceiling 11K), to avoid abrupt mid-month cutoffs.
- Counters reset at the start of each billing period.

### Downgrade / upgrade semantics

- Feature flags **flip immediately** on plan change (both unlocks on upgrade and
  restrictions on downgrade), driven by the refreshed JWT claim.
- On downgrade, data retained **beyond the new retention window** is
  **archived, not deleted, for 30 days**, giving the user a window to re-upgrade
  or export before permanent deletion.
- Seat counts over the new limit block new invites but do not forcibly remove
  existing members; the account is flagged over-limit until reconciled.
