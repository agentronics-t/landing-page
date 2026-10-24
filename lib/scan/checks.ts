import "server-only";
import { parse, type HTMLElement } from "node-html-parser";
import { safeFetch, tryFetch, ScanFetchError, type FetchResult } from "./fetch";
import { CATEGORY_META, type CategoryId, type CheckStatus, type ScanCheck, type ScanReport } from "./types";

/**
 * The free agent-readiness scan. Fetches the page the way an agent would (no
 * JavaScript), plus robots.txt, llms.txt, the sitemap and a few of the page's
 * own scripts, and scores 12 checks across Find / Read / Act. Weights sum to
 * 100. A "warn" earns half the points; a "skip" (nothing to check, e.g. no
 * forms) leaves the check out of the total.
 */

const WEIGHTS: Record<string, number> = {
  "ai-crawlers": 10,
  sitemap: 5,
  "llms-txt": 4,
  meta: 5,
  content: 12,
  "structured-data": 8,
  structure: 6,
  names: 6,
  "img-alt": 4,
  webmcp: 18,
  forms: 10,
  "bot-wall": 12,
};

const ASSISTANT_BOTS = ["ChatGPT-User", "OAI-SearchBot", "Claude-User", "Claude-SearchBot", "Perplexity-User", "PerplexityBot"];
const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot", "Applebot-Extended"];

const CHALLENGE_MARKERS = [
  "cf-chl", "challenge-platform", "cf-browser-verification", "attention required! | cloudflare",
  "_incapsula_resource", "px-captcha", "captcha-delivery.com", "datadome", "just a moment...",
];
const CAPTCHA_MARKERS = ["g-recaptcha", "recaptcha/api.js", "h-captcha", "hcaptcha.com", "cf-turnstile", "challenges.cloudflare.com/turnstile"];

type Draft = Omit<ScanCheck, "points" | "max">;

function check(id: string, category: CategoryId, label: string, status: CheckStatus, detail: string, fix?: string): Draft {
  return { id, category, label, status, detail, ...(status === "pass" || status === "skip" ? {} : { fix }) };
}

const pct = (n: number, d: number) => (d === 0 ? 1 : n / d);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* --------------------------------- robots --------------------------------- */

interface RobotsGroup {
  agents: string[];
  rules: { allow: boolean; path: string }[];
}

export function parseRobots(text: string): { groups: RobotsGroup[]; sitemaps: string[] } {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (key === "sitemap" && value) sitemaps.push(value);
      else if (current && (key === "allow" || key === "disallow")) current.rules.push({ allow: key === "allow", path: value });
    }
  }
  return { groups, sitemaps };
}

/** True when the bot may not fetch "/" — the most specific matching group decides. */
export function blocksRoot(groups: RobotsGroup[], bot: string): boolean {
  const name = bot.toLowerCase();
  const specific = groups.filter((g) => g.agents.some((a) => a !== "*" && name.includes(a)));
  const group = specific.length ? specific : groups.filter((g) => g.agents.includes("*"));
  const rules = group.flatMap((g) => g.rules);
  const disallowAll = rules.some((r) => !r.allow && (r.path === "/" || r.path === "/*"));
  const allowRoot = rules.some((r) => r.allow && (r.path === "/" || r.path === "/$" || r.path === "/*"));
  return disallowAll && !allowRoot;
}

function checkCrawlers(robots: FetchResult | null): { draft: Draft; sitemaps: string[] } {
  const label = "AI assistants are allowed in";
  if (!robots || robots.status >= 400 || /<html/i.test(robots.body.slice(0, 500))) {
    return {
      draft: check("ai-crawlers", "find", label, "pass", "No robots.txt rules, so every AI assistant may read the site."),
      sitemaps: [],
    };
  }
  const { groups, sitemaps } = parseRobots(robots.body);
  const blockedAssistants = ASSISTANT_BOTS.filter((b) => blocksRoot(groups, b));
  const blockedTraining = TRAINING_BOTS.filter((b) => blocksRoot(groups, b));
  const trainingNote = blockedTraining.length
    ? ` You opt out of AI training (${blockedTraining.join(", ")}), which doesn't stop assistants from visiting.`
    : "";
  if (blockedAssistants.length === 0) {
    return {
      draft: check("ai-crawlers", "find", label, "pass", `robots.txt lets ChatGPT, Claude and Perplexity read the site.${trainingNote}`),
      sitemaps,
    };
  }
  const all = blockedAssistants.length === ASSISTANT_BOTS.length;
  return {
    draft: check(
      "ai-crawlers",
      "find",
      label,
      all ? "fail" : "warn",
      `robots.txt blocks ${blockedAssistants.join(", ")}. These fetch pages when a person asks their assistant about you.${trainingNote}`,
      "Allow the assistant agents (ChatGPT-User, OAI-SearchBot, Claude-User, Claude-SearchBot, Perplexity-User, PerplexityBot) in robots.txt. You can keep blocking training crawlers like GPTBot and ClaudeBot.",
    ),
    sitemaps,
  };
}

