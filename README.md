# Agentronics — Landing Site

agentronics.dev: "Make your website ready for AI agents." Home page, the free agent-readiness
check (`/scan`), pricing, booking, and the developer/SDK overview. The docs are a separate app
served under `/docs` (see `next.config.mjs`).

## Design — "Circuit Copper"

Tokens live in `app/globals.css`; Tailwind maps them in `tailwind.config.ts`.

- **Copper `#E8763A`** — clickable actions (with PCB Black text) and circuit traces. Nothing else.
- **Verdigris `#2BB39A`** (on dark) / **Deep Verdigris `#12715F`** (on light) — done / ready / good.
- **PCB Black `#0D1A16`** and **Bone `#F5F1E8`** — sections alternate between them. A dark band gets
  the `.tone-dark` class, which remaps every role token (`text-content`, `bg-surface`, …).
- **Fonts** — Space Grotesk (headings), Inter (body), JetBrains Mono (code), via `next/font/google`.
- **Logo** — `components/ui/Logo.tsx` (`MARK_PATH`), `public/brand/`, `app/icon.svg`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

The site boots without keys. Clerk mounts only when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set;
`/sign-in` and `/sign-up` currently redirect to `/book` (console not public yet).

## The free check (`/scan`)

`POST /api/scan { url }` → a `ScanReport` (`lib/scan/types.ts`). It fetches the page without
JavaScript, plus robots.txt, llms.txt, the sitemap and the page's own scripts, and scores 12 checks
across Find / Read / Act (`lib/scan/checks.ts`).

- `lib/scan/fetch.ts` is the only way it touches the network: http/https on ports 80/443, DNS checked
  at connect time against private and reserved ranges (every redirect hop too), 5 redirects, size and
  time caps.
- Per-IP rate limit (6/min, 30/h) and a 10-minute per-URL cache, both in memory per instance.
- The site's own WebMCP tool `check_agent_readiness` calls the same endpoint.

## Structure

```
app/                 routes: / /scan /pricing /book /developers, api/scan, robots, sitemap, OG image
components/home      one file per home section, in the design guide's order
components/scan      ScanForm, ScanReport, ScoreDial
components/pricing   PlanCards, ComparisonTable (data from lib/catalog)
components/brand     circuit traces
components/webmcp    registers the site's WebMCP tools (document.modelContext)
lib/catalog.ts       plans, feature matrix, docs links — mirrors the console's enforced limits
lib/scan/            the scanner
public/llms.txt      the site's own AI guide
```
