import "server-only";
import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import zlib from "node:zlib";

/**
 * A fetch for URLs typed in by strangers. Every connection — including each
 * redirect hop — resolves DNS through `safeLookup`, which refuses private,
 * loopback, link-local and other reserved ranges at connect time (so DNS
 * rebinding can't slip past an earlier check). Only http/https on ports
 * 80/443, a hard size cap, a hard deadline, at most 5 redirects.
 */

export const SCAN_USER_AGENT =
  "Mozilla/5.0 (compatible; AgentronicsScan/1.0; +https://agentronics.dev/scan)";

const MAX_REDIRECTS = 5;

export class ScanFetchError extends Error {
  constructor(
    message: string,
    readonly code: "blocked" | "unreachable" | "timeout" | "too_large" | "bad_url",
  ) {
    super(message);
  }
}

export interface FetchResult {
  url: string; // final URL after redirects
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
  truncated: boolean;
}

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

const BLOCKED_V4: [string, number][] = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
];

export function isBlockedAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const n = ipv4ToInt(ip);
    return BLOCKED_V4.some(([base, bits]) => {
      const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
      return (n & mask) === (ipv4ToInt(base) & mask);
    });
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedAddress(mapped[1]);
    if (lower === "::" || lower === "::1") return true;
    const first = parseInt(lower.split(":")[0] || "0", 16);
    if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link local
    if ((first & 0xff00) === 0xff00) return true; // multicast
    if (lower.startsWith("64:ff9b:") || lower.startsWith("2001:db8:")) return true;
    return false;
  }
  return true;
}

type LookupCb = (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void;

function safeLookup(hostname: string, options: object, callback: LookupCb) {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "");
    const list = addresses as LookupAddress[];
    const bad = list.find((a) => isBlockedAddress(a.address));
    if (bad || list.length === 0) {
      const e = new Error("blocked address") as NodeJS.ErrnoException;
      e.code = "EBLOCKED";
      return callback(e, "");
    }
    // honour the caller's `all` flag
    if ((options as { all?: boolean }).all) return callback(null, list);
    return callback(null, list[0].address, list[0].family);
  });
}

/** Parse and normalise what someone typed: adds https://, drops credentials and fragments. */
export function normaliseTarget(input: string): URL {
  let raw = input.trim();
  if (!raw) throw new ScanFetchError("Enter a website address.", "bad_url");
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ScanFetchError("That doesn't look like a website address.", "bad_url");
  }
  assertAllowedUrl(url);
  url.username = "";
  url.password = "";
  url.hash = "";
  return url;
}

function assertAllowedUrl(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ScanFetchError("Only http and https websites can be checked.", "bad_url");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new ScanFetchError("Only websites on the standard ports can be checked.", "bad_url");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host) ? isBlockedAddress(host) : !host.includes(".") || /\.(local|localhost|internal|lan|home|corp)$/i.test(host) || host === "localhost") {
    throw new ScanFetchError("That address isn't a public website.", "blocked");
  }
}

function decode(res: http.IncomingMessage): NodeJS.ReadableStream {
  const enc = String(res.headers["content-encoding"] || "").toLowerCase();
  if (enc === "gzip" || enc === "x-gzip") return res.pipe(zlib.createGunzip());
  if (enc === "br") return res.pipe(zlib.createBrotliDecompress());
  if (enc === "deflate") return res.pipe(zlib.createInflate());
  return res;
}

function requestOnce(url: URL, deadline: number, maxBytes: number): Promise<FetchResult & { location?: string }> {
  return new Promise((resolve, reject) => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return reject(new ScanFetchError("The site took too long to answer.", "timeout"));
    const mod = url.protocol === "https:" ? https : http;
    const req = mod.request(
      url,
      {
        method: "GET",
        lookup: safeLookup as unknown as typeof dnsLookup,
        headers: {
          "user-agent": SCAN_USER_AGENT,
          accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
          "accept-encoding": "gzip, br, deflate",
          "accept-language": "en",
        },
        timeout: remaining,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          return resolve({ url: url.toString(), status, headers: res.headers, body: "", truncated: false, location: res.headers.location });
        }
        const chunks: Buffer[] = [];
        let size = 0;
        let truncated = false;
        let stream: NodeJS.ReadableStream;
        try {
          stream = decode(res);
        } catch {
          stream = res;
        }
        stream.on("data", (chunk: Buffer) => {
          if (truncated) return;
          size += chunk.length;
          if (size > maxBytes) {
            truncated = true;
            chunks.push(chunk.subarray(0, chunk.length - (size - maxBytes)));
            res.destroy();
            finish();
            return;
          }
          chunks.push(chunk);
        });
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          resolve({ url: url.toString(), status, headers: res.headers, body: Buffer.concat(chunks).toString("utf8"), truncated });
        };
        stream.on("end", finish);
        stream.on("error", () => (truncated ? finish() : reject(new ScanFetchError("The site's response couldn't be read.", "unreachable"))));
      },
    );
    // `timeout` above is idle time; this is the hard wall-clock deadline.
    const timer = setTimeout(() => req.destroy(new ScanFetchError("The site took too long to answer.", "timeout")), remaining);
    req.on("close", () => clearTimeout(timer));
    req.on("timeout", () => {
      req.destroy();
      reject(new ScanFetchError("The site took too long to answer.", "timeout"));
    });
    req.on("error", (err: NodeJS.ErrnoException) => {
      if (err instanceof ScanFetchError) return reject(err);
      if (err.code === "EBLOCKED") return reject(new ScanFetchError("That address isn't a public website.", "blocked"));
      reject(new ScanFetchError("We couldn't reach that site.", "unreachable"));
    });
    req.end();
  });
}

/** GET with redirects followed manually, each hop re-validated. */
export async function safeFetch(
  input: URL,
  { timeoutMs = 8000, maxBytes = 1_500_000 }: { timeoutMs?: number; maxBytes?: number } = {},
): Promise<FetchResult> {
  const deadline = Date.now() + timeoutMs;
  let url = input;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertAllowedUrl(url);
    const res = await requestOnce(url, deadline, maxBytes);
    if (!res.location) return res;
    url = new URL(res.location, url);
  }
  throw new ScanFetchError("The site redirects too many times.", "unreachable");
}

/** Like safeFetch but returns null instead of throwing — for optional files (robots.txt, llms.txt…). */
export async function tryFetch(url: URL, opts?: { timeoutMs?: number; maxBytes?: number }): Promise<FetchResult | null> {
  try {
    return await safeFetch(url, opts);
  } catch {
    return null;
  }
}
