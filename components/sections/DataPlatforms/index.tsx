"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, inViewOnce } from "@/lib/motion";
import { AgentAnalytics } from "./AgentAnalytics";

interface Platform {
  name: string;
  slug: string;
  logo: React.ReactNode;
}

/** Official brand logo from /public/integrations (sourced from the UI kit). */
function LogoImg({ src, alt }: { src: string; alt: string }) {
  return (
    <Image src={src} alt={alt} width={28} height={28} className="h-7 w-7 rounded-md object-cover" />
  );
}

function CloudflareLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <path d="M44.6 40.8c.3-1 .2-2-.4-2.7-.5-.6-1.3-1-2.2-1l-20.2-.3c-.2 0-.3-.1-.4-.2-.1-.2 0-.3.1-.5.2-.4.5-.7.9-.7l20.5-.3c2.2-.1 4.5-1.9 5.3-4l1.1-3c.1-.2.1-.3 0-.5C47 21.4 40.7 16 33.1 16 26 16 20 20.6 17.9 27c-1.5-1.1-3.4-1.7-5.4-1.4-3.5.5-6.3 3.4-6.6 6.9-.1.9 0 1.8.2 2.7C2.6 35.4 0 38.2 0 41.6c0 .4 0 .7.1 1.1.1.3.3.5.6.5h42.7c.4 0 .8-.3.9-.7l.3-1.7z" fill="#F38020"/>
      <path d="M51.3 27.5h-.6l-.4 1.4c-.3 1-.2 2 .4 2.7.5.6 1.3 1 2.2 1l3.8.3c.2 0 .3.1.4.2.1.2 0 .3-.1.5-.2.4-.5.7-.9.7l-4 .3c-2.2.1-4.5 1.9-5.3 4l-.3.9c-.1.3.1.5.4.5h16.5c.3 0 .5-.2.6-.4.4-1.3.6-2.7.6-4.2 0-4.3-3.5-7.9-7.9-7.9h-.1c-1.7-4-5.6-6.6-10-6.6" fill="#FAAE40"/>
    </svg>
  );
}

function SnowflakeLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <g stroke="#29B5E8" strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="4" x2="16" y2="28"/>
        <line x1="5.6" y1="10" x2="26.4" y2="22"/>
        <line x1="5.6" y1="22" x2="26.4" y2="10"/>
        <line x1="16" y1="4" x2="13" y2="7"/><line x1="16" y1="4" x2="19" y2="7"/>
        <line x1="16" y1="28" x2="13" y2="25"/><line x1="16" y1="28" x2="19" y2="25"/>
        <line x1="5.6" y1="10" x2="5.6" y2="14"/><line x1="5.6" y1="10" x2="9" y2="10"/>
        <line x1="26.4" y1="22" x2="26.4" y2="18"/><line x1="26.4" y1="22" x2="23" y2="22"/>
        <line x1="5.6" y1="22" x2="5.6" y2="18"/><line x1="5.6" y1="22" x2="9" y2="22"/>
        <line x1="26.4" y1="10" x2="26.4" y2="14"/><line x1="26.4" y1="10" x2="23" y2="10"/>
      </g>
    </svg>
  );
}

const PLATFORMS: Platform[] = [
  { name: "Cloudflare", slug: "cloudflare", logo: <CloudflareLogo /> },
  { name: "Scrunch", slug: "scrunch", logo: <LogoImg src="/integrations/scrunch.png" alt="Scrunch" /> },
  { name: "PostHog", slug: "posthog", logo: <LogoImg src="/integrations/posthog.png" alt="PostHog" /> },
  { name: "Snowflake", slug: "snowflake", logo: <SnowflakeLogo /> },
  { name: "Postgres", slug: "postgres", logo: <LogoImg src="/integrations/postgres.png" alt="PostgreSQL" /> },
  { name: "BigQuery", slug: "bigquery", logo: <LogoImg src="/integrations/bigquery.png" alt="Google BigQuery" /> },
];

export function DataPlatforms() {
  return (
    <section
      id="intelligence"
      data-screen-label="data-platforms"
      className="bg-canvas px-[clamp(20px,5vw,48px)] pt-20 pb-12 md:pt-28 md:pb-16"
    >
      <div className="mx-auto max-w-content">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={inViewOnce}>
          <h2 className="text-3xl font-bold tracking-display text-content md:text-4xl">
            Seamless integration with data platforms
          </h2>
          <p className="mt-3 max-w-[620px] text-pretty text-lg text-content-secondary">
            Connect the data platforms you already run on. Agentronics streams every agent interaction
            into one governed dashboard.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[150px_1fr]">
          {/* vertical marquee rail (desktop) */}
          <PlatformRail />
          {/* agent-analytics platform (tilts flat on scroll) */}
          <AgentAnalytics />
        </div>
      </div>
    </section>
  );
}

function PlatformRail() {
  // duplicate the list for a seamless vertical loop
  const items = [...PLATFORMS, ...PLATFORMS];
  return (
    // the rail must NOT define the grid row height (the looped column is very
    // tall) — absolutely fill a zero-height column and let the dashboard size
    // the row.
    <div className="relative hidden lg:block">
      <div
        className="group absolute inset-0 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
        }}
      >
        <div className="marquee-col marquee-up gap-3 group-hover:[animation-play-state:paused]">
          {items.map((p, i) => (
            <PlatformTile key={`${p.slug}-${i}`} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlatformTile({ p }: { p: Platform }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 transition-colors duration-[var(--dur-fast)] hover:border-brand">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center">
        {p.logo}
      </span>
      <span className="truncate text-sm font-medium text-content">{p.name}</span>
    </div>
  );
}
