"use client";

import Link from "next/link";
import { useState } from "react";
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
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? "bg-[#c4f042] text-zinc-950 font-bold shadow-sm"
                      : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-zinc-400">
            Showing <span className="text-white font-semibold">{filtered.length}</span> of {projects.length} case studies
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="dev-card mt-8 rounded-2xl p-12 text-center">
            <p className="text-base font-medium text-white">
              No projects published in this category yet.
            </p>
            <button
              type="button"
              onClick={() => setSelected("All Projects")}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Show all projects
            </button>
          </div>
        ) : (
          /* Exact 3-column match to Home Page (Screenshot reference) */
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, index) => {
              // Sequential clean numbering: 01, 02, 03...
              const displayNum = String(index + 1).padStart(2, "0");
              const displayCategory =
                project.homeCategoryLabel || project.category.toUpperCase();

              return (
                <article
                  key={project.id}
                  className="dev-card group relative flex flex-col justify-between h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
                >
                  <div>
                    {/* Unified Top Line (01 · NAME + Green Dot) */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                      <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                        {displayNum} · {displayCategory}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
                    </div>

                    {/* Title & Summary */}
                    <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-zinc-400 min-h-[3rem]">
                      {project.summary}
                    </p>

                    {/* Key Deliverables Checkmarks (Exact match to Home page) */}
                    {project.deliverables && project.deliverables.length > 0 ? (
                      <div className="mt-5 space-y-2">
                        {project.deliverables.slice(0, 2).map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed"
                          >
                            <span className="text-[#c4f042] font-bold">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Bottom: Tags & Full-Width Action Button with Unified Hover Effect */}
                  <div className="mt-8 border-t border-white/[0.06] pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                      Core Tooling
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/5 hover:text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Full-width pill button matching Home Page */}
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 bg-transparent py-2.5 text-xs font-semibold text-white transition-all duration-150 hover:border-[#c4f042] hover:bg-[#c4f042]/10 hover:text-[#c4f042]"
                    >
                      <span>View Case Study</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
