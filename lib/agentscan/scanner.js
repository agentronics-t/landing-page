// Agent Readiness scanner: 12 checks in three groups (Find, Read, Act).
// Reads public pages only. No dependencies; runs on Node 18+ (global fetch).
// Weights confirmed by the founders 2026-10-25: Find 5 each (20), Read 10 each (40), Act 10 each (40).
// The score is the sum of passed weights, out of 100.
// Copied from the redesign's api/_scanner.js; the only change is pinnedFetch in safeFetch.

import { lookup } from 'node:dns/promises';
import net from 'node:net';
import { pinnedFetch } from './pinned-fetch';

const AGENT_UA = 'Mozilla/5.0 (compatible; AgentronicsBot/1.0; AI agent readiness scan; +https://www.agentronics.dev)';
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const MAX_BYTES = 2_500_000;
const REQ_TIMEOUT = 9000;

const AI_AGENTS = [
  'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-user', 'claude-searchbot', 'anthropic-ai',
  'perplexitybot', 'perplexity-user', 'google-extended', 'applebot-extended', 'ccbot', 'bytespider',
  'meta-externalagent', 'amazonbot', 'cohere-ai', 'duckassistbot', 'mistralai-user', 'gemini',
];
// Agents that act or search for a person (blocking all of these = agents can't use you).
const USER_AGENTS = ['chatgpt-user', 'claude-user', 'perplexity-user', 'oai-searchbot', 'perplexitybot', 'claude-searchbot'];

export const GROUPS = {
  find: { label: 'Find', question: 'Can AI agents find your site and know what it offers?' },
  read: { label: 'Read', question: 'Can agents understand your content: prices, products, details?' },
  act: { label: 'Act', question: 'Can agents complete tasks like booking, buying or signing up?' },
};

export const CHECKS = [
  { id: 'reachable', group: 'find', weight: 5, title: 'Agents can reach your site' },
  { id: 'robots', group: 'find', weight: 5, title: 'AI rules in robots.txt' },
  { id: 'sitemap', group: 'find', weight: 5, title: 'Sitemap' },
  { id: 'llms', group: 'find', weight: 5, title: 'llms.txt guide for AI tools' },
  { id: 'ssr', group: 'read', weight: 10, title: 'Content readable without JavaScript' },
  { id: 'schema', group: 'read', weight: 10, title: 'Structured data (schema.org)' },
  { id: 'meta', group: 'read', weight: 10, title: 'Clear title, description and headings' },
  { id: 'markdown', group: 'read', weight: 10, title: 'Markdown version for agents' },
  { id: 'buttons', group: 'act', weight: 10, title: 'Buttons and links have labels' },
  { id: 'forms', group: 'act', weight: 10, title: 'Form fields have labels' },
  { id: 'paths', group: 'act', weight: 10, title: 'Key actions are real links' },
  { id: 'actions', group: 'act', weight: 10, title: 'Agent actions declared (WebMCP / API)' },
];

export const BANDS = [
  { key: 'not', min: 0, max: 40, label: 'Not ready', message: 'Most AI agents can’t use your site yet. They skip you and pick a competitor.' },
  { key: 'partly', min: 41, max: 70, label: 'Partly ready', message: 'Agents find you, then get stuck on prices, forms or buttons.' },
  { key: 'ready', min: 71, max: 100, label: 'Agent-ready', message: 'Agents can read your site and finish tasks. Keep it that way as your site changes.' },
];

export const bandFor = (score) => BANDS.find((b) => score >= b.min && score <= b.max) || BANDS[0];

export class ScanError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

/* ---------- URL + network safety ---------- */

export function normalizeUrl(input) {
  let raw = String(input || '').trim();
  if (!raw || raw.length > 2048) throw new ScanError('Enter a website like yourcompany.com');
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw.replace(/^\/+/, '');
  let u;
  try { u = new URL(raw); } catch { throw new ScanError('Enter a website like yourcompany.com'); }
  if (!['http:', 'https:'].includes(u.protocol)) throw new ScanError('Only http and https addresses can be scanned.');
  if (u.username || u.password) throw new ScanError('Remove the login details from the address.');
  if (!u.hostname.includes('.') && !net.isIP(u.hostname)) throw new ScanError('Enter a website like yourcompany.com');
  u.hash = '';
  return u;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19));
  }
  const v = ip.toLowerCase();
  if (v === '::' || v === '::1') return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIp(mapped[1]);
  return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(v) || v.startsWith('64:ff9b:');
}

