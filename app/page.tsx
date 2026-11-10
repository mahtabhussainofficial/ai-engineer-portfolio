import Link from "next/link";

const projects = [
  {
    number: "01",
    slug: "intelligent-knowledge-assistant",
    title: "Intelligent Knowledge Assistant",
    description:
      "A retrieval-focused workspace for turning internal knowledge into clear, grounded answers.",
    technologies: ["Python", "FastAPI", "Machine Learning"],
  },
  {
    number: "02",
    slug: "workflow-automation-engine",
    title: "Workflow Automation Engine",
    description:
      "A modular foundation for orchestrating AI-powered tasks, integrations, and reliable backend workflows.",
    technologies: ["Python", "Docker", "PostgreSQL"],
  },
  {
    number: "03",
    slug: "model-operations-toolkit",
    title: "Model Operations Toolkit",
    description:
      "A practical toolkit for organizing model experiments, service boundaries, and production-ready APIs.",
    technologies: ["FastAPI", "Docker", "Machine Learning"],
  },
];

const services = [
  {
    number: "01",
    title: "Agentic AI & Workflow Automation",
    description:
      "Designing practical agent workflows that coordinate tools, decisions, and repeatable business processes.",
  },
  {
    number: "02",
    title: "Voice AI & Conversational Agents",
    description:
      "Building natural conversational experiences with clear handoffs, useful context, and reliable responses.",
  },
  {
    number: "03",
    title: "RAG Systems & Knowledge AI",
    description:
      "Connecting language models to trusted knowledge so teams can explore information with confidence.",
  },
  {
    number: "04",
    title: "Document Intelligence & ERP Integration",
    description:
      "Turning documents and operational data into structured workflows that connect with existing systems.",
  },
  {
    number: "05",
    title: "LLM Integration, Fine-Tuning & Prompt Engineering",
    description:
      "Shaping model behavior and integrating LLM capabilities into focused, maintainable product experiences.",
  },
  {
    number: "06",
    title: "Observability & LLM Evaluation",
    description:
      "Creating feedback loops and evaluation practices that make AI behavior easier to understand and improve.",
  },
  {
    number: "07",
    title: "Full-Stack AI Applications & Backend",
    description:
      "Developing dependable APIs and product foundations around intelligent features from first request to deployment.",
  },
  {
    number: "08",
    title: "Data, Databases & Integrations",
    description:
      "Designing clean data flows, persistence layers, and integrations that help systems work together.",
  },
];

