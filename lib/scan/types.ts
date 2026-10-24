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
}

export const CATEGORY_META: Record<CategoryId, { label: string; question: string }> = {
  find: { label: "Find", question: "Can AI agents find your site?" },
  read: { label: "Read", question: "Can they understand what's on it?" },
  act: { label: "Act", question: "Can they actually do things on it?" },
};

export function scoreBand(score: number): { label: string; tone: "good" | "ok" | "poor" } {
  if (score >= 80) return { label: "Agent-ready", tone: "good" };
  if (score >= 50) return { label: "Partly ready", tone: "ok" };
  return { label: "Not ready", tone: "poor" };
}