const allowPrivate = () => process.env.SCAN_ALLOW_PRIVATE === '1';

async function assertPublic(url, dnsCache) {
  if (allowPrivate()) return;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (url.port && !['80', '443'].includes(url.port)) throw new ScanError('Only standard web ports (80/443) can be scanned.');
  if (/(^|\.)(localhost|local|internal|lan|home|corp)$/i.test(host)) throw new ScanError('Private addresses can’t be scanned.');
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new ScanError('Private addresses can’t be scanned.');
    return;
  }
  if (!dnsCache.has(host)) {
    dnsCache.set(host, lookup(host, { all: true, verbatim: true }).catch(() => []));
  }
  const addrs = await dnsCache.get(host);
  if (!addrs.length) throw new ScanError(`We couldn’t find ${host}. Check the address and try again.`, 422);
  if (addrs.some((a) => isPrivateIp(a.address))) throw new ScanError('Private addresses can’t be scanned.');
}

async function readCapped(res) {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    chunks.push(value);
    if (size >= MAX_BYTES) { reader.cancel().catch(() => {}); break; }
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(Buffer.concat(chunks));
}

// fetch with manual redirects so every hop is checked against private ranges
async function safeFetch(input, { headers = {}, dnsCache, method = 'GET' } = {}) {
  let url = input instanceof URL ? input : new URL(input);
  const started = Date.now();
  for (let hop = 0; hop < 6; hop++) {
    if (!['http:', 'https:'].includes(url.protocol)) throw new ScanError('Redirected to an unsupported address.');
    await assertPublic(url, dnsCache);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQ_TIMEOUT);
    let res;
    try {
      // pinnedFetch re-checks DNS when it connects, so a rebinding answer can't slip past assertPublic
      res = await pinnedFetch(url, {
        method, redirect: 'manual', signal: ctrl.signal,
        headers: { 'user-agent': AGENT_UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8', ...headers },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        res.body?.cancel().catch(() => {});
        url = new URL(res.headers.get('location'), url);
        continue;
      }
      const text = method === 'HEAD' ? '' : await readCapped(res);
      return { url: url.href, status: res.status, headers: res.headers, text, ms: Date.now() - started };
    } finally {
      clearTimeout(timer);
    }
  }
  throw new ScanError('Too many redirects.', 422);
}

const tryFetch = (url, opts) => safeFetch(url, opts).catch((err) => ({ url: String(url), status: 0, headers: new Headers(), text: '', error: err }));

/* ---------- HTML helpers (regex-level, good enough for a public-page scan) ---------- */

const decode = (s) => s
  .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

const stripTags = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function attr(attrs, name) {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? '').trim() : null;
}

function visibleText(html) {
  const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, html])[1];
  return stripTags(body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template|svg|iframe)\b[\s\S]*?<\/\1>/gi, ' '));
}

function hasAccessibleName(attrs, inner) {
  if (attr(attrs, 'aria-label') || attr(attrs, 'aria-labelledby') || attr(attrs, 'title')) return true;
  if (stripTags(inner.replace(/<(svg|style|script)\b[\s\S]*?<\/\1>/gi, ' ')).length > 0) return true;
  const img = inner.match(/<img\b[^>]*>/gi) || [];
  if (img.some((tag) => (attr(tag, 'alt') || '').length > 0)) return true;
  if (/<svg\b[^>]*aria-label\s*=\s*["'][^"']+/i.test(inner) || /<title>[^<]+<\/title>/i.test(inner)) return true;
  return false;
}

const looksLikeHtml = (text) => /^\s*(<!doctype html|<html|<head|<body)/i.test(text) || /<html[\s>]/i.test(text.slice(0, 2000));
const isChallenge = (r) => [401, 403, 429, 503].includes(r.status) ||
  /cf-chl|challenge-platform|just a moment\.\.\.|attention required|captcha|px-captcha|datadome|access denied/i.test(r.text.slice(0, 20000));

/* ---------- robots.txt ---------- */

function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'user-agent') {
      if (!lastWasAgent || !current) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (current && (key === 'allow' || key === 'disallow')) current.rules.push({ type: key, path: value });
    }
  }
  return groups;
}

