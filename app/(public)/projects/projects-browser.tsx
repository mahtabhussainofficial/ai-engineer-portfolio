"use client";

import Link from "next/link";
import { useState } from "react";
import { Eyebrow, tagClass } from "@/app/components/site-shell";
import type {
  ProjectFilterCategory,
  ProjectRecord,
} from "@/lib/projects-data";

export function ProjectsBrowser({
  projects,
  categories,
}: {
  projects: readonly ProjectRecord[];
  categories: readonly ProjectFilterCategory[];
}) {
  const [selected, setSelected] =
    useState<ProjectFilterCategory>("All Projects");

  const filtered =
    selected === "All Projects"
      ? projects
      : projects.filter((project) => project.category === selected);

  return (
    <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>01 / WORK INDEX</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
            Explore projects.
          </h2>
          <p className="mt-3 text-base leading-7 text-muted">
            Representative project briefs covering AI engineering, workflow
            automation, and backend systems.
          </p>
        </div>
        <p className="font-mono text-xs text-subtle">
          Showing {filtered.length} of {projects.length}
        </p>
      </div>

      <div
        className="mt-8 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter projects by category"
      >
        {categories.map((category) => {
          const isSelected = selected === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(category)}
              className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-4 sm:text-sm ${
                isSelected
                  ? "border-primary bg-primary text-white hover:border-primary-hover hover:bg-primary-hover"
                  : "border-[#2b3a50] bg-[#172130]/60 text-muted hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="surface-card mt-8 rounded-xl p-8 text-center">
          <p className="text-base font-medium text-foreground">
            No projects published in this category yet.
          </p>
          <button
            type="button"
            onClick={() => setSelected("All Projects")}
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130]/75 px-4 py-2 text-sm font-medium text-accent transition-colors duration-200 hover:border-accent/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Show all projects
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {filtered.map((project) => (
            <article
              key={project.id}
              className="surface-card surface-hover flex min-w-0 flex-col rounded-xl p-6 sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#233044] pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-accent">
                    {project.number}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.06em] text-subtle">
                    {project.category}
                  </span>
                </div>
                <span className="rounded border border-[#273549] bg-[#0b0f16]/80 px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted">
                  {project.status}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                {project.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {project.summary}
              </p>

              <div className="mt-auto flex flex-col gap-5 pt-6">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className={tagClass}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="border-t border-[#233044] pt-4">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <span>Open project brief</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
