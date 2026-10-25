import { scan, ScanError } from "@/lib/agentscan/scanner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/scan?url=example.com → Agent Readiness Score as JSON (the
 * redesign's api/scan.js as a route handler). POST { url } works too, for the
 * WebMCP tool and agents. Free and unauthenticated, so it's rate-limited per
 * IP; the limit is per-instance memory, enough to stop a loop.
 */

const hits = new Map<string, number[]>();
const LIMIT = 12;
const WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function send(status: number, body: unknown, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { ...CORS, ...headers } });
}

async function handle(req: Request, url: string | null) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (rateLimited(ip)) return send(429, { error: "Too many scans. Try again in a minute." });

  try {
    const result = await Promise.race([
      scan(url),
      new Promise((_, reject) => setTimeout(() => reject(new ScanError("The scan took too long. Try again.", 504)), 28_000)),
    ]);
    return send(200, result, { "Cache-Control": "public, max-age=0, s-maxage=300" });
  } catch (err) {
    const status = err instanceof ScanError ? err.status : 500;
    return send(status, { error: err instanceof ScanError ? err.message : "Something went wrong. Try again." });
  }
}

export function GET(req: Request) {
  return handle(req, new URL(req.url).searchParams.get("url"));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  return handle(req, new URL(req.url).searchParams.get("url") ?? (typeof body?.url === "string" ? body.url : null));
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
