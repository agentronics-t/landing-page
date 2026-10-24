import { Section, SectionHeading } from "@/components/layout/Section";

const STEPS = [
  { title: "Scan", body: "Enter your URL. We check how AI agents see your site: what they can find, read and do." },
  { title: "Fix", body: "We show what's broken and fix it for you. Agent Nick writes the code and sends it as a pull request you approve." },
  { title: "Get found", body: "AI agents can read your site, recommend you, and act on it: compare, book, buy." },
];

/** §4 How it works — Bone. Three steps on one copper trace. */
export function HowItWorks() {
  return (
    <Section id="how-it-works" className="scroll-mt-16">
      <SectionHeading eyebrow="How it works" title="Three steps. No redesign." />
      <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        <span className="absolute left-[11px] top-3 h-[calc(100%-24px)] w-px bg-copper opacity-70 md:left-3 md:right-0 md:top-[11px] md:h-px md:w-auto" aria-hidden />
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative pl-12 md:pl-0 md:pt-12">
            <span className="absolute left-0 top-0 grid h-6 w-6 place-items-center rounded-full border-2 border-verdigris bg-canvas font-mono text-[11px] font-medium text-content">
              {i + 1}
            </span>
            <h3 className="font-display text-xl font-bold text-content">{s.title}</h3>
            <p className="mt-2 text-md text-content-secondary">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
