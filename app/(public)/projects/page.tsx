import type { Metadata } from "next";
import Link from "next/link";
import {
  ContactCtaSection,
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
} from "@/app/components/site-shell";
import { PROJECT_CATEGORIES } from "@/lib/projects-data";
import { getPublicProjects } from "@/lib/public-api";
import { ProjectsBrowser } from "./projects-browser";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore AI engineering, workflow automation, RAG, and Python backend project briefs by Shabnum H.",
};

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <>
      {/* SHOWCASE HEADER */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Work Archive</Eyebrow>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                Projects &amp; Case Studies.
              </h1>
              <p className="mt-3 text-base leading-relaxed text-zinc-400">
                A curated catalog of production AI applications, agentic
                automations, and dependable backend architectures.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/contact" className={primaryButtonClass}>
                <span>Discuss a project</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/services" className={sectionButtonClass}>
                <span>View services</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERABLE BROWSER */}
      <ProjectsBrowser projects={projects} categories={PROJECT_CATEGORIES} />

      {/* CONTACT CTA */}
      <ContactCtaSection
        eyebrow="Initiate A Project"
        title="Ready to engineer your next AI system?"
        description="Whether you need a custom RAG pipeline, automated agents, or a dependable Python backend, let's talk through your architecture."
        primaryLabel="Start a conversation"
        primaryHref="/contact"
        secondaryLabel="Explore services"
        secondaryHref="/services"
      />
    </>
  );
}
