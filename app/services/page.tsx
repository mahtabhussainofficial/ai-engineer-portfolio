const services = [
  {
    number: "01",
    title: "Agentic AI & Workflow Automation",
    description:
      "Designing AI agents that can reason through multi-step workflows, call tools, and coordinate repeatable business processes with clear boundaries.",
    details: ["AI agents", "Tool calling", "Multi-step workflows"],
  },
  {
    number: "02",
    title: "Voice AI & Conversational Agents",
    description:
      "Building conversational experiences that connect speech-to-text, text-to-speech, and language model capabilities into useful voice assistants.",
    details: ["Voice assistants", "Speech-to-text", "Text-to-speech"],
  },
  {
    number: "03",
    title: "RAG Systems & Knowledge AI",
    description:
      "Creating document-based question answering and knowledge assistants with retrieval systems, embeddings, and grounded context.",
    details: ["Question answering", "Retrieval systems", "Embeddings"],
  },
  {
    number: "04",
    title: "Document Intelligence & ERP Integration",
    description:
      "Turning unstructured documents into structured data through processing and OCR, then connecting the results with business systems.",
    details: ["Document processing", "OCR", "Structured extraction"],
  },
  {
    number: "05",
    title: "LLM Integration, Fine-Tuning & Prompt Engineering",
    description:
      "Integrating LLM APIs and shaping model behavior through prompt design, model adaptation, and application-specific AI workflows.",
    details: ["LLM APIs", "Prompt design", "Model adaptation"],
  },
  {
    number: "06",
    title: "Observability & LLM Evaluation",
    description:
      "Making AI systems easier to improve with output evaluation, tracing, monitoring, and reliability testing across the application lifecycle.",
    details: ["Output evaluation", "Tracing", "Reliability testing"],
  },
  {
    number: "07",
    title: "Full-Stack AI Applications & Backend",
    description:
      "Developing AI-powered web applications with Python backends, dependable APIs, and the integration layers that connect product experiences.",
    details: ["Web applications", "Python backends", "REST APIs"],
  },
  {
    number: "08",
    title: "Data, Databases & Integrations",
    description:
      "Designing practical data flows, database foundations, external API integrations, and application data management for connected systems.",
    details: ["Database design", "Data processing", "API integrations"],
  },
];

const technologyGroups = [
  { title: "AI frameworks and LLMs", items: ["Machine Learning", "LLM Integration"] },
  { title: "Backend and APIs", items: ["Python", "FastAPI", "REST APIs"] },
  { title: "Voice AI", items: ["Voice AI", "Conversational Agents"] },
  { title: "Vector databases and retrieval", items: ["RAG", "Embeddings", "PostgreSQL"] },
  { title: "Cloud and deployment", items: ["Docker", "Git", "GitHub"] },
  { title: "Data and integrations", items: ["PostgreSQL", "REST APIs", "Data Processing"] },
];

const processSteps = [
  {
    number: "01",
    title: "Understand the problem",
    description: "Clarify the goal, users, constraints, and data before choosing a technical direction.",
  },
  {
    number: "02",
    title: "Plan the solution",
    description: "Shape the system boundaries, workflow, and delivery path around the actual problem.",
  },
  {
    number: "03",
    title: "Build and integrate",
    description: "Implement the core experience and connect it to the APIs, data, and systems it needs.",
  },
  {
    number: "04",
    title: "Test and improve",
    description: "Evaluate behavior, strengthen reliability, and use feedback to guide the next iteration.",
  },
];

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

export default function ServicesPage() {
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
                aria-current={item.label === "Services" ? "page" : undefined}
                className={
                  item.label === "Services"
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
                  aria-current={item.label === "Services" ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 ${
                    item.label === "Services"
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
              SERVICES / AI ENGINEERING
            </p>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                AI Engineering <span className="text-accent">Services</span>
              </h1>
              <div>
                <p className="max-w-xl text-lg leading-8 text-muted">
                  Building AI-powered applications, intelligent automation, and
                  reliable backend systems around real product needs.
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

        <section aria-labelledby="services-heading">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                CAPABILITIES
              </p>
              <h2 id="services-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                From first idea to useful system
              </h2>
              <p className="mt-5 leading-7 text-muted">
                A focused set of services for designing, building, and improving
                intelligent software.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <article
                  key={service.number}
                  className="group rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-primary/60 sm:p-8"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 font-mono text-sm text-accent">
                      ✦
                    </span>
                    <span className="font-mono text-xs text-muted">
                      / {service.number}
                    </span>
                  </div>
                  <h3 className="mt-10 max-w-md text-2xl font-semibold leading-tight text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-4 max-w-xl leading-7 text-muted">
                    {service.description}
                  </p>
                  <ul className="mt-7 flex flex-wrap gap-2" aria-label={`${service.title} focus areas`}>
                    {service.details.map((detail) => (
                      <li
                        key={detail}
                        className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-muted"
                      >
                        {detail}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10" aria-labelledby="stack-heading">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-28">
            <div>
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                EDITABLE TOOLKIT
              </p>
              <h2 id="stack-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Technology stack
              </h2>
              <p className="mt-5 max-w-md leading-7 text-muted">
                A flexible set of technologies and concepts to adapt to the
                needs of each project.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {technologyGroups.map((group) => (
                <div key={group.title} className="rounded-xl border border-white/10 bg-surface px-5 py-5">
                  <h3 className="font-mono text-xs tracking-widest text-accent">
                    {group.title}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li key={item} className="rounded-full border border-white/10 px-2.5 py-1 text-sm text-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10" aria-labelledby="process-heading">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                HOW I WORK
              </p>
              <h2 id="process-heading" className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                A clear path forward
              </h2>
            </div>
            <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step) => (
                <li key={step.number} className="border-l border-accent/40 pl-5">
                  <span className="font-mono text-xs text-accent">{step.number}</span>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="contact" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="rounded-2xl border border-primary/40 bg-surface px-6 py-12 text-center sm:px-12">
              <p className="font-mono text-xs tracking-[0.2em] text-accent">
                NEXT STEP
              </p>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Have an AI project in mind?
              </h2>
              <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
                Let&apos;s explore the problem, the opportunity, and a practical
                path to build something useful.
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
                  className={item.label === "Services" ? "text-sm text-accent focus-visible:outline-2 focus-visible:outline-accent" : linkClass}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>© Your Name. All rights reserved.</span>
            <span className="font-mono">AI / BACKEND / SYSTEMS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
import Link from "next/link";
