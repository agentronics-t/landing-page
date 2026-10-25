/**
 * Facts the policy pages (/terms, /privacy, /refunds, /contact) share. Change
 * them here, never in one page only. Confirmed by the founders 2026-10-25.
 */
export const LEGAL = {
  name: "Agentronics",
  operators: "Neelakandan NC and Kuppala Sarath Narendra",
  country: "India",
  email: "agentronics.help@gmail.com",
  site: "https://www.agentronics.dev",
  updated: "25 October 2026",
  /** We aim to answer within this many business days. */
  replyDays: 2,
} as const;
