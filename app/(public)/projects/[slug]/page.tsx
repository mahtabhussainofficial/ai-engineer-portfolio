import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ContactCtaSection,
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
} from "@/app/components/site-shell";
import { getPublicProjectBySlug, getPublicProjects } from "@/lib/public-api";

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

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
    title: `${project.title} | Case Study`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const displayCategory = project.homeCategoryLabel || project.category.toUpperCase();

  return (
    <>
      {/* 01 / CASE STUDY HEADER */}
      <section className="pt-4 pb-12 sm:pt-6 sm:pb-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Top Breadcrumb Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-4 sm:pb-6">
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 transition-colors hover:text-[#c4f042] w-fit"
            >
              <span aria-hidden="true" className="transition-transform duration-150 group-hover:-translate-x-1">←</span>
              <span>Back to all projects</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                {project.number} · {displayCategory}
              </span>
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#c4f042]" />
            </div>
          </div>

          {/* Title & Summary */}
          <div className="mt-8 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
              <Eyebrow>{project.category}</Eyebrow>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {project.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-400">
              {project.summary}
            </p>

            {/* Core Tooling Stack Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/5 hover:text-white"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Buttons Directly Below */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/contact" className={primaryButtonClass}>
                <span>Discuss this architecture</span>
                <span aria-hidden="true">→</span>
              </Link>
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={sectionButtonClass}
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
          </div>

          {/* Metadata Overview Bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:grid-cols-4 sm:gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Focus Area
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                {project.category}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Project Format
              </p>
              <p className="mt-1 text-sm font-bold text-[#c4f042]">
                {project.status}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Engineering Role
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                Lead AI &amp; Backend
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                System Status
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                Production-Ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 02 / PROBLEM VS SYSTEM ARCHITECTURE */}
      <section className="section-divider py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Operational Challenge Card */}
            <article className="dev-card group rounded-2xl p-7 sm:p-9 transition-all duration-200 hover:border-[#c4f042]/50">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                  01 · The Challenge
                </span>
                <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                Operational Problem
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                {project.problem}
              </p>
            </article>

            {/* System Approach Card */}
            <article className="dev-card group rounded-2xl p-7 sm:p-9 transition-all duration-200 hover:border-[#c4f042]/50">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                  02 · The Architecture
                </span>
                <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                System Solution &amp; Approach
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                {project.solution}
              </p>
            </article>
          </div>

          {/* Key Deliverables Grid */}
          <div className="mt-14 border-t border-white/[0.08] pt-12">
            <div className="max-w-2xl mb-8">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Deliverables</Eyebrow>
              </div>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Key Engineering Components.
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Core architectural blocks delivered and validated for this case study.
              </p>
            </div>

            <ul className="grid gap-5 md:grid-cols-3">
              {project.deliverables.map((item, index) => (
                <li
                  key={`${project.id}-deliverable-${index}`}
                  className="dev-card group relative flex flex-col justify-between h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <span className="text-2xl font-black text-[#c4f042]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]/60 group-hover:bg-[#c4f042] transition-colors" />
                    </div>

                    <p className="mt-4 text-sm font-medium leading-relaxed text-zinc-200 group-hover:text-white transition-colors">
                      {item}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-white/[0.06] pt-3 flex items-center gap-1.5 text-xs text-[#c4f042]">
                    <span>✓</span>
                    <span className="text-[11px] font-semibold text-zinc-400">Verified Component</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 03 / CONTACT CTA */}
      <ContactCtaSection
        eyebrow="Collaboration"
        title="Need something similar engineered?"
        description="Share your workflow bottleneck, latency requirements, or document retrieval challenge. Let's design a reliable solution."
        primaryLabel="Discuss this brief"
        primaryHref="/contact"
        secondaryLabel="Back to projects"
        secondaryHref="/projects"
      />
    </>
  );
}
