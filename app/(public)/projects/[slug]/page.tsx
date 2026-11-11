import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ContactCtaSection,
  Eyebrow,
  sectionButtonClass,
  tagClass,
} from "@/app/components/site-shell";
import { getProjectBySlug, getProjects } from "@/lib/projects-data";

export function generateStaticParams() {
  return getProjects().map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project case study could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

function ProjectDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading project case study"
      className="flex flex-col gap-8 sm:gap-10"
    >
      <span className="sr-only">Loading project brief...</span>
      <section className="section-frame animate-pulse rounded-2xl p-6 sm:p-10 lg:p-12">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-6">
          <div className="h-4 w-36 rounded bg-[#172130]" />
          <div className="h-5 w-24 rounded bg-[#172130]" />
        </div>
        <div className="mt-8 space-y-4">
          <div className="h-3 w-40 rounded bg-[#172130]" />
          <div className="h-10 w-2/3 rounded bg-[#172130]" />
          <div className="h-5 w-full max-w-2xl rounded bg-[#172130]" />
          <div className="flex gap-2 pt-2">
            <div className="h-7 w-20 rounded-md bg-[#172130]" />
            <div className="h-7 w-24 rounded-md bg-[#172130]" />
            <div className="h-7 w-20 rounded-md bg-[#172130]" />
          </div>
        </div>
      </section>

      <section className="section-frame animate-pulse rounded-2xl p-6 sm:p-10 lg:p-12">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="surface-card h-44 rounded-xl p-6 sm:p-7" />
          <div className="surface-card h-44 rounded-xl p-6 sm:p-7" />
        </div>
        <div className="surface-card mt-5 h-36 rounded-xl p-6 sm:p-7" />
      </section>
    </div>
  );
}

async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      {/* PROJECT HEADER */}
      <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span aria-hidden="true">←</span>
            <span>Back to all projects</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-accent">
              {project.number}
            </span>
            <span className="rounded border border-[#273549] bg-[#0b0f16]/85 px-2.5 py-0.5 font-mono text-[11px] text-muted">
              {project.status}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <Eyebrow>{project.category.toUpperCase()}</Eyebrow>
          <h1 className="mt-4 max-w-4xl text-[clamp(1.95rem,4.4vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
            {project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            {project.summary}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className={tagClass}>
                {tag}
              </span>
            ))}
          </div>

          {project.liveUrl || project.repoUrl ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span>Live preview</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={sectionButtonClass}
                >
                  <span>View repository</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* 01 / PROBLEM & SOLUTION */}
      <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="surface-card rounded-xl p-6 sm:p-7">
            <Eyebrow>01 / PROBLEM &amp; CONTEXT</Eyebrow>
            <h2 className="mt-3 text-xl font-semibold text-foreground">
              Operational challenge
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
              {project.problem}
            </p>
          </article>

          <article className="surface-card rounded-xl p-6 sm:p-7">
            <Eyebrow>02 / ARCHITECTURE</Eyebrow>
            <h2 className="mt-3 text-xl font-semibold text-foreground">
              System approach
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
              {project.solution}
            </p>
          </article>
        </div>

        <div className="surface-card mt-5 rounded-xl p-6 sm:p-7">
          <Eyebrow>03 / KEY DELIVERABLES</Eyebrow>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {project.deliverables.map((item, index) => (
              <li
                key={`${project.id}-deliverable-${index}`}
                className="rounded-lg border border-[#1e293b] bg-[#0b0f16]/70 p-4 text-sm leading-6 text-muted"
              >
                <span className="mb-2 block font-mono text-[11px] text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ContactCtaSection
        eyebrow="04 / NEXT STEP"
        title="Need something similar built"
        description="Free consultation before starting. Share the workflow or system requirements you are exploring."
        primaryLabel="Discuss a project"
        primaryHref="/contact"
        secondaryLabel="Back to projects"
        secondaryHref="/projects"
      />
    </>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <CaseStudy params={params} />
    </Suspense>
  );
}