/* ---------------------------------- page ---------------------------------- */

function visibleText(root: HTMLElement): string {
  const body = (root.querySelector("body") ?? root).clone() as HTMLElement;
  body.querySelectorAll("script,style,noscript,template,svg").forEach((n) => n.remove());
  return body.textContent.replace(/\s+/g, " ").trim();
}

function checkContent(root: HTMLElement): Draft {
  const text = visibleText(root);
  const n = text.length;
  const label = "Content is there without JavaScript";
  if (n >= 600) return check("content", "read", label, "pass", `${n.toLocaleString("en-US")} characters of text are in the page itself.`);
  const fix =
    "Render the main content on the server (server-side rendering or static generation). Most agents read the HTML and don't run your JavaScript.";
  if (n >= 150) return check("content", "read", label, "warn", `Only ${n} characters of text arrive without JavaScript.`, fix);
  return check("content", "read", label, "fail", "The page is almost empty until JavaScript runs, so agents that read HTML see a blank page.", fix);
}

function jsonLdTypes(root: HTMLElement): string[] {
  const types = new Set<string>();
  const collect = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(collect);
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") types.add(t);
    else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x));
    if (obj["@graph"]) collect(obj["@graph"]);
  };
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      collect(JSON.parse(s.textContent));
    } catch {
      /* invalid JSON-LD counts as none */
    }
  }
  return [...types];
}

function checkStructuredData(root: HTMLElement): Draft {
  const label = "Structured data describes the business";
  const types = jsonLdTypes(root);
  if (types.length) return check("structured-data", "read", label, "pass", `Found schema.org data: ${types.slice(0, 5).join(", ")}.`);
  const fix =
    "Add schema.org JSON-LD (Organization, Product, Offer, FAQPage…) so agents get prices, products and facts without guessing.";
  if (root.querySelector("[itemtype]") || root.querySelector('meta[property="og:title"]')) {
    return check("structured-data", "read", label, "warn", "Only Open Graph or microdata tags, no JSON-LD.", fix);
  }
  return check("structured-data", "read", label, "fail", "No structured data on the page.", fix);
}

function checkStructure(root: HTMLElement): Draft {
  const label = "Page structure is clear";
  const h1 = root.querySelectorAll("h1").length;
  const lang = !!root.querySelector("html")?.getAttribute("lang");
  const main = !!root.querySelector("main, [role=main]");
  const ok = [h1 >= 1, lang, main].filter(Boolean).length;
  const missing = [h1 === 0 && "a main heading (h1)", !lang && "a language (html lang)", !main && "a <main> region"].filter(Boolean);
  if (ok === 3) return check("structure", "read", label, "pass", "Main heading, language and main content region are all marked up.");
  return check(
    "structure",
    "read",
    label,
    ok === 2 ? "warn" : "fail",
    `Missing ${missing.join(", ")}.`,
    "Give the page one h1, set <html lang>, and wrap the main content in <main> so agents know what matters.",
  );
}

function hasName(el: HTMLElement): boolean {
  if (el.getAttribute("aria-label")?.trim() || el.getAttribute("aria-labelledby") || el.getAttribute("title")?.trim()) return true;
  if (el.textContent.trim()) return true;
  if (el.querySelectorAll("img").some((img) => img.getAttribute("alt")?.trim())) return true;
  if (el.querySelector("svg title")) return true;
  if (el.tagName === "INPUT" && el.getAttribute("value")?.trim()) return true;
  return false;
}

