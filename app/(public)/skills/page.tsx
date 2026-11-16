import type { Metadata } from "next";
import Link from "next/link";
import {
  ContactCtaSection,
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
  tagClass,
} from "@/app/components/site-shell";
import type { SkillLayerId } from "@/lib/skills-data";
import { getPublicSkillGroups, getPublicSkillLayers } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Programming languages, AI & LLM frameworks, backend APIs, databases, and cloud delivery tooling used by Shabnum H.",
};

const layerGridClasses: Record<SkillLayerId, string> = {
  ai: "md:grid-cols-2 lg:grid-cols-[0.85fr_1.15fr]",
  backend: "md:grid-cols-2 lg:grid-cols-3",
  delivery: "md:grid-cols-2 lg:grid-cols-[0.85fr_1.15fr]",
};

export default async function SkillsPage() {
  const [skillGroups, skillLayers] = await Promise.all([
    getPublicSkillGroups(),
    getPublicSkillLayers(),
  ]);
  const totalSkills = skillGroups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <>
      {/* SHOWCASE HEADER */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Toolkit</Eyebrow>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                A Practical Engineering Stack.
              </h1>
              <p className="mt-3 text-base leading-relaxed text-zinc-400">
                {totalSkills} core technologies organized across{" "}
                {skillGroups.length} specialized engineering layers—from LLM
                orchestration to Python services and container infrastructure.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/projects" className={primaryButtonClass}>
                <span>See skills in projects</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/services" className={sectionButtonClass}>
                <span>View services</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 ARCHITECTURAL STACK LAYERS */}
      {skillLayers.map((layer) => {
        const layerGroups = skillGroups.filter(
          (group) => group.layer === layer.id,
        );
        const spanLastOddCard = layerGroups.length % 2 === 1;

        return (
          <section key={layer.id} className="section-divider py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <Eyebrow>{layer.eyebrow}</Eyebrow>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {layer.title}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 sm:text-right">
                  {layer.description}
                </p>
              </div>

              <div
                className={`mt-8 grid gap-5 ${layerGridClasses[layer.id]}`}
              >
                {layerGroups.map((group, index) => (
                  <article
                    key={group.id}
                    className={`dev-card flex flex-col rounded-xl p-6 sm:p-7 ${
                      spanLastOddCard && index === layerGroups.length - 1
                        ? "md:col-span-2 lg:col-span-1"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <span className="font-mono text-xs font-semibold text-blue-400">
                        {group.number}
                      </span>
                      <span className="font-mono text-[10px] tracking-wide text-zinc-400">
                        {group.domain}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-white">
                      {group.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      {group.description}
                    </p>

                    <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                      {group.items.map((item) => (
                        <li key={item} className={tagClass}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* CONTACT CTA */}
      <ContactCtaSection
        eyebrow="Implementation"
        title="Need this stack deployed on your project?"
        description="Let's review your stack requirements, API design, or LLM agentic pipeline."
        primaryLabel="Discuss a project"
        primaryHref="/contact"
        secondaryLabel="View projects"
        secondaryHref="/projects"
      />
    </>
  );
}
