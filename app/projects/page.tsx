"use client";

import Link from "next/link";
import { useState } from "react";

type ProjectCategory =
  | "All Projects"
  | "AI & Machine Learning"
  | "Agentic AI & Automation"
  | "Backend & API Development"
  | "Full-Stack Applications";

type Project = {
  slug: string;
  title: string;
  description: string;
  category: Exclude<ProjectCategory, "All Projects">;
  technologies: string[];
  image?: string;
  github?: string;
  demo?: string;
  caseStudy?: string;
};

const categories: ProjectCategory[] = [
  "All Projects",
  "AI & Machine Learning",
  "Agentic AI & Automation",
  "Backend & API Development",
  "Full-Stack Applications",
];

// TODO: Add verified project records, links, and visuals before publishing case studies.
const projects: Project[] = [];

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Skills", href: "/#skills" },
  { label: "Contact", href: "/contact" },
];

const linkClass =
  "text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory>("All Projects");

  const filteredProjects =
    selectedCategory === "All Projects"
      ? projects
      : projects.filter((project) => project.category === selectedCategory);

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <header className="border-b border-white/10">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
        >
          <Link
            href="/#home"
            className="font-mono text-sm font-semibold tracking-[0.18em] text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            YOUR NAME<span className="text-accent">.</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.label === "Projects" ? "page" : undefined}
                className={
                  item.label === "Projects"
                    ? "text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    : linkClass
                }
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#contact"
              className="rounded-full border border-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Let&apos;s talk
            </Link>
          </div>

          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-white/10 px-3 py-2 text-sm text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <span className="sr-only">Open navigation</span>
              <span aria-hidden="true" className="text-lg leading-none">
                ☰
              </span>
            </summary>
            <div className="absolute right-0 top-12 z-10 w-48 rounded-xl border border-white/10 bg-surface p-2 shadow-2xl">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={item.label === "Projects" ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 ${
                    item.label === "Projects"
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  } hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </nav>
      </header>

      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
            <p className="mb-5 font-mono text-xs tracking-[0.2em] text-accent">
              PROJECTS / CASE STUDIES
            </p>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                Projects <span className="text-accent">&amp; Case Studies</span>
              </h1>
              <div>
                <p className="max-w-xl text-lg leading-8 text-muted">
                  A growing collection of AI-powered applications, intelligent
                  automation systems, backend solutions, and practical
                  engineering work.
                </p>
                <Link
                  href="/#contact"
                  className="mt-7 inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  Discuss a project <span className="ml-2" aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="project-list-heading">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                  WORK INDEX
                </p>
                <h2
                  id="project-list-heading"
                  className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                >
                  Explore the work
                </h2>
              </div>
              <p className="max-w-md leading-7 text-muted">
                Filter by the kind of engineering problem a project explores.
              </p>
            </div>

            <div
              className="mb-10 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter projects by category"
            >
              {categories.map((category) => {
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-4 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                      isSelected
                        ? "border-primary bg-primary text-foreground"
                        : "border-white/10 text-muted hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {filteredProjects.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredProjects.map((project) => (
                  <article
                    key={project.title}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface transition-colors hover:border-primary/60"
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      aria-label={`Open ${project.title} project`}
                      className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"
                    />
                    <div className="relative z-10 flex aspect-[16/7] pointer-events-none items-center justify-center border-b border-white/10 bg-background">
                      {project.image ? (
                        <span className="text-sm text-muted">{project.image}</span>
                      ) : (
                        <span className="font-mono text-xs tracking-widest text-muted">
                          PROJECT VISUAL
                        </span>
                      )}
                    </div>
                    <div className="relative z-10 pointer-events-none p-6 sm:p-8">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-xs text-accent">
                          {project.category}
                        </span>
                        <span className="text-xl text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                          ↗
                        </span>
                      </div>
                      <h3 className="mt-6 text-2xl font-semibold text-foreground">
                        {project.title}
                      </h3>
                      <p className="mt-3 leading-7 text-muted">
                        {project.description}
                      </p>
                      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies used">
                        {project.technologies.map((technology) => (
                          <li
                            key={technology}
                            className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-xs text-muted"
                          >
                            {technology}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-7 flex flex-wrap gap-4 text-sm">
                        {project.github && (
                          <a
                            href={project.github}
                            className="pointer-events-auto relative z-20 text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                          >
                            GitHub
                          </a>
                        )}
                        {project.demo && (
                          <a
                            href={project.demo}
                            className="pointer-events-auto relative z-20 text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                          >
                            Live demo
                          </a>
                        )}
                        {project.caseStudy && (
                          <Link
                            href={project.caseStudy}
                            className="pointer-events-auto relative z-20 text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                          >
                            Case study
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-surface px-6 py-16 text-center sm:px-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 font-mono text-accent">
                  00
                </div>
                <h3 className="mt-7 text-2xl font-semibold text-foreground">
                  Case studies are being prepared
                </h3>
                <p className="mx-auto mt-4 max-w-xl leading-7 text-muted">
                  Verified project details, visuals, and links will be added
                  here as they become available. For now, this category has no
                  published projects.
                </p>
                <p className="mt-5 font-mono text-xs tracking-wide text-accent">
                  {selectedCategory}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="rounded-2xl border border-primary/40 bg-surface px-6 py-12 text-center sm:px-12">
              <p className="font-mono text-xs tracking-[0.2em] text-accent">
                NEXT STEP
              </p>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Have a project in mind?
              </h2>
              <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
                Let&apos;s explore the problem and find a practical path to
                build something useful.
              </p>
              <Link
                href="/#contact"
                className="mt-8 inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Start a conversation <span className="ml-2" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <Link
              href="/#home"
              className="font-mono text-sm font-semibold tracking-[0.18em] text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              YOUR NAME<span className="text-accent">.</span>
            </Link>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.label === "Projects"
                      ? "text-sm text-accent focus-visible:outline-2 focus-visible:outline-accent"
                      : linkClass
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>Your Name. AI / BACKEND / SYSTEMS</span>
            <span>Projects are published as verified details become available.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
