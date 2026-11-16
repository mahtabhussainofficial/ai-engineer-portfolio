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
      {/* SHOWCASE HEADER - Single column with buttons directly underneath */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
              <Eyebrow>Work Archive</Eyebrow>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Projects &amp; Case Studies.
              <span className="block mt-2 text-[#c4f042]">
                Architected for real business impact.
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-400 max-w-2xl">
              A curated catalog of production AI applications, agentic automations,
              and dependable backend architectures built with strict validation, high uptime, and grounded intelligence.
            </p>

            {/* Buttons directly below description */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/contact" className={primaryButtonClass}>
                <span>Discuss a project</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/services" className={sectionButtonClass}>
                <span>Explore services</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERABLE PROJECTS BROWSER */}
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
