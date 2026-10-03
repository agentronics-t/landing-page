"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Bot, Building2, Fingerprint, KeyRound, Lock, MonitorSmartphone, Signature } from "lucide-react";
import { Eyebrow } from "@/components/layout/Eyebrow";
import { fadeUp, inViewOnce, stagger } from "@/lib/motion";

/** "Every way an agent can prove who it is" — the authentication-methods grid. */

const METHODS = [
  { Icon: Signature, name: "Web Bot Auth", body: "Cryptographically signed requests (IETF, RFC 9421) — how OpenAI's ChatGPT agent identifies itself.", href: "/docs/auth/web-bot-auth" },
  { Icon: Bot, name: "Verified crawlers", body: "Googlebot, Bingbot and Applebot confirmed by reverse DNS — spoofed user agents don't pass.", href: "/docs/auth/verified-crawlers" },
  { Icon: KeyRound, name: "Agent API keys", body: "Issue a key to each agent you or your customers run. Hashed at rest, revocable.", href: "/docs/auth/api-keys" },
  { Icon: BadgeCheck, name: "OAuth2", body: "Client-credentials tokens from your identity provider, checked for issuer, audience and scopes.", href: "/docs/auth/oauth2" },
  { Icon: MonitorSmartphone, name: "WebMCP & browser agents", body: "Agents operating your pages, detected and verified in the browser.", href: "/docs/auth/browser-agents" },
  { Icon: Building2, name: "SSO / OIDC", body: "Enterprise agents signing in through your IdP.", href: "/docs/auth/sso" },
  { Icon: Fingerprint, name: "SPIFFE", body: "Workload identity for agents running in your infrastructure.", href: "/docs/auth/spiffe" },
  { Icon: Lock, name: "mTLS", body: "Client-certificate agents, verified at your proxy.", href: "/docs/auth/mtls" },
];

export function AuthMethods() {
  return (
    <section data-screen-label="auth-methods" className="bg-canvas px-[clamp(20px,5vw,48px)] py-20 md:py-24">
      <div className="mx-auto max-w-content">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={inViewOnce} className="text-center">
          <motion.div variants={fadeUp}>
            <Eyebrow>Authentication methods</Eyebrow>
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-4 text-3xl font-bold tracking-display text-content md:text-4xl">
            Every way an agent can prove who it is
          </motion.h2>
          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-[600px] text-pretty text-lg text-content-secondary">
            Open standards, not IP lists. Turn on the methods your agents use — the strongest proof wins.
          </motion.p>
        </motion.div>

        <motion.ul
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inViewOnce}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {METHODS.map(({ Icon, name, body, href }) => (
            <motion.li key={name} variants={fadeUp}>
              <a
                href={href}
                className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-[var(--brand)] focus-ring"
              >
                <span className="grid h-10 w-10 place-items-center rounded-md bg-brand-soft text-brand">
                  <Icon size={20} />
                </span>
                <span className="mt-4 text-base font-semibold text-content">{name}</span>
                <span className="mt-1.5 text-sm text-content-secondary">{body}</span>
                <span className="mt-auto pt-4 text-sm font-medium text-brand opacity-80 group-hover:opacity-100">Docs →</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
