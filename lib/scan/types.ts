/** Shapes shared by the scan API (/api/scan) and the report UI. */

export type CategoryId = "find" | "read" | "act";
export type CheckStatus = "pass" | "warn" | "fail" | "skip";

export interface ScanCheck {
  id: string;
  category: CategoryId;
  label: string;
  status: CheckStatus;
  points: number;
  max: number;
  /** What we saw, in plain words. */
  detail: string;
  /** What to do about it (absent on a pass). */
  fix?: string;
}

export interface ScanCategory {
  id: CategoryId;
  label: string;
  question: string;
  score: number;
  max: number;
}

export interface ScanReport {
  url: string;
  finalUrl: string;
  host: string;
  scannedAt: string;
  score: number; // 0–100
  categories: ScanCategory[];
  checks: ScanCheck[];
  /** What the page itself contains — used to suggest a plan. */
  stats?: { forms: number };
}

export const CATEGORY_META: Record<CategoryId, { label: string; question: string }> = {
  find: { label: "Find", question: "Can AI agents find your site?" },
  read: { label: "Read", question: "Can they understand what's on it?" },
  act: { label: "Act", question: "Can they book, buy or sign up?" },
};

export type BandTone = "poor" | "ok" | "good";

/** Score bands (spec v3 §3.5): 0–40 Not ready, 41–70 Partly ready, 71–100 Agent-ready. */
export const BANDS: { tone: BandTone; from: number; to: number; label: string; meaning: string }[] = [
  { tone: "poor", from: 0, to: 40, label: "Not ready", meaning: "Most AI agents can't use your site. They skip you and pick a competitor." },
  { tone: "ok", from: 41, to: 70, label: "Partly ready", meaning: "Agents find you, then get stuck on prices, forms or buttons." },
  { tone: "good", from: 71, to: 100, label: "Agent-ready", meaning: "Agents can read your site and finish tasks. Keep it that way as your site changes." },
];

export const AGENT_READY_AT = 71;

export function scoreBand(score: number) {
  return BANDS.find((b) => score <= b.to) ?? BANDS[2];
}

/** Fills and marks (arcs, bars). */
export const BAND_COLOR: Record<BandTone, string> = {
  poor: "var(--rust)",
  ok: "var(--amber)",
  good: "var(--verdigris)",
};

/** Text in a band's colour — AA on both Bone and PCB Black (amber/verdigris fail as text on Bone). */
export const BAND_TEXT: Record<BandTone, string> = {
  poor: "var(--danger)",
  ok: "var(--warning)",
  good: "var(--success)",
};

/** Checks that count toward the score (skipped ones don't). */
export function countedChecks(report: ScanReport) {
  return report.checks.filter((c) => c.status !== "skip");
}

/**
 * Goal-gradient plan, from the scanner's real weights: fixes ordered by points
 * gained. Below Agent-ready, it's the fewest fixes that reach 71; at or above,
 * it's every remaining fix (the road to 100). `projected` is the score after them.
 */
export function fixPlan(report: ScanReport): { fixes: ScanCheck[]; projected: number } {
  const counted = countedChecks(report);
  const total = counted.reduce((s, c) => s + c.max, 0) || 1;
  let earned = counted.reduce((s, c) => s + c.points, 0);
  const pct = () => Math.round((earned / total) * 100);
  const open = counted.filter((c) => c.points < c.max).sort((a, b) => b.max - b.points - (a.max - a.points));
  const fixes: ScanCheck[] = [];
  for (const c of open) {
    if (report.score < AGENT_READY_AT && pct() >= AGENT_READY_AT) break;
    earned += c.max - c.points;
    fixes.push(c);
  }
  return { fixes, projected: pct() };
}

/**
 * Checks whose fix Agent Nick writes today: it publishes WebMCP tools, and
 * exposes forms as tools. The rest (sitemap, llms.txt, structured data,
 * server rendering, labels…) come with written instructions in the report.
 */
export const AGENT_NICK_FIXES = new Set(["webmcp", "forms"]);

/** "What agents miss on your site today" — one concrete line per failing check, from the user's own scan. */
export const MISSES: Record<string, string> = {
  "ai-crawlers": "Your robots.txt turns away the assistants people use to find you.",
  sitemap: "Agents only find the pages linked from your home page.",
  "llms-txt": "AI tools get no short guide to who you are and where things are.",
  meta: "Assistants have no clear one-line description of what you offer.",
  content: "Your content loads with JavaScript, so most agents see an empty page.",
  "structured-data": "Agents have to guess your prices, products and facts.",
  structure: "Agents can't tell your main content from the rest of the page.",
  names: "Some buttons and links have no name, so agents can't tell Buy from Close.",
  "img-alt": "Agents can't tell what your images show.",
  webmcp: "Agents can't book, buy or sign up directly. They click around and often give up.",
  forms: "Agents have to guess what goes in your form fields.",
  "bot-wall": "Your bot protection stops AI agents before they see anything.",
};
