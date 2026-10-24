import { Plus } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/Section";

export const FAQ = [
  {
    q: "Will this change my site's design?",
    a: "No. The fixes are things people don't see: WebMCP tools registered in the page, labels on fields and buttons, structured data. They arrive as a pull request, and nothing changes until you merge it.",
  },
  {
    q: "Does it affect SEO?",
    a: "Not in a bad way. Server-rendered content, clear headings, structured data and a sitemap are the same things search engines reward. We never show agents different content from people.",
  },
  {
    q: "How long does setup take?",
    a: "The check takes about 30 seconds. To fix things, connect your GitHub repository; Agent Nick reads the code and opens a pull request with the changes for you to review.",
  },
  {
    q: "Which AI agents does this help?",
    a: "Any agent that reads web pages, like ChatGPT, Claude, Perplexity and Gemini, benefits from content it can read. Browsers that support WebMCP, which Chrome is testing now, can also call your site's actions directly.",
  },
  {
    q: "Can agents do things I don't want?",
    a: "You decide. Each action can be allowed, denied, or set to ask the person on the page first. Agents are never blocked from browsing; rules only apply to the actions you publish.",
  },
];

/** §8 FAQ — Bone. Native <details>, works without JavaScript (agents included). */
export function Faq() {
  return (
    <Section innerClassName="grid gap-10 md:grid-cols-[1fr_1.6fr]">
      <SectionHeading eyebrow="FAQ" title="Questions people ask first" />
      <div className="divide-y divide-border border-y border-border">
        {FAQ.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-semibold text-content [&::-webkit-details-marker]:hidden">
              {item.q}
              <Plus size={18} className="shrink-0 text-content-muted transition-transform group-open:rotate-45" aria-hidden />
            </summary>
            <p className="mt-3 max-w-[620px] text-md text-content-secondary">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
