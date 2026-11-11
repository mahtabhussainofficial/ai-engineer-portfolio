import type { Metadata } from "next";
import Link from "next/link";
import {
  SERVICE_CATEGORIES,
  getProcessSteps,
  getServices,
} from "../../lib/services-data";
import {
  ContactCtaSection,
  Eyebrow,
  SiteFooter,
  SiteHeader,
} from "../components/site-shell";
import { ServicesBrowser } from "./services-browser";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI engineering services including agentic workflows, voice AI, RAG knowledge systems, LLM integration, and Python backend development.",
};

export default function ServicesPage() {
  const services = getServices();
  const processSteps = getProcessSteps();

  return (
    <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
      <SiteHeader active="Services" />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8"
      >
        {/* OPEN EDITORIAL HEADER */}
        <section className="px-1 pt-4 pb-1 sm:pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[#2b3a50] bg-[#172130]/90 px-3.5 py-1 font-mono text-[11px] tracking-[0.16em] text-accent">
                SERVICES / AI ENGINEERING
              </span>
              <h1 className="mt-5 text-[clamp(2rem,4.7vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
                AI engineering{" "}
                <span className="text-muted">services.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Building AI-powered applications, intelligent workflow
                automation, and dependable backend systems around clear product
                needs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span>Discuss a project</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#111823] px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent"
              >
                View projects
              </Link>
            </div>
          </div>
        </section>

        {/* 01 / FILTERABLE CAPABILITIES */}
        <ServicesBrowser
          services={services}
          categories={SERVICE_CATEGORIES}
        />

        {/* 02 / HOW WE WORK */}
        <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:gap-12">
            <div>
              <Eyebrow>02 / HOW WE WORK</Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
                A clear path from question to system.
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-muted">
                Every engagement starts by defining the real workflow problem
                before selecting models, APIs, or infrastructure.
              </p>
            </div>

            <div className="divide-y divide-[#1e293b] rounded-xl border border-[#233044] bg-[#172130]/45">
              {processSteps.map((step) => (
                <div
                  key={step.number}
                  className="grid gap-3 p-5 md:grid-cols-[3rem_12.5rem_minmax(0,1fr)] md:items-baseline md:gap-4 md:p-6"
                >
                  <span className="font-mono text-xs text-accent">
                    {step.number}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-6 text-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 / CONTACT CTA */}
        <ContactCtaSection
          eyebrow="03 / START A PROJECT"
          title="Have a useful problem in mind"
          description="Free consultation before starting. Share what you need to build or automate, and let's find a practical path forward."
          primaryLabel="Discuss a project"
          primaryHref="/contact"
          secondaryLabel="Explore projects"
          secondaryHref="/projects"
        />
      </main>

      <SiteFooter />
    </div>
  );
}
