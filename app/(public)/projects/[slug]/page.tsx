import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ContactCtaSection,
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
  tagClass,
} from "@/app/components/site-shell";
import { getPublicProjectBySlug } from "@/lib/public-api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

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
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="h-4 w-32 rounded bg-zinc-800" />
      <div className="mt-4 h-10 w-2/3 rounded bg-zinc-800" />
      <div className="mt-4 h-6 w-1/2 rounded bg-zinc-800" />
    </div>
  );
}

async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      {/* PROJECT HEADER - Open Canvas */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 transition-colors hover:text-white"
            >
              <span aria-hidden="true">←</span>
              <span>Back to all projects</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-blue-400">
                {project.number}
              </span>
              <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-zinc-400">
                {project.status}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <Eyebrow>{project.category}</Eyebrow>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              {project.summary}
            </p>

            <div className="mt-6 flex flex-wrap gap-1.5">
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
                    className={primaryButtonClass}
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
        </div>
      </section>

      {/* PROBLEM & ARCHITECTURE */}
      <section className="section-divider py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="dev-card rounded-xl p-6 sm:p-8">
              <Eyebrow>Challenge</Eyebrow>
              <h2 className="mt-2 text-xl font-bold text-white">
                Operational Problem
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                {project.problem}
              </p>
            </article>

            <article className="dev-card rounded-xl p-6 sm:p-8">
              <Eyebrow>Engineering</Eyebrow>
              <h2 className="mt-2 text-xl font-bold text-white">
                System Approach
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                {project.solution}
              </p>
            </article>
          </div>

          <div className="mt-8 border-t border-white/[0.06] pt-8">
            <Eyebrow>Deliverables</Eyebrow>
            <h3 className="mt-2 text-lg font-bold text-white">
              Key Components
            </h3>
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {project.deliverables.map((item, index) => (
                <li
                  key={`${project.id}-deliverable-${index}`}
                  className="dev-card rounded-xl p-5 text-sm leading-relaxed text-zinc-300"
                >
                  <span className="mb-2 block font-mono text-xs font-semibold text-blue-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ContactCtaSection
        eyebrow="Collaboration"
        title="Need something similar engineered?"
        description="Share your workflow, latency requirements, or document retrieval challenges."
        primaryLabel="Discuss this brief"
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
