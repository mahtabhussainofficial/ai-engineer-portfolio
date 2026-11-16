"use client";

import Link from "next/link";
import { useState } from "react";
import { tagClass } from "@/app/components/site-shell";
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
    <section className="section-divider py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Pill Category Buttons */}
          <div
            className="flex flex-wrap gap-2"
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
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-[#c4f042] text-zinc-950 font-bold"
                      : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <p className="font-mono text-xs text-zinc-400">
            Showing {filtered.length} of {projects.length} systems
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="dev-card mt-8 rounded-xl p-10 text-center">
            <p className="text-base font-medium text-white">
              No projects published in this category yet.
            </p>
            <button
              type="button"
              onClick={() => setSelected("All Projects")}
              className="mt-4 inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Show all projects
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {filtered.map((project) => (
              <article
                key={project.id}
                className="dev-card flex min-w-0 flex-col rounded-xl p-6 sm:p-7"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <span className="font-mono text-xs font-semibold text-blue-400">
                    {project.number}
                  </span>
                  <span className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                    {project.status}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-white">
                  {project.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {project.summary}
                </p>

                <div className="mt-auto flex flex-col gap-4 pt-6">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span key={tag} className={tagClass}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-white/[0.06] pt-3">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-white"
                    >
                      <span>Read project brief</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