function checkNames(root: HTMLElement): Draft {
  const label = "Links and buttons say what they do";
  const els = root.querySelectorAll('a[href], button, [role="button"], input[type="submit"], input[type="button"]');
  if (els.length === 0) return check("names", "read", label, "skip", "No links or buttons in the HTML.");
  const unnamed = els.filter((el) => !hasName(el)).length;
  const ratio = pct(els.length - unnamed, els.length);
  if (ratio >= 0.95) return check("names", "read", label, "pass", `${els.length} links and buttons, all named.`);
  return check(
    "names",
    "read",
    label,
    ratio >= 0.8 ? "warn" : "fail",
    `${plural(unnamed, "link or button", "links or buttons")} out of ${els.length} have no text or label, so an agent can't tell what they do.`,
    "Give icon-only links and buttons an aria-label (\"Add to cart\", \"Open menu\").",
  );
}

function checkImages(root: HTMLElement): Draft {
  const label = "Images have descriptions";
  const imgs = root.querySelectorAll("img");
  if (imgs.length === 0) return check("img-alt", "read", label, "skip", "No images in the HTML.");
  const missing = imgs.filter((img) => img.getAttribute("alt") === undefined).length;
  const ratio = pct(imgs.length - missing, imgs.length);
  if (ratio >= 0.9) return check("img-alt", "read", label, "pass", `${imgs.length} images, ${imgs.length - missing} with alt text.`);
  return check(
    "img-alt",
    "read",
    label,
    ratio >= 0.6 ? "warn" : "fail",
    `${plural(missing, "image")} out of ${imgs.length} have no alt text.`,
    "Add alt text that says what each image shows (alt=\"\" for decorative ones).",
  );
}

function checkMeta(root: HTMLElement): Draft {
  const label = "Title and description are set";
  const title = root.querySelector("title")?.textContent.trim();
  const desc = root.querySelector('meta[name="description"]')?.getAttribute("content")?.trim();
  if (title && desc) return check("meta", "find", label, "pass", `"${title.slice(0, 70)}"`);
  return check(
    "meta",
    "find",
    label,
    title || desc ? "warn" : "fail",
    !title && !desc ? "No page title or meta description." : !title ? "No page title." : "No meta description.",
    "Write a title and a one-sentence meta description that say what you offer. Agents quote them when they recommend you.",
  );
}

function checkForms(root: HTMLElement): Draft {
  const label = "Form fields are labelled";
  const fields = root
    .querySelectorAll("input, select, textarea")
    .filter((el) => !/^(hidden|submit|button|reset|image)$/i.test(el.getAttribute("type") ?? ""));
  if (fields.length === 0) return check("forms", "act", label, "skip", "No forms on this page.");
  const labelFor = new Set(root.querySelectorAll("label[for]").map((l) => l.getAttribute("for")));
  let score = 0;
  let unlabelled = 0;
  for (const f of fields) {
    const id = f.getAttribute("id");
    let insideLabel = false;
    for (let p = f.parentNode as HTMLElement | null; p; p = p.parentNode as HTMLElement | null) {
      if (p.tagName === "LABEL") insideLabel = true;
    }
    if ((id && labelFor.has(id)) || insideLabel || f.getAttribute("aria-label") || f.getAttribute("aria-labelledby") || f.getAttribute("title")) {
      score += 1;
    } else if (f.getAttribute("placeholder")) {
      score += 0.5;
      unlabelled++;
    } else unlabelled++;
  }
  const ratio = score / fields.length;
  if (ratio >= 0.9) return check("forms", "act", label, "pass", `${plural(fields.length, "field")}, all labelled.`);
  return check(
    "forms",
    "act",
    label,
    ratio >= 0.6 ? "warn" : "fail",
    `${plural(unlabelled, "field")} out of ${fields.length} rely on a placeholder or have no label, so agents have to guess what goes in them.`,
    "Connect every field to a <label>. Better still, expose the form as a WebMCP tool so agents fill it directly.",
  );
}

