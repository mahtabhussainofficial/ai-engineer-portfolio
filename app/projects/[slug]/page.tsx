import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getProjectBySlug, getProjects } from "../../../lib/projects-data";
import {
  ContactCtaSection,
  Eyebrow,
  SiteFooter,
  SiteHeader,
  sectionButtonClass,
  tagClass,
} from "../../components/site-shell";

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
      title: "Project Brief",
      description: "Project brief and architectural case study.",
    };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
        <SiteHeader active="Projects" />

        <main
          id="main-content"
          className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8"
        >
          <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-14">
            <Eyebrow>PROJECTS / CASE STUDY</Eyebrow>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
              Project brief not found.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Requested reference:{" "}
              <span className="font-mono text-sm text-accent">{slug}</span>.
              This case study has not been published yet or may be managed from
              the portfolio dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent"
              >
                Back to projects
              </Link>
              <Link href="/contact" className={sectionButtonClass}>
                Discuss a project
              </Link>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
      <SiteHeader active="Projects" />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8"
      >
        {/* PROJECT HEADER */}
        <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors duration-200 hover:text-accent"
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
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent"
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
                  key={item}
                  className="rounded-lg border border-[#1e293b] bg-[#0b0f16]/70 p-4 text-sm leading-6 text-muted"
                >
                  <span className="mb-2 block font-mono text-[11px] text-accent">
                    0{index + 1}
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
      </main>

      <SiteFooter />
    </div>
  );
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="bg-grid-canvas min-h-screen" />}>
      <CaseStudy params={params} />
    </Suspense>
  );
}
