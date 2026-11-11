import type { Metadata } from "next";
import Link from "next/link";
import { PROJECT_CATEGORIES, getProjects } from "../../lib/projects-data";
import {
  ContactCtaSection,
  SiteFooter,
  SiteHeader,
} from "../components/site-shell";
import { ProjectsBrowser } from "./projects-browser";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore AI engineering, workflow automation, RAG, and Python backend project briefs by Shabnum H.",
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
      <SiteHeader active="Projects" />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8"
      >
        {/* OPEN EDITORIAL SHOWCASE HEADER */}
        <section className="px-1 pt-4 pb-1 sm:pt-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-[#2b3a50] bg-[#172130]/90 px-3.5 py-1 font-mono text-[11px] tracking-[0.16em] text-accent">
                PROJECTS / WORK INDEX
              </span>
              <h1 className="mt-5 text-[clamp(2rem,4.7vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
                Projects &amp;{" "}
                <span className="text-muted">case studies.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                A curated index of AI-powered applications, agentic workflow
                automations, and dependable backend architectures.
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
                href="/services"
                className="inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#111823] px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent"
              >
                View services
              </Link>
            </div>
          </div>
        </section>

        {/* FILTERABLE PROJECT INDEX */}
        <ProjectsBrowser
          projects={projects}
          categories={PROJECT_CATEGORIES}
        />

        {/* CONTACT CTA */}
        <ContactCtaSection
          eyebrow="NEXT STEP"
          title="Have a project in mind"
          description="Free consultation before starting. Share what you want to build, and let's shape a practical technical direction."
          primaryLabel="Discuss a project"
          primaryHref="/contact"
          secondaryLabel="View services"
          secondaryHref="/services"
        />
      </main>

      <SiteFooter />
    </div>
  );
}