function checkBotWall(page: FetchResult, html: string): { draft: Draft; blocked: boolean } {
  const label = "Agents aren't stopped by bot checks";
  const lower = html.slice(0, 200_000).toLowerCase();
  const challenge = CHALLENGE_MARKERS.some((m) => lower.includes(m));
  if ([401, 403, 429, 503].includes(page.status) || (challenge && page.status >= 400) || (challenge && visibleTextLength(html) < 400)) {
    return {
      draft: check(
        "bot-wall",
        "act",
        label,
        "fail",
        `The site answered our agent with ${page.status >= 400 ? `HTTP ${page.status}` : "a bot challenge"} instead of the page. Most AI agents get the same.`,
        "Let known AI agents through your bot protection (most providers have a verified-bots or AI-agents setting), and verify them instead of blocking them.",
      ),
      blocked: true,
    };
  }
  if (CAPTCHA_MARKERS.some((m) => lower.includes(m))) {
    return {
      draft: check(
        "bot-wall",
        "act",
        label,
        "warn",
        "The page loads a CAPTCHA, which stops agents from finishing forms.",
        "Keep the CAPTCHA for unknown traffic but let verified agents skip it, or offer the action as a WebMCP tool.",
      ),
      blocked: false,
    };
  }
  return { draft: check("bot-wall", "act", label, "pass", "The page loaded for our agent without a challenge."), blocked: false };
}

function visibleTextLength(html: string) {
  try {
    return visibleText(parse(html)).length;
  } catch {
    return 0;
  }
}

/* --------------------------------- WebMCP --------------------------------- */

const usesWebMcp = (src: string) =>
  src.includes("modelContext") && (src.includes("registerTool") || src.includes("provideContext"));

async function checkWebMcp(root: HTMLElement, pageUrl: URL): Promise<Draft> {
  const label = "Agents can call your actions (WebMCP)";
  const pass = check("webmcp", "act", label, "pass", "The page registers WebMCP tools, so agents can call your actions directly.");
  if (root.querySelectorAll("script:not([src])").some((s) => usesWebMcp(s.textContent))) return pass;

  // the page's own scripts (same site). App/page/layout bundles first — tool
  // registration lives there — then the rest, skipping framework runtime.
  const site = pageUrl.hostname.split(".").slice(-2).join(".");
  const appFirst = (u: URL) => (/(app|layout|page|main|index|webmcp|agent)/i.test(u.pathname) ? 0 : 1);
  const srcs = root
    .querySelectorAll("script[src]")
    .map((s) => {
      try {
        return new URL(s.getAttribute("src")!, pageUrl);
      } catch {
        return null;
      }
    })
    .filter((u): u is URL => !!u && u.hostname.endsWith(site) && !/(polyfill|webpack|framework|runtime)/i.test(u.pathname))
    .sort((a, b) => appFirst(a) - appFirst(b))
    .slice(0, 16);
  const bodies = await Promise.all(srcs.map((u) => tryFetch(u, { timeoutMs: 5000, maxBytes: 900_000 })));
  if (bodies.some((b) => b && b.status < 400 && usesWebMcp(b.body))) return pass;

  return check(
    "webmcp",
    "act",
    label,
    "fail",
    "No WebMCP tools on this page. Agents have to click through it like a person and often get stuck.",
    "Publish your key actions (search, book, buy, sign up) as WebMCP tools. Agent Nick writes them into your code and opens a pull request.",
  );
}

/* --------------------------------- extras --------------------------------- */

function checkLlmsTxt(res: FetchResult | null): Draft {
  const label = "llms.txt guide for AI";
  const ok =
    res && res.status === 200 && !/text\/html/i.test(String(res.headers["content-type"] ?? "")) && !/^\s*</.test(res.body) && res.body.trim().length > 20;
  if (ok) return check("llms-txt", "find", label, "pass", "llms.txt gives AI a short guide to the site.");
  return check(
    "llms-txt",
    "find",
    label,
    "fail",
    "No llms.txt at the root of the site.",
    "Add /llms.txt: a short Markdown summary of who you are and links to your key pages. It's a proposed standard that some AI tools already read.",
  );
}

async function checkSitemap(origin: URL, sitemaps: string[]): Promise<Draft> {
  const label = "Sitemap lists your pages";
  const candidates = [...sitemaps.slice(0, 1), new URL("/sitemap.xml", origin).toString()];
  for (const c of candidates) {
    let u: URL;
    try {
      u = new URL(c);
    } catch {
      continue;
    }
    const res = await tryFetch(u, { timeoutMs: 5000, maxBytes: 200_000 });
    if (res && res.status === 200 && /<(urlset|sitemapindex)/i.test(res.body)) {
      return check("sitemap", "find", label, "pass", `Found ${u.pathname}.`);
    }
  }
  return check(
    "sitemap",
    "find",
    label,
    "fail",
    "No sitemap at /sitemap.xml or in robots.txt.",
    "Publish a sitemap.xml and point to it from robots.txt so agents can find every page, not just the ones linked from the home page.",
  );
}

