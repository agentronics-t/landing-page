import { NextResponse } from "next/server";
import { normaliseTarget, ScanFetchError } from "@/lib/scan/fetch";
import { scanSite } from "@/lib/scan/checks";
import type { ScanReport } from "@/lib/scan/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/scan { url } → ScanReport. Free and unauthenticated, so it's
 * rate-limited per IP and cached per URL. Both are per-instance memory: good
 * enough to stop a loop, not a global quota.
 */

const PER_MINUTE = 6;
const PER_HOUR = 30;
const CACHE_MS = 10 * 60_000;

const hits = new Map<string, number[]>();
const cache = new Map<string, { at: number; report: ScanReport }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  const lastMinute = recent.filter((t) => now - t < 60_000).length;
  if (lastMinute >= PER_MINUTE || recent.length >= PER_HOUR) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.delete(hits.keys().next().value!);
  return false;
}

const STATUS: Record<ScanFetchError["code"], number> = {
  bad_url: 400,
  blocked: 400,
  unreachable: 422,
  timeout: 422,
  too_large: 422,
};

export async function POST(req: Request) {
  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send JSON: { \"url\": \"example.com\" }" }, { status: 400 });
  }
  if (typeof body.url !== "string" || body.url.length > 2048) {
    return NextResponse.json({ error: "Enter a website address." }, { status: 400 });
  }

  let target: URL;
  try {
    target = normaliseTarget(body.url);
  } catch (e) {
    const err = e as ScanFetchError;
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const key = target.toString();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return NextResponse.json(hit.report, { headers: { "cache-control": "no-store" } });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (limited(ip)) {
    return NextResponse.json(
      { error: "That's a lot of scans. Try again in a minute." },
      { status: 429, headers: { "retry-after": "60" } },
    );
  }

  try {
    const report = await scanSite(target);
    cache.set(key, { at: Date.now(), report });
    if (cache.size > 500) cache.delete(cache.keys().next().value!);
    return NextResponse.json(report, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    if (e instanceof ScanFetchError) {
      return NextResponse.json({ error: e.message }, { status: STATUS[e.code] });
    }
    console.error("[scan] failed", key, e);
    return NextResponse.json({ error: "Something went wrong while checking that site. Try again." }, { status: 500 });
  }
}
