import Link from "next/link";
import { Suspense } from "react";

type ProjectCaseStudy = {
  slug: string;
  title: string;
  introduction: string;
  overview: string;
  challenge: string;
  solution: string;
  features: string[];
  technologies: string[];
  architecture: string;
  learnings: string[];
};

// TODO: Add verified project case studies here before publishing project details.
const projectCaseStudies: ProjectCaseStudy[] = [];

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

function SiteHeader() {
  return (
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
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <Link
            href="/#home"
            className="font-mono text-sm font-semibold tracking-[0.18em] text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            YOUR NAME<span className="text-accent">.</span>
          </Link>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Your Name. AI / BACKEND / SYSTEMS</span>
          <span>Case studies are published as verified details become available.</span>
        </div>
      </div>
    </footer>
  );
}

function EmptyCaseStudy({ slug }: { slug: string }) {
  return (
    <main>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-16">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
              <li>
                <Link
                  href="/#home"
                  className="hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-accent">
                /
              </li>
              <li>
                <Link
                  href="/projects"
                  className="hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Projects
                </Link>
              </li>
              <li aria-hidden="true" className="text-accent">
                /
              </li>
              <li aria-current="page" className="text-foreground">
                Project
              </li>
            </ol>
          </nav>
          <p className="mb-5 font-mono text-xs tracking-[0.2em] text-accent">
            PROJECT / CASE STUDY
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
            Case study <span className="text-accent">in preparation</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
            Verified project details for this case study are not available yet.
            The page is ready for an evidence-based project overview,
            implementation notes, and technical learnings when the content is
            confirmed.
          </p>
          <p className="mt-5 font-mono text-xs tracking-wide text-muted">
            REQUESTED SLUG: {slug}
          </p>
        </div>
      </section>

      <section aria-labelledby="preparation-heading">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-dashed border-white/15 bg-surface p-6 sm:p-8">
              <span className="font-mono text-xs text-accent">00 / CONTENT</span>
              <h2
                id="preparation-heading"
                className="mt-7 text-2xl font-semibold text-foreground"
              >
                Details are being prepared
              </h2>
              <p className="mt-4 leading-7 text-muted">
                Project overview, challenge, solution, features, architecture,
                and learnings will appear here once they can be documented from
                verified source material.
              </p>
            </article>
            <article className="rounded-2xl border border-dashed border-white/15 bg-surface p-6 sm:p-8">
              <span className="font-mono text-xs text-accent">00 / LINKS</span>
              <h2 className="mt-7 text-2xl font-semibold text-foreground">
                No project links published
              </h2>
              <p className="mt-4 leading-7 text-muted">
                GitHub, live demo, and case-study links will only be added when
                the corresponding project and route are verified.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="rounded-2xl border border-primary/40 bg-surface px-6 py-12 text-center sm:px-12">
            <p className="font-mono text-xs tracking-[0.2em] text-accent">
              NEXT STEP
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Have an AI project in mind?
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
              Let&apos;s explore the problem and find a practical path to build
              something useful.
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
  );
}

function CaseStudy({ project }: { project: ProjectCaseStudy }) {
  return (
    <main>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
          <nav aria-label="Breadcrumb" className="mb-16">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
              <li><Link href="/#home" className="hover:text-foreground">Home</Link></li>
              <li aria-hidden="true" className="text-accent">/</li>
              <li><Link href="/projects" className="hover:text-foreground">Projects</Link></li>
              <li aria-hidden="true" className="text-accent">/</li>
              <li aria-current="page" className="text-foreground">{project.title}</li>
            </ol>
          </nav>
          <p className="mb-5 font-mono text-xs tracking-[0.2em] text-accent">PROJECT / CASE STUDY</p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
            {project.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">{project.introduction}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Project overview</h2>
            <p className="mt-4 leading-7 text-muted">{project.overview}</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Problem / challenge</h2>
            <p className="mt-4 leading-7 text-muted">{project.challenge}</p>
          </article>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-foreground">Solution and implementation</h2>
            <p className="mt-4 leading-7 text-muted">{project.solution}</p>
            <h3 className="mt-8 font-mono text-xs tracking-widest text-accent">KEY FEATURES</h3>
            <ul className="mt-4 space-y-3 text-muted">
              {project.features.map((feature) => <li key={feature}>— {feature}</li>)}
            </ul>
          </article>
          <div className="space-y-5">
            <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground">Technology stack</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.technologies.map((technology) => (
                  <li key={technology} className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-muted">{technology}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-foreground">Architecture / workflow</h2>
              <p className="mt-4 leading-7 text-muted">{project.architecture}</p>
            </article>
          </div>
        </div>
        <article className="mt-5 rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Key learnings</h2>
          <ul className="mt-5 grid gap-3 text-muted md:grid-cols-2">
            {project.learnings.map((learning) => <li key={learning}>— {learning}</li>)}
          </ul>
        </article>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="rounded-2xl border border-primary/40 bg-surface px-6 py-12 text-center sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Have an AI project in mind?</h2>
            <Link href="/#contact" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              Start a conversation <span className="ml-2" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

async function ProjectCaseStudyContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectCaseStudies.find((item) => item.slug === slug);

  return project ? <CaseStudy project={project} /> : <EmptyCaseStudy slug={slug} />;
}

function CaseStudyFallback() {
  return (
    <main>
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
          <p className="font-mono text-xs tracking-[0.2em] text-accent">
            PROJECT / CASE STUDY
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
            Loading case study
          </h1>
        </div>
      </section>
    </main>
  );
}

export default function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />
      <Suspense fallback={<CaseStudyFallback />}>
        <ProjectCaseStudyContent params={params} />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
