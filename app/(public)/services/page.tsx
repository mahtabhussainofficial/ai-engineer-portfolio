import type { Metadata } from "next";
import Link from "next/link";
import {
  ContactCtaSection,
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
} from "@/app/components/site-shell";
import { SERVICE_CATEGORIES } from "@/lib/services-data";
import { getPublicProcessSteps, getPublicServices } from "@/lib/public-api";
import { ServicesBrowser } from "./services-browser";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI engineering services including agentic workflows, voice AI, RAG knowledge systems, LLM integration, and Python backend development.",
};

export default async function ServicesPage() {
  const [services, processSteps] = await Promise.all([
    getPublicServices(),
    getPublicProcessSteps(),
  ]);

  return (
    <>
      {/* SHOWCASE HEADER - Single column with buttons directly underneath */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
              <Eyebrow>Capabilities</Eyebrow>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              AI Engineering Services.
              <span className="block mt-2 text-[#c4f042]">
                Built for practical progress.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-400 max-w-2xl">
              Building AI-powered applications, intelligent workflow automation,
              and dependable backend systems engineered around measurable product
              needs and deterministic outcomes.
            </p>

            {/* Buttons directly below description */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/contact" className={primaryButtonClass}>
                <span>Discuss a project</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/projects" className={sectionButtonClass}>
                <span>View case studies</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERABLE CAPABILITIES BROWSER */}
      <ServicesBrowser services={services} categories={SERVICE_CATEGORIES} />

      {/* HOW WE WORK - ENGINEERING METHODOLOGY */}
      <section className="section-divider py-14 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Methodology</Eyebrow>
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                A clear path from question to system.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Every engagement starts by identifying the real workflow bottleneck,
                establishing baseline metrics, and constructing reproducible, scalable solutions.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => {
              const phases = [
                "Discovery & Scoping",
                "System Architecture",
                "Build & Integration",
                "Testing & Deployment",
              ];
              const phaseName = phases[index] || step.title;

              return (
                <div
                  key={step.number}
                  className="dev-card group relative flex flex-col justify-between h-full rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <span className="text-xs font-bold text-[#c4f042]">
                        {step.number}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        {phaseName}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-white group-hover:text-[#c4f042] transition-colors">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <ContactCtaSection
        eyebrow="Capabilities"
        title="Have an AI workflow bottleneck to solve?"
        description="Share your requirements, data sources, or backend specifications. Let's build a deterministic solution."
        primaryLabel="Discuss your project"
        primaryHref="/contact"
        secondaryLabel="View case studies"
        secondaryHref="/projects"
      />
    </>
  );
}
