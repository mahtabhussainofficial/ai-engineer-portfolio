import type { Metadata } from "next";
import Link from "next/link";
import {
  ContactCtaSection,
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
} from "@/app/components/site-shell";
import type { SkillLayerId } from "@/lib/skills-data";
import { getPublicSkillGroups, getPublicSkillLayers } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Programming languages, AI & LLM frameworks, backend APIs, databases, and cloud delivery tooling used by Shabnum H.",
};

const layerGridClasses: Record<SkillLayerId, string> = {
  ai: "md:grid-cols-2",
  backend: "md:grid-cols-2 lg:grid-cols-3",
  delivery: "md:grid-cols-2",
};

export default async function SkillsPage() {
  const [skillGroups, skillLayers] = await Promise.all([
    getPublicSkillGroups(),
    getPublicSkillLayers(),
  ]);
  const totalSkills = skillGroups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <>
      {/* SHOWCASE HEADER - Single column with buttons directly underneath */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
              <Eyebrow>Technical Toolkit</Eyebrow>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              A Practical Engineering Stack.
              <span className="block mt-2 text-[#c4f042]">
                Battle-tested frameworks &amp; runtime infrastructure.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-400 max-w-2xl">
              {totalSkills} core technologies organized across{" "}
              {skillGroups.length} specialized engineering layers—from multi-agent
              LLM orchestration to Python backend services and container infrastructure.
            </p>

            {/* Buttons directly below description */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/projects" className={primaryButtonClass}>
                <span>See skills in projects</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/services" className={sectionButtonClass}>
                <span>Explore services</span>
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

        return (
          <section key={layer.id} className="section-divider py-14 sm:py-18">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                  <Eyebrow>{layer.eyebrow}</Eyebrow>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {layer.title}
                </h2>
              </div>

              {/* Cards Grid with Perfect Divider Alignment */}
              <div
                className={`mt-10 grid gap-6 ${layerGridClasses[layer.id]}`}
              >
                {layerGroups.map((group) => (
                  <article
                    key={group.id}
                    className="dev-card group relative flex flex-col h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
                  >
                    {/* Top Content: Strictly locked to h-[150px] exactly like homepage */}
                    <div className="h-[150px]">
                      {/* Unified Top Line (01 · DOMAIN + Green Dot) */}
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                        <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                          {group.number} · {group.domain}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
                      </div>

                      <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                        {group.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                        {group.description}
                      </p>
                    </div>

                    {/* Bottom: Strictly Aligned Tooling with Unified Hover Effect */}
                    <div className="border-t border-white/[0.06] pt-5 mt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                        Core Tooling
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/5 hover:text-white"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
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
        secondaryLabel="View case studies"
        secondaryHref="/projects"
      />
    </>
  );
}