/* ---------------------------------- scan ---------------------------------- */

export async function scanSite(target: URL): Promise<ScanReport> {
  const page = await safeFetch(target, { timeoutMs: 9000, maxBytes: 2_000_000 });
  const ctype = String(page.headers["content-type"] ?? "");
  if (page.status === 404 || page.status >= 500 && page.status !== 503) {
    throw new ScanFetchError(`The site answered with an error (HTTP ${page.status}).`, "unreachable");
  }
  if (page.status < 400 && ctype && !/html|xml/i.test(ctype)) {
    throw new ScanFetchError("That address didn't return a web page.", "unreachable");
  }

  const finalUrl = new URL(page.url);
  const origin = new URL(finalUrl.origin);
  const root = parse(page.body, { comment: false });

  const [robots, llms] = await Promise.all([
    tryFetch(new URL("/robots.txt", origin), { timeoutMs: 5000, maxBytes: 300_000 }),
    tryFetch(new URL("/llms.txt", origin), { timeoutMs: 5000, maxBytes: 200_000 }),
  ]);
  const crawlers = checkCrawlers(robots);
  const wall = checkBotWall(page, page.body);

  let drafts: Draft[];
  if (wall.blocked) {
    const behindWall = (id: string, category: CategoryId, label: string) =>
      check(id, category, label, "fail", "Agents can't see this: the page is behind a bot check.", "Fix the bot check first, then scan again.");
    drafts = [
      crawlers.draft,
      await checkSitemap(origin, crawlers.sitemaps),
      checkLlmsTxt(llms),
      behindWall("meta", "find", "Title and description are set"),
      behindWall("content", "read", "Content is there without JavaScript"),
      behindWall("structured-data", "read", "Structured data describes the business"),
      behindWall("structure", "read", "Page structure is clear"),
      behindWall("names", "read", "Links and buttons say what they do"),
      behindWall("img-alt", "read", "Images have descriptions"),
      behindWall("webmcp", "act", "Agents can call your actions (WebMCP)"),
      behindWall("forms", "act", "Form fields are labelled"),
      wall.draft,
    ];
  } else {
    const [sitemap, webmcp] = await Promise.all([checkSitemap(origin, crawlers.sitemaps), checkWebMcp(root, finalUrl)]);
    drafts = [
      crawlers.draft,
      sitemap,
      checkLlmsTxt(llms),
      checkMeta(root),
      checkContent(root),
      checkStructuredData(root),
      checkStructure(root),
      checkNames(root),
      checkImages(root),
      webmcp,
      checkForms(root),
      wall.draft,
    ];
  }

  const checks: ScanCheck[] = drafts.map((d) => {
    const max = WEIGHTS[d.id];
    const points = d.status === "pass" ? max : d.status === "warn" ? Math.round(max / 2) : 0;
    return { ...d, max, points: d.status === "skip" ? 0 : points };
  });
  const counted = checks.filter((c) => c.status !== "skip");
  const total = counted.reduce((s, c) => s + c.max, 0);
  const earned = counted.reduce((s, c) => s + c.points, 0);

  const categories = (Object.keys(CATEGORY_META) as CategoryId[]).map((id) => {
    const inCat = counted.filter((c) => c.category === id);
    const max = inCat.reduce((s, c) => s + c.max, 0);
    const got = inCat.reduce((s, c) => s + c.points, 0);
    return { id, ...CATEGORY_META[id], score: max ? Math.round((got / max) * 100) : 100, max: 100 };
  });

  return {
    url: target.toString(),
    finalUrl: finalUrl.toString(),
    host: finalUrl.hostname.replace(/^www\./, ""),
    scannedAt: new Date().toISOString(),
    score: total ? Math.round((earned / total) * 100) : 0,
    categories,
    checks,
    stats: { forms: wall.blocked ? 0 : root.querySelectorAll("form").length },
  };
}