function blocksRoot(groups, agent) {
  const exact = groups.filter((g) => g.agents.some((a) => a !== '*' && agent.includes(a)));
  const applicable = exact.length ? exact : groups.filter((g) => g.agents.includes('*'));
  const rules = applicable.flatMap((g) => g.rules);
  const disallowAll = rules.some((r) => r.type === 'disallow' && r.path === '/');
  const allowRoot = rules.some((r) => r.type === 'allow' && (r.path === '/' || r.path === '/$'));
  return disallowAll && !allowRoot;
}

/* ---------- the scan ---------- */

export async function scan(input) {
  const started = Date.now();
  const target = normalizeUrl(input);
  const dnsCache = new Map();

  // 1. Homepage as an AI agent, plus robots.txt (in parallel)
  const origin0 = target.origin;
  const [homeAgent, robots0] = await Promise.all([
    safeFetch(target, { dnsCache }).catch((err) => {
      if (err instanceof ScanError) throw err;
      throw new ScanError(`We couldn’t reach ${target.hostname}. Check the address and try again.`, 422);
    }),
    tryFetch(new URL('/robots.txt', origin0), { dnsCache, headers: { accept: 'text/plain,*/*' } }),
  ]);

  const agentBlocked = isChallenge(homeAgent) || homeAgent.status >= 400 || homeAgent.status === 0;
  let home = homeAgent;
  if (agentBlocked) {
    const asBrowser = await tryFetch(target, { dnsCache, headers: { 'user-agent': BROWSER_UA } });
    if (asBrowser.status >= 200 && asBrowser.status < 400 && !isChallenge(asBrowser)) home = asBrowser;
  }

  const finalUrl = new URL(home.url);
  const origin = finalUrl.origin;
  const robots = origin === origin0 ? robots0 : await tryFetch(new URL('/robots.txt', origin), { dnsCache, headers: { accept: 'text/plain,*/*' } });
  const robotsOk = robots.status === 200 && !looksLikeHtml(robots.text) && robots.text.length < 500_000;
  const robotsText = robotsOk ? robots.text : '';

  const sitemapUrls = [...robotsText.matchAll(/^\s*sitemap\s*:\s*(\S+)/gim)].map((m) => m[1]);
  let sitemapTarget;
  try { sitemapTarget = new URL(sitemapUrls[0] || '/sitemap.xml', origin); } catch { sitemapTarget = new URL('/sitemap.xml', origin); }

  // 2. Discovery files + content negotiation (in parallel)
  const [sitemap, llms, markdown, apiCatalog] = await Promise.all([
    tryFetch(sitemapTarget, { dnsCache, headers: { accept: 'application/xml,text/xml,*/*' } }),
    tryFetch(new URL('/llms.txt', origin), { dnsCache, headers: { accept: 'text/plain,text/markdown,*/*' } }),
    tryFetch(finalUrl, { dnsCache, headers: { accept: 'text/markdown, text/plain;q=0.5' } }),
    tryFetch(new URL('/.well-known/api-catalog', origin), { dnsCache, headers: { accept: 'application/linkset+json,application/json' } }),
  ]);

  const html = home.text || '';
  const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i) || [, html.slice(0, 40000)])[1];
  const text = visibleText(html);
  const words = text ? text.split(' ').filter((w) => /[a-z0-9]/i.test(w)).length : 0;
  const results = {};

  // FIND ---------------------------------------------------------------
  results.reachable = agentBlocked
    ? { pass: false, detail: `Your site answered AI agents with ${homeAgent.status ? `status ${homeAgent.status}` : 'no response'}${isChallenge(homeAgent) ? ' and a bot challenge' : ''}.`, fix: 'Let verified AI agents through your firewall or bot protection so they get the same page people do.' }
    : { pass: true, detail: `Answered an AI agent in ${(homeAgent.ms / 1000).toFixed(1)}s.` };

  if (!robotsOk) {
    results.robots = { pass: false, detail: 'No robots.txt found, so agents have to guess your rules.', fix: 'Add a robots.txt that names AI agents and states your AI usage preferences (Content-Signal).' };
  } else {
    const groups = parseRobots(robotsText);
    const namesAi = groups.some((g) => g.agents.some((a) => AI_AGENTS.some((ai) => a.includes(ai))));
    const signals = /^\s*content-signal\s*:/im.test(robotsText);
    const allBlocked = USER_AGENTS.every((a) => blocksRoot(groups, a));
    if (allBlocked) results.robots = { pass: false, detail: 'robots.txt blocks the agents that browse for people.', fix: 'Allow user-facing AI agents (like ChatGPT-User or Claude-User) to read your public pages.' };
    else if (!namesAi && !signals && groups.some((g) => g.agents.includes('*'))) {
      // `User-agent: *` covers AI agents too: they're let in, just not named.
      results.robots = { pass: false, partial: true, detail: 'robots.txt lets every bot in (User-agent: *), AI agents included, but doesn’t name them or say how your content may be used. Add AI agent rules and a Content-Signal line to make that explicit.' };
    }
    else if (!namesAi && !signals) {
      // `User-agent: *` covers AI agents too: they may read the site, but the file doesn't say how AI may use it.
      results.robots = groups.some((g) => g.agents.includes('*'))
        ? { pass: false, partial: true, detail: 'robots.txt lets every crawler in, AI agents included, but doesn’t say how AI may use your content.', fix: 'Add a Content-Signal line (e.g. “Content-Signal: search=yes, ai-input=yes”) and, if you like, rules for AI agents by name.' }
        : { pass: false, detail: 'robots.txt is written for search engines only. It says nothing to AI agents.', fix: 'Add AI agent rules and a Content-Signal line to robots.txt.' };
    }
    else results.robots = { pass: true, detail: signals ? 'robots.txt declares AI usage preferences.' : 'robots.txt has rules for AI agents.' };
  }

  const sitemapOk = sitemap.status === 200 && (/<(urlset|sitemapindex)[\s>]/i.test(sitemap.text) || /\.gz$/i.test(sitemap.url));
  results.sitemap = sitemapOk
    ? { pass: true, detail: 'Sitemap found.' }
    : { pass: false, detail: 'No sitemap found, so agents can’t see all your pages.', fix: 'Publish /sitemap.xml and list it in robots.txt.' };

  const llmsOk = llms.status === 200 && !looksLikeHtml(llms.text) && llms.text.trim().length > 20;
  results.llms = llmsOk
    ? { pass: true, detail: 'llms.txt found.' }
    : { pass: false, detail: 'No llms.txt, so AI tools get no guide to your site.', fix: 'Add /llms.txt: a short Markdown guide to what you offer and your key pages.' };

  // READ ---------------------------------------------------------------
  const shellHint = /<div[^>]+id=["'](root|app|__next|__nuxt)["'][^>]*>\s*<\/div>/i.test(html);
  results.ssr = words >= 120
    ? { pass: true, detail: `${words.toLocaleString('en-US')} words readable straight from the HTML.` }
    : { pass: false, detail: words < 25 || shellHint ? 'Your page is nearly empty without JavaScript. Prices and details may look blank to agents.' : `Only ${words} words without JavaScript. Most agents see a thin page.`, fix: 'Render key content (prices, products, plans) on the server so it’s in the HTML.' };

  const ldBlocks = [...html.matchAll(/<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const types = new Set();
  for (const [, json] of ldBlocks) {
    try {
      const walk = (n) => {
        if (!n || typeof n !== 'object') return;
        if (Array.isArray(n)) return n.forEach(walk);
        const t = n['@type'];
        (Array.isArray(t) ? t : t ? [t] : []).forEach((x) => types.add(String(x)));
        Object.values(n).forEach((v) => typeof v === 'object' && walk(v));
      };
      walk(JSON.parse(json.trim()));
    } catch { /* invalid block */ }
  }
  const microdata = /itemtype\s*=\s*["']https?:\/\/schema\.org\//i.test(html);
  results.schema = types.size || microdata
    ? { pass: true, detail: types.size ? `Found ${[...types].slice(0, 4).join(', ')}.` : 'schema.org microdata found.' }
    : { pass: false, detail: 'No structured data. Agents can’t reliably tell your products, prices or company apart.', fix: 'Add schema.org JSON-LD (Organization, Product/Offer, FAQPage).' };

  const title = stripTags((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]);
  const description = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => tag)
    .filter((tag) => /name\s*=\s*["']description["']/i.test(tag)).map((tag) => attr(tag, 'content') || '')[0] || '';
  const h1 = /<h1[\s>]/i.test(html);
  const missing = [!title && 'title', description.length < 30 && 'meta description', !h1 && 'main heading (h1)'].filter(Boolean);
  results.meta = missing.length === 0
    ? { pass: true, detail: 'Title, description and main heading are in place.' }
    : { pass: false, detail: `Missing: ${missing.join(', ')}.`, fix: 'Give every page a clear title, a meta description and one h1.' };

  const mdNegotiated = markdown.status === 200 && /markdown/i.test(markdown.headers.get('content-type') || '') && !looksLikeHtml(markdown.text);
  const mdLinked = /<link\b[^>]*type\s*=\s*["']text\/markdown["'][^>]*>/i.test(head);
  results.markdown = mdNegotiated || mdLinked
    ? { pass: true, detail: mdNegotiated ? 'Serves Markdown when an agent asks for it.' : 'Links to a Markdown version of this page.' }
    : { pass: false, detail: 'Agents only get heavy HTML. No clean Markdown version.', fix: 'Return Markdown when a request sends Accept: text/markdown.' };

  // ACT ----------------------------------------------------------------
  const clickables = [];
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) clickables.push({ attrs: m[1], inner: m[2] });
  for (const m of html.matchAll(/<a\b([^>]*\bhref\s*=[^>]*)>([\s\S]*?)<\/a>/gi)) clickables.push({ attrs: m[1], inner: m[2] });
  for (const m of html.matchAll(/<input\b([^>]*)>/gi)) {
    const type = (attr(m[1], 'type') || '').toLowerCase();
    if (['submit', 'button', 'image', 'reset'].includes(type)) {
      clickables.push({ attrs: m[1], inner: attr(m[1], 'value') || attr(m[1], 'alt') || '' });
    }
  }
  const visibleClickables = clickables.filter((c) => !/aria-hidden\s*=\s*["']true["']/i.test(c.attrs) && !/\shidden(\s|=|$)/i.test(c.attrs));
  const unlabeled = visibleClickables.filter((c) => !hasAccessibleName(c.attrs, c.inner));
  const btnCount = visibleClickables.length;
  if (btnCount === 0) {
    results.buttons = words < 25
      ? { pass: false, detail: 'No buttons or links in the HTML. They only appear with JavaScript.', fix: 'Render buttons and links on the server, each with a clear label.' }
      : { pass: true, detail: 'No unlabeled buttons found.' };
  } else {
    const ok = unlabeled.length === 0 || (unlabeled.length <= 2 && unlabeled.length / btnCount < 0.05);
    results.buttons = ok
      ? { pass: true, detail: `${btnCount - unlabeled.length} of ${btnCount} buttons and links are labeled.` }
      : { pass: false, detail: `${unlabeled.length} of ${btnCount} buttons and links have no label (icons only). Agents can’t tell what they do.`, fix: 'Add visible text or an aria-label to every icon-only button and link.' };
  }

  const labelFor = new Set([...html.matchAll(/<label\b[^>]*\bfor\s*=\s*["']?([^"'\s>]+)/gi)].map((m) => m[1]));
  const wrapped = [...html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => m[1]).join(' ');
  const fields = [];
  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const type = (attr(m[2], 'type') || 'text').toLowerCase();
    if (m[1].toLowerCase() === 'input' && ['hidden', 'submit', 'button', 'image', 'reset'].includes(type)) continue;
    if (/aria-hidden\s*=\s*["']true["']/i.test(m[2]) || /tabindex\s*=\s*["']-1["']/i.test(m[2])) continue;
    fields.push(m[0]);
  }
  const unlabeledFields = fields.filter((tag) => {
    const a = tag.replace(/^<\w+/, '');
    const id = attr(a, 'id');
    return !(attr(a, 'aria-label') || attr(a, 'aria-labelledby') || attr(a, 'title') || (id && labelFor.has(id)) || wrapped.includes(tag));
  });
  results.forms = fields.length === 0
    ? { pass: true, detail: 'No form fields on this page.' }
    : unlabeledFields.length === 0
      ? { pass: true, detail: `All ${fields.length} form fields are labeled.` }
      : { pass: false, detail: `${unlabeledFields.length} of ${fields.length} form fields have no label. Agents can’t fill them in reliably.`, fix: 'Connect a <label> (or aria-label) to every field. Placeholders aren’t labels.' };

  const actionWords = /\b(pricing|prices?|plans?|sign ?up|get started|start|try|trial|book|demo|contact|buy|shop|cart|checkout|order|subscribe|register|join|reserve|schedule|quote|log ?in)\b/i;
  const keyPaths = clickables.filter((c) => /href\s*=\s*["']?(?!#|javascript:)[^"'\s>]+/i.test(c.attrs) && actionWords.test(stripTags(c.inner) + ' ' + (attr(c.attrs, 'aria-label') || '')));
  // A page with nothing to fill in or press (a plain content page) doesn't need
  // key-action links or agent actions: those checks count half (amber), not zero.
  const nothingToDo = fields.length === 0 && !/<button\b/i.test(html) && !/<input\b[^>]*type\s*=\s*["']?(submit|button)/i.test(html);
  results.paths = keyPaths.length > 0
    ? { pass: true, detail: `${keyPaths.length} key actions (pricing, signup, contact…) are real links.` }
    : nothingToDo
      ? { pass: false, partial: true, detail: 'No pricing, signup or contact links, and nothing to sign up for on this page. Fine for a content page.' }
      : { pass: false, detail: 'No clear links to pricing, signup or contact in the HTML.', fix: 'Make key actions real <a href> links agents can follow.' };

  // WebMCP tools register from JavaScript, usually in a script file, so look in
  // the page's own scripts too (same origin, likeliest first). Module scripts
  // often keep the registerTool() calls in a library they import (resolved
  // through the page's import map), so follow their imports one level down.
  const declaresTools = (t) =>
    /\btoolname\s*=/i.test(t) || (/modelContext/.test(t) && /\b(registerTools?|provideContext)\b/.test(t));
  let webmcp = declaresTools(html);
  if (!webmcp) {
    const importMap = {};
    for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']importmap["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      try { Object.assign(importMap, JSON.parse(m[1]).imports ?? {}); } catch { /* not JSON */ }
    }
    const sameOrigin = (spec, base) => {
      try {
        const prefix = Object.keys(importMap).find((k) => k.endsWith('/') && spec.startsWith(k));
        const mapped = importMap[spec] ?? (prefix ? importMap[prefix] + spec.slice(prefix.length) : undefined);
        if (!mapped && !/^(\.{0,2}\/|https?:)/.test(spec)) return null; // a bare name the page doesn't map
        const u = new URL(decode(mapped ?? spec), mapped ? finalUrl : base);
        return u.origin === origin ? u : null;
      } catch { return null; }
    };
    const srcs = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map((m) => sameOrigin(m[1], finalUrl)).filter(Boolean);
    const likely = (u) => (/webmcp|mcp|agentronics|tools|layout|app|main|index|page/i.test(u.pathname) ? 0 : 1);
    const seen = new Set();
    const pick = (list, n) => [...new Map(list.map((u) => [u.href, u])).values()].filter((u) => !seen.has(u.href)).sort((a, b) => likely(a) - likely(b)).slice(0, n);
    const fetchAll = async (list) => {
      list.forEach((u) => seen.add(u.href));
      const res = await Promise.all(list.map((u) => tryFetch(u, { dnsCache, headers: { accept: '*/*' } })));
      return res.map((r, i) => ({ url: list[i], text: r.status === 200 && !looksLikeHtml(r.text) ? r.text : '' }));
    };
    const first = await fetchAll(pick(srcs, 12));
    webmcp = first.some((r) => declaresTools(r.text));
    if (!webmcp) {
      // One level of `import … from "x"` / `import("x")` from the scripts that look WebMCP-related (or all, if none do).
      const related = first.filter((r) => /modelContext|webmcp|registerTool/i.test(r.text + r.url.pathname));
      const imports = (related.length ? related : first).flatMap((r) =>
        [...r.text.matchAll(/\bimport\s*(?:[\w*{}\s,$]+from\s*)?\(?\s*["']([^"']+)["']/g)].map((m) => sameOrigin(m[1], r.url)).filter(Boolean)
      );
      const second = await fetchAll(pick(imports, 8));
      webmcp = second.some((r) => declaresTools(r.text));
    }
  }
  const catalogOk = apiCatalog.status === 200 && !looksLikeHtml(apiCatalog.text) && /linkset|service-desc|openapi/i.test(apiCatalog.text);
  const apiLinked = /<link\b[^>]*rel\s*=\s*["'][^"']*(api-catalog|service-desc)[^"']*["']/i.test(head);
  results.actions = webmcp || catalogOk || apiLinked
    ? { pass: true, detail: [webmcp && 'WebMCP tools on the page', catalogOk && 'an API catalog', apiLinked && 'a linked API description'].filter(Boolean).join(' and ').replace(/^./, (c) => c.toUpperCase()) + '.' }
    : nothingToDo
      ? { pass: false, partial: true, detail: 'No forms or buttons on this page, so there is nothing for agents to do here yet. Add tools when you add actions.' }
      : { pass: false, detail: 'Agents can read but not act. No WebMCP tools or API catalog declared.', fix: 'Declare actions like “get pricing” or “start signup” with WebMCP, or publish /.well-known/api-catalog.' };

  // Scoring ---------------------------------------------------------------
  // A check that doesn't apply to this page (partial) earns half its weight.
  const earned = (c) => (c.pass ? c.weight : c.partial ? c.weight / 2 : 0);
  // Score = points from passed checks (out of 100). Each group also reports
  // its own share as a percentage, which the report's bars and colours use.
  const checks = CHECKS.map((c) => ({ ...c, ...results[c.id] }));
  const groups = {};
  for (const key of Object.keys(GROUPS)) {
    const inGroup = checks.filter((c) => c.group === key);
    const max = inGroup.reduce((s, c) => s + c.weight, 0);
    const points = inGroup.reduce((s, c) => s + earned(c), 0);
    groups[key] = { ...GROUPS[key], points, max, score: Math.round((points / max) * 100) };
  }
  const score = Math.round(checks.reduce((s, c) => s + earned(c), 0));
  const band = bandFor(score);

  // Path to Agent-ready: biggest-gain fixes first (each adds its weight)
  const failing = checks.filter((c) => !c.pass && !c.partial).sort((a, b) => b.weight - a.weight);
  const fixes = failing.map((c) => ({ id: c.id, title: c.title, gain: c.weight }));
  let projected = score;
  let fixesToReady = 0;
  for (const c of failing) {
    if (projected >= 71) break;
    projected += c.weight;
    fixesToReady++;
  }

  return {
    url: target.href,
    finalUrl: home.url,
    host: finalUrl.hostname,
    scannedAt: new Date().toISOString(),
    durationMs: Date.now() - started,
    score,
    band: { key: band.key, label: band.label, message: band.message },
    groups,
    passed: checks.filter((c) => c.pass).length,
    total: checks.length,
    path: { fixesToReady: score >= 71 ? 0 : fixesToReady, projectedScore: Math.min(100, score >= 71 ? score : projected), fixes },
    checks,
  };
}
