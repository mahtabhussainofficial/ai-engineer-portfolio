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
      {/* SHOWCASE HEADER */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Capabilities</Eyebrow>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                AI Engineering Services.
              </h1>
              <p className="mt-3 text-base leading-relaxed text-zinc-400">
                Building AI-powered applications, intelligent workflow
                automation, and dependable backend systems engineered around
                tangible product needs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/contact" className={primaryButtonClass}>
                <span>Discuss a project</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/projects" className={sectionButtonClass}>
                <span>View projects</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERABLE CAPABILITIES */}
      <ServicesBrowser services={services} categories={SERVICE_CATEGORIES} />

      {/* HOW WE WORK */}
      <section className="section-divider py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Methodology</Eyebrow>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                A clear path from question to system.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Every engagement starts by identifying the real workflow
                bottleneck, establishing baseline metrics, and constructing
                reproducible solutions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {processSteps.map((step) => (
                <div
                  key={step.number}
                  className="dev-card rounded-xl p-6"
                >
                  <span className="font-mono text-xs font-semibold text-blue-400">
                    {step.number}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <ContactCtaSection
        eyebrow="Initiate A Collaboration"
        title="Ready to build something practical?"
        description="Schedule a consultation or send a project brief. Let's design a reliable AI architecture for your business."
        primaryLabel="Start a conversation"
        primaryHref="/contact"
        secondaryLabel="View projects"
        secondaryHref="/projects"
      />
    </>
  );
}
