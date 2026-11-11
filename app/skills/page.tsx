import type { Metadata } from "next";
import Link from "next/link";
import {
  getSkillGroups,
  getSkillLayers,
  getTotalSkillCount,
  type SkillLayerId,
} from "../../lib/skills-data";
import {
  ContactCtaSection,
  Eyebrow,
  SiteFooter,
  SiteHeader,
  tagClass,
} from "../components/site-shell";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Programming languages, AI & LLM frameworks, backend APIs, databases, and cloud delivery tooling used by Shabnum H.",
};

const layerGridClasses: Record<SkillLayerId, string> = {
  ai: "md:grid-cols-2 lg:grid-cols-[0.82fr_1.18fr]",
  backend: "md:grid-cols-2 lg:grid-cols-3",
  delivery: "md:grid-cols-2 lg:grid-cols-[0.85fr_1.15fr]",
};

export default function SkillsPage() {
  const skillGroups = getSkillGroups();
  const skillLayers = getSkillLayers();
  const totalSkills = getTotalSkillCount();

  return (
    <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
      <SiteHeader active="Skills" />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8"
      >
        {/* OPEN EDITORIAL HEADER */}
        <section className="px-1 pt-4 pb-1 sm:pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[#2b3a50] bg-[#172130]/90 px-3.5 py-1 font-mono text-[11px] tracking-[0.16em] text-accent">
                SKILLS / CAPABILITY MAP
              </span>
              <h1 className="mt-5 text-[clamp(2rem,4.7vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
                A practical{" "}
                <span className="text-muted">engineering toolkit.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                {totalSkills} core technologies organized across{" "}
                {skillGroups.length} role-based capability groups—from LLM
                orchestration to Python APIs and infrastructure.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span>See skills in projects</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#111823] px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent"
              >
                View services
              </Link>
            </div>
          </div>
        </section>

        {/* 3 ARCHITECTURAL STACK LAYERS */}
        {skillLayers.map((layer) => {
          const layerGroups = skillGroups.filter(
            (group) => group.layer === layer.id,
          );

          return (
            <section
              key={layer.id}
              className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Eyebrow>{layer.eyebrow}</Eyebrow>
                  <h2 className="mt-2.5 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl">
                    {layer.title}
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-6 text-subtle sm:text-right">
                  {layer.description}
                </p>
              </div>

              <div className={`mt-8 grid gap-5 ${layerGridClasses[layer.id]}`}>
                {layerGroups.map((group, index) => (
                  <article
                    key={group.id}
                    className={`surface-card surface-hover flex min-w-0 flex-col rounded-xl p-6 ${
                      layer.id === "backend" && index === 2
                        ? "md:col-span-2 lg:col-span-1"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-[#233044] pb-4">
                      <span className="font-mono text-xs text-accent">
                        {group.number}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.08em] text-subtle">
                        {group.domain}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold leading-snug text-foreground">
                      {group.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-6 text-muted lg:min-h-[4.5rem] xl:min-h-[3rem]">
                      {group.description}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-2 border-t border-[#233044] pt-4">
                      {group.items.map((item) => (
                        <li key={item} className={tagClass}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* CONTACT CTA */}
        <ContactCtaSection
          eyebrow="NEXT STEP"
          title="Need this stack on your project"
          description="Free consultation before starting. Share the workflow or technical requirements you want to solve."
          primaryLabel="Discuss a project"
          primaryHref="/contact"
          secondaryLabel="View projects"
          secondaryHref="/projects"
        />
      </main>

      <SiteFooter />
    </div>
  );
}
