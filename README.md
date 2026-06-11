# Agentronics — Landing Site

Marketing site for Agentronics: developer-facing AI-agent infrastructure (WebMCP protocol + SDK +
governance dashboard). Built to the Agentronics design system.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS v3** — driven entirely by the design tokens in `app/globals.css`
- **Framer Motion** — scroll reveals, count-ups, the scroll-condensing nav, typing demos
- **Three.js + GSAP ScrollTrigger** — the particle-morph section (`DataToInsights`), lazy-loaded
- **Google Fonts** via `next/font/google` — DM Sans (sans) + JetBrains Mono (mono)
- **Clerk** (`@clerk/nextjs`) — auth, currently **stubbed** (see below)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

The site **boots without any real keys** — auth, forms, and booking are interactive prototypes
backed by local state. Copy `.env.local.example` → `.env.local` when you have real values.

## Deploy (Vercel)

Next.js is zero-config on Vercel. Push the repo, import the project, and set framework = Next.js
(see `vercel.json`). Add real env vars (Clerk keys, `DATABASE_URL`, API base) in the Vercel dashboard.

```bash
npm run build      # production build
```

## Status — what's wired vs. stubbed

| Area | Now | Later phase |
|---|---|---|
| All marketing UI (Home/SDK + Intelligence + pages) | ✅ Built | — |
| Auth buttons (`Login`, `Sign up`) | "Launching soon" popup → Book a demo | Real Clerk sign-in/up + `ClerkProvider` |
| Book a demo | ✅ Real Calendly inline widget | — |
| Pricing | Layout complete, **prices are `TODO` placeholders** | Confirm real numbers + feature lists |

### Enabling Clerk later

1. Put real keys in `.env.local` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
2. `app/layout.tsx` auto-mounts `<ClerkProvider>` once a valid publishable key is present.
3. Add `middleware.ts` with `clerkMiddleware()` from `@clerk/nextjs/server` to protect routes.
4. Swap the stubbed nav buttons for `<SignInButton>` / `<UserButton>`.

## Structure

```
app/            routes (Home/SDK + /intelligence /docs /book /pricing) + globals.css
components/ui   design-system primitives (Button, Card, CodeBlock, …)
components/layout  Navbar, Footer, Section, Eyebrow
components/sections  one folder per home section
lib/            motion variants, count-up hook, shared token constants
public/         logo + globe.mp4
```
