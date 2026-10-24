import { Section } from "@/components/layout/Section";

/** §2 The Shift — Bone. One idea, said once. */
export function Shift() {
  return (
    <Section innerClassName="max-w-[860px] text-center">
      <p className="font-display text-[28px] font-semibold leading-[1.25] tracking-title text-content md:text-[38px]">
        Your next customer might not be a person. It&apos;s their{" "}
        <span className="text-brand">AI agent</span>, comparing, booking and buying.
      </p>
      <p className="mx-auto mt-6 max-w-[600px] text-lg text-content-secondary">
        If the agent can&apos;t read your prices or press your buttons, it picks a site where it can.
      </p>
    </Section>
  );
}