const skillGroups = [
  { category: "Programming", skills: ["Python"] },
  { category: "Backend", skills: ["FastAPI", "REST APIs"] },
  { category: "AI / ML", skills: ["Machine Learning", "LLM Integration", "RAG"] },
  { category: "Database", skills: ["PostgreSQL"] },
  { category: "DevOps", skills: ["Docker", "Git", "GitHub"] },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "/contact" },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <header className="border-b border-white/10">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
        >
          <a
            href="#home"
            className="font-mono text-sm font-semibold tracking-[0.18em] text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            YOUR NAME<span className="text-accent">.</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              className="rounded-full border border-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Let&apos;s talk
            </a>
          </div>

          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-white/10 px-3 py-2 text-sm text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <span className="sr-only">Open navigation</span>
              <span aria-hidden="true" className="text-lg leading-none">
                ☰
              </span>
            </summary>
            <div className="absolute right-0 top-12 z-10 w-48 rounded-xl border border-white/10 bg-surface p-2 shadow-2xl">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </details>
        </nav>
      </header>

      <main>
        <section
          id="home"
          className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-32 lg:pt-28"
        >
          <div>
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-3 py-1.5 font-mono text-xs tracking-wide text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Available for select opportunities
            </p>
            <p className="mb-4 font-mono text-sm tracking-[0.2em] text-muted">
              HELLO, I&apos;M YOUR NAME
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
              Building intelligent systems that{" "}
              <span className="text-accent">work in the real world.</span>
            </h1>
            <h2 className="mt-7 text-xl font-medium text-foreground sm:text-2xl">
              AI Engineer &amp; Backend Developer
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg">
              I build AI-powered applications, intelligent systems, and scalable
              backend solutions with a focus on thoughtful architecture and
              useful outcomes.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#projects"
                className="rounded-full bg-primary px-6 py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Explore Projects
              </a>
              <a
                href="#contact"
                className="rounded-full border border-white/15 px-6 py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Contact Me <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div
            aria-label="Abstract system architecture visual"
            className="relative mx-auto aspect-square w-full max-w-md"
          >
            <div className="absolute inset-[12%] rounded-full border border-primary/30" />
            <div className="absolute inset-[25%] rounded-full border border-accent/25" />
            <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-accent/50 bg-surface shadow-[0_0_0_8px_rgba(56,189,248,0.04)]">
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <span className="font-mono text-xs text-accent">AI</span>
                <span className="h-px w-8 bg-accent/60" />
                <span className="font-mono text-[10px] tracking-widest text-muted">
                  SYSTEM
                </span>
              </div>
            </div>
            <span className="absolute left-[8%] top-1/2 h-2 w-2 rounded-full bg-primary shadow-[0_0_0_5px_rgba(37,99,235,0.15)]" />
            <span className="absolute right-[8%] top-[28%] h-2 w-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(56,189,248,0.12)]" />
            <span className="absolute bottom-[18%] right-[22%] h-2 w-2 rounded-full bg-primary shadow-[0_0_0_5px_rgba(37,99,235,0.15)]" />
            <span className="absolute left-[20%] top-[20%] font-mono text-[10px] tracking-widest text-muted/70">
              INPUT
            </span>
            <span className="absolute bottom-[18%] left-[12%] font-mono text-[10px] tracking-widest text-muted/70">
              OUTPUT
            </span>
            <div className="absolute left-[13%] right-[13%] top-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute bottom-[24%] left-[28%] h-px w-1/2 rotate-[-28deg] bg-accent/40" />
          </div>
        </section>

        <section id="about" className="border-t border-white/10">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-24">
            <p className="font-mono text-xs tracking-[0.2em] text-accent">
              A PRACTICAL APPROACH
            </p>
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                Thoughtful engineering for useful intelligence.
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted">
                I focus on building practical AI-powered applications,
                intelligent automation, and reliable backend systems. The
                approach is simple: understand the problem, design a clear
                technical foundation, and create software that remains useful
                beyond the initial prototype.
              </p>
            </div>
          </div>
        </section>

        <section id="services" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                WHAT I CAN HELP WITH
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Services for intelligent products
              </h2>
              <p className="mt-5 leading-7 text-muted">
                Focused engineering support across the AI application lifecycle,
                from early system design to dependable integrations.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <article
                  key={service.number}
                  className="group rounded-2xl border border-white/10 bg-surface p-5 transition-colors hover:border-primary/60"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 font-mono text-xs text-accent">
                      ✦
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {service.number}
                    </span>
                  </div>
                  <h3 className="mt-8 text-lg font-semibold leading-snug text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {service.description}
                  </p>
                  <a
                    href="/services"
                    className="mt-6 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    Explore service <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
            <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                  SELECTED WORK
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Project concepts
                </h2>
              </div>
              <p className="max-w-md leading-7 text-muted">
                Editable project placeholders exploring practical applications
                of AI and dependable backend engineering.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.number}
                  href={`/projects/${project.slug}`}
                  className="group flex min-h-80 flex-col rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-primary/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-accent">
                      / {project.number}
                    </span>
                    <span className="text-xl text-muted transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                      ↗
                    </span>
                  </div>
                  <h3 className="mt-16 text-xl font-semibold text-foreground">
                    {project.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted">
                    {project.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.technologies.map((technology) => (
                      <span
                        key={technology}
                        className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] text-muted"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 w-fit text-sm font-medium text-accent underline-offset-4 group-hover:underline">
                    View project details <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="border-t border-white/10">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
            <div>
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                CORE TOOLKIT
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Technical skills
              </h2>
              <p className="mt-5 max-w-md leading-7 text-muted">
                Editable examples of the languages, frameworks, and practices
                used across the engineering workflow.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {skillGroups.map((group) => (
                <div
                  key={group.category}
                  className="rounded-xl border border-white/10 bg-surface px-5 py-4"
                >
                  <h3 className="font-mono text-xs tracking-widest text-accent">
                    {group.category}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-sm text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="experience-heading"
          className="border-t border-white/10"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
            <div>
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                EXPERIENCE / WORK HISTORY
              </p>
              <h2
                id="experience-heading"
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                Verified work history will be added here.
              </h2>
            </div>
            <div className="rounded-2xl border border-dashed border-white/15 bg-surface p-6 sm:p-8">
              <p className="leading-8 text-muted">
                Professional employment and freelance platform history are kept
                separate and will be published when the relevant companies,
                roles, dates, clients, and outcomes are verified.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="rounded-2xl border border-primary/40 bg-surface px-6 py-12 text-center sm:px-12">
              <p className="font-mono text-xs tracking-[0.2em] text-accent">
                HAVE A PROJECT IN MIND?
              </p>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Let&apos;s build something intelligent.
              </h2>
              <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
                Open to discussing AI engineering, backend development, and
                thoughtfully designed technical solutions.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
                Email: editable contact placeholder. Social links will be
                published once the details are confirmed.
              </p>
              <a
                href="/contact"
                className="mt-8 inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Start a conversation <span className="ml-2" aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <a
              href="#home"
              className="font-mono text-sm font-semibold tracking-[0.18em] text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              YOUR NAME<span className="text-accent">.</span>
            </a>
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Your Name. All rights reserved.</span>
            <span className="font-mono">AI / BACKEND / SYSTEMS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
