import "server-only";
import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import { Readable } from "node:stream";
import zlib from "node:zlib";

/**
 * The scanner fetches URLs typed in by strangers. scanner.js checks each hop's
 * DNS answer before it connects; this fetch resolves DNS again *at connect
 * time* through `safeLookup` and refuses private, loopback, link-local and
 * other reserved ranges, so a DNS-rebinding answer can't slip past that first
 * check. Same shape as the bits of fetch()'s Response the scanner reads:
 * status, headers.get() and a web ReadableStream body.
 */

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
    if (list.length === 0 || list.some((a) => isBlockedAddress(a.address))) {
      const e = new Error("blocked address") as NodeJS.ErrnoException;
      e.code = "EBLOCKED";
      return callback(e, "");
    }
    if ((options as { all?: boolean }).all) return callback(null, list);
    return callback(null, list[0].address, list[0].family);
  });
}

// Local testing only (scanning this site on localhost), same switch as scanner.js.
const allowPrivate = () => process.env.SCAN_ALLOW_PRIVATE === "1";

const NULL_BODY = new Set([101, 103, 204, 205, 304]);

export interface PinnedResponse {
  status: number;
  headers: Headers;
  body: ReadableStream<Uint8Array> | null;
}

export function pinnedFetch(
  url: URL,
  init: { method?: string; headers?: Record<string, string>; signal?: AbortSignal; redirect?: "manual" },
): Promise<PinnedResponse> {
  const method = init.method ?? "GET";
  return new Promise((resolve, reject) => {
    const mod = url.protocol === "https:" ? https : http;
    const req = mod.request(
      url,
      {
        method,
        signal: init.signal,
        headers: { "accept-encoding": "gzip, br, deflate", ...init.headers },
        ...(allowPrivate() ? {} : { lookup: safeLookup as unknown as typeof dnsLookup }),
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const headers = new Headers();
        for (const [k, v] of Object.entries(res.headers)) {
          if (v === undefined || k === "set-cookie") continue;
          for (const one of Array.isArray(v) ? v : [v]) headers.append(k, one);
        }
        if (method === "HEAD" || NULL_BODY.has(status)) {
          res.resume();
          return resolve({ status, headers, body: null });
        }
        const enc = String(res.headers["content-encoding"] || "").toLowerCase();
        const stream =
          enc === "gzip" || enc === "x-gzip" ? res.pipe(zlib.createGunzip())
          : enc === "br" ? res.pipe(zlib.createBrotliDecompress())
          : enc === "deflate" ? res.pipe(zlib.createInflate())
          : res;
        stream.on("error", () => res.destroy());
        resolve({ status, headers, body: Readable.toWeb(stream as Readable) as ReadableStream<Uint8Array> });
      },
    );
    req.on("error", reject);
    req.end();
  });
}
