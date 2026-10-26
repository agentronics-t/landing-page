# Agentronics — Landing Site

agentronics.dev: "Can AI agents buy from you?" The home page with the free Agent Readiness
Score, plus pricing, booking and the developer/SDK overview. The docs are a separate app served
under `/docs` (see `next.config.mjs`).

## The home page is a static page

`/` is the cofounder's redesign served as-is, for pixel parity: `public/home.html` with
`public/home-assets/` (`styles.css`, `app.js`, `favicon.svg`). A `beforeFiles` rewrite in
`next.config.mjs` serves it, or `public/index.md` when a request sends `Accept: text/markdown`.
Edit the home page there, not in React. Changes made to the redesign files, on purpose:

- asset paths are root-relative (`/home-assets/…`, `/llms.txt`, …);
- the logo is the brand master (red A on a lime square), not the redesign's placeholder mark;
- an inline snippet forwards `app.js`'s `agentronics:track` events to Vercel Web Analytics,
  and there's an `og:image`;
- two claims the code doesn't back yet: "Context transfer between agents (coming soon)", and
  the proof says "The scan found 3 gaps" (Agent Nic wasn't run on our own site).

The home page links to `/signup?plan=…`, `/login` and `/demo`: the first two redirect to the
console's sign-up and sign-in at app.agentronics.dev, the last to `/book`. `/scan?url=x` redirects to `/?url=x`, which runs the scan.

## Design system

`public/home-assets/styles.css` is the design system for every page: `app/layout.tsx` imports it
after Tailwind, and the React pages use its classes (`.nav`, `.section`, `.dark`, `.btn--go`,
`.plan`, `.compare`, `.final`, `.footer`, …). `components/layout/SiteEffects.tsx` is the generic
part of `app.js` (nav state, reveal-on-scroll, highlighter, count-up). `app/globals.css` only adds
what the React pages need on top.

- **Ink `#0B0B0C`** and **white**.
- **Lime `#D4FF3A`**: go, ready, allow, every primary action (with ink text).
- **Amber `#FFB224`**: partly ready, ask first. **Red `#FF4D1F`**: not ready, deny, loss.
- **Fonts**: Funnel Display (headlines), Funnel Sans (text), Martian Mono (labels, code).
- **Logo**: `components/ui/Logo.tsx` (`MARK_PATH`), `public/brand/`, `public/home-assets/favicon.svg`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

The site needs no keys. Log in and Sign up (`/login`, `/signup`, `/sign-in`, `/sign-up`) redirect
to the console's own pages at app.agentronics.dev; `/demo` goes to the Calendly booking page.

To scan your local copy (private addresses are blocked by default), run with
`SCAN_ALLOW_PRIVATE=1` and click "Scan this site yourself". It should score 100/100. Never set it
in production.

## The scanner

`GET /api/scan?url=example.com` (or `POST { url }`) → the Agent Readiness Score as JSON:
12 pass/fail checks worth Find 5 each (20), Read 10 each (40) and Act 10 each (40); the score is the
sum of passed checks out of 100, and each group also reports its own percentage. Bands 0–40 / 41–70 / 71–100. Contract and checks: `public/openapi.json`, `lib/agentscan/scanner.js`
(the redesign's scanner, unchanged except for its fetch).

- `lib/agentscan/pinned-fetch.ts` is the only way it touches the network: http/https on ports
  80/443, every redirect hop checked, and DNS re-checked at connect time against private and
  reserved ranges, so a rebinding answer can't get through. Size and time caps.
- Per-IP rate limit (12/min) in memory per instance; a 28 s overall timeout.
- The site's WebMCP tool `check_agent_readiness` calls the same endpoint.

## Structure

```
public/home.html, home-assets/   the home page (static) and the design system
public/llms.txt, index.md, robots.txt, openapi.json, .well-known/api-catalog   what agents read
app/                 /pricing /book /developers, api/scan, sitemap, OG image
components/layout    Navbar, Footer, SiteEffects (the home page's, for the React pages)
components/site      ScanForm, Plans, FinalCta
components/webmcp    registers the site's WebMCP tools (document.modelContext)
lib/catalog.ts       plans, feature matrix, docs links — mirrors the console's enforced limits
lib/agentscan/       the scanner
```
