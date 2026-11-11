import Image from "next/image";
import Link from "next/link";
import portraitImage from "../public/shabnum-portrait.jpg";
import { Eyebrow, SiteFooter, SiteHeader } from "./components/site-shell";

const heroSpecializations = [
  "Agentic AI",
  "RAG Systems",
  "Python & FastAPI",
  "Workflow Automation",
] as const;

const highlights = [
  {
    index: "01 / EXPERIENCE",
    value: "5+",
    label: "Years building production AI systems",
  },
  {
    index: "02 / PROJECTS",
    value: "7",
    label: "Completed freelance jobs",
  },
  {
    index: "03 / DELIVERY",
    value: "63",
    label: "Tracked hours of client work",
  },
  {
    index: "04 / RATING",
    value: "5.0",
    suffix: "★",
    label: "Client rating shown on profile",
  },
] as const;

interface PreviewCardItem {
  readonly number: string;
  readonly category: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly href: string;
  readonly linkLabel: string;
}

const featuredServices: readonly PreviewCardItem[] = [
  {
    number: "01",
    category: "AUTOMATION",
    title: "Agentic AI & Workflow Automation",
    description:
      "Multi-agent systems, tool calling, and approval flows that reduce repetitive business work.",
    tags: ["LangChain", "LangGraph", "CrewAI"],
    href: "/services",
    linkLabel: "Explore services",
  },
  {
    number: "02",
    category: "KNOWLEDGE AI",
    title: "RAG Systems & Knowledge AI",
    description:
      "Grounded AI assistants that turn business documents and databases into useful answers.",
    tags: ["Pinecone", "Weaviate", "Hybrid Search"],
    href: "/services",
    linkLabel: "Explore services",
  },
  {
    number: "03",
    category: "BACKEND",
    title: "Full-Stack AI & Backend Systems",
    description:
      "Production-minded AI web apps and APIs built with Python, FastAPI, and modern tooling.",
    tags: ["Python", "FastAPI", "Docker"],
    href: "/services",
    linkLabel: "Explore services",
  },
];

const featuredProjects: readonly PreviewCardItem[] = [
  {
    number: "01",
    category: "RAG / KNOWLEDGE AI",
    title: "Knowledge Assistant",
    description:
      "A RAG-based assistant architecture for answering questions from trusted business documents.",
    tags: ["Python", "FastAPI", "Vector Search"],
    href: "/projects/knowledge-assistant",
    linkLabel: "Open project brief",
  },
  {
    number: "02",
    category: "AGENTIC AI",
    title: "Workflow Automation",
    description:
      "Agentic workflow architecture connected to business tools, APIs, and human approval steps.",
    tags: ["AI Agents", "APIs", "Human Review"],
    href: "/projects/workflow-automation",
    linkLabel: "Open project brief",
  },
  {
    number: "03",
    category: "FULL-STACK AI",
    title: "AI Backend Platform",
    description:
      "A practical application combining AI capabilities, structured data, and a dependable backend foundation.",
    tags: ["Python", "PostgreSQL", "Docker"],
    href: "/projects/ai-backend-platform",
    linkLabel: "Open project brief",
  },
];

const featuredSkills: readonly PreviewCardItem[] = [
  {
    number: "01",
    category: "AI & LLMS",
    title: "AI & LLM Engineering",
    description:
      "Prompt architecture, retrieval-augmented generation, and model integration for grounded AI features.",
    tags: ["RAG", "LangChain", "OpenAI / Claude"],
    href: "/skills",
    linkLabel: "View full skill stack",
  },
  {
    number: "02",
    category: "AUTOMATION",
    title: "Automation & AI Agents",
    description:
      "Tool-using agents, workflow orchestration, and conversational automation tailored to operations.",
    tags: ["CrewAI", "OpenClaw", "Workflows"],
    href: "/skills",
    linkLabel: "View full skill stack",
  },
  {
    number: "03",
    category: "SYSTEMS",
    title: "Backend & Cloud Delivery",
    description:
      "Dependable Python services, structured persistence, and containerized environments ready for production.",
    tags: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    href: "/skills",
    linkLabel: "View full skill stack",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Understand the problem",
    description:
      "Clarify goals, users, constraints, and data before choosing a direction.",
  },
  {
    number: "02",
    title: "Plan the solution",
    description:
      "Shape system boundaries and delivery around the actual problem.",
  },
  {
    number: "03",
    title: "Build and integrate",
    description:
      "Implement the experience and connect the APIs, data, and systems it needs.",
  },
  {
    number: "04",
    title: "Test and improve",
    description:
      "Evaluate behavior, strengthen reliability, and use feedback to guide iteration.",
  },
] as const;

const feedback = [
  {
    title: "Senior AI Agent & LLM Developer",
    rating: "5.0",
    source: "Upwork profile feedback",
  },
  {
    title: "AI Consultant Needed to Build a Simple AI Agent",
    rating: "5.0",
    source: "Upwork profile feedback",
  },
  {
    title: "Client feedback",
    rating: "5 reviews",
    source: "Verified profile feedback",
  },
] as const;

const sectionButtonClass =
  "inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-[#2b3a50] bg-[#172130]/75 px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:self-auto";

const tagClass =
  "rounded-md border border-[#273549] bg-[#0b0f16]/85 px-2.5 py-1 font-mono text-[11px] text-muted";

function PreviewSection({
  id,
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  items,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  items: readonly PreviewCardItem[];
}) {
  return (
    <section
      id={id}
      className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
            {title}
          </h2>
          <p className="mt-3 text-base leading-7 text-muted">{description}</p>
        </div>
        <Link href={ctaHref} className={sectionButtonClass}>
          <span>{ctaLabel}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.number}
            className="surface-card surface-hover flex flex-col rounded-xl p-6"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#233044] pb-4">
              <span className="font-mono text-xs text-accent">
                {item.number}
              </span>
              <span className="font-mono text-[11px] tracking-[0.08em] text-subtle">
                {item.category}
              </span>
            </div>

            <h3 className="mt-6 text-xl font-semibold leading-snug text-foreground">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              {item.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className={tagClass}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto border-t border-[#233044] pt-4">
              <Link
                href={item.href}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground"
              >
                <span>{item.linkLabel}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
      <SiteHeader active="Home" />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8">
        {/* HERO SECTION */}
        <section
          id="home"
          className="section-frame rounded-2xl p-6 sm:p-10 lg:p-14"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
            <div>
              <p className="font-mono text-xs tracking-[0.18em] text-accent">
                HELLO, I&apos;M SHABNUM H.
              </p>

              <h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,5.1vw,4.35rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-foreground">
                AI Engineer &amp;
                <br />
                <span className="text-muted">Backend Developer.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                I build AI systems that automate workflows, analyze business data,
                and turn complex ideas into reliable products that create
                measurable value.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span>View Projects</span>
                  <span aria-hidden="true">↗</span>
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130]/75 px-6 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  Contact Me
                </Link>
              </div>

              <div className="mt-10 border-t border-[#1e293b] pt-5">
                <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-subtle">
                  SPECIALIZATIONS
                </p>
                <div className="flex flex-wrap gap-2">
                  {heroSpecializations.map((item) => (
                    <span key={item} className={tagClass}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Clean portrait frame */}
            <div className="mx-auto w-full max-w-[25rem] lg:justify-self-end">
              <div className="rounded-xl border border-[#233044] bg-[#0b0f16] p-2.5">
                <Image
                  src={portraitImage}
                  alt="Portrait of Shabnum H., AI Engineer and Backend Developer"
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 400px, 92vw"
                  placeholder="blur"
                  className="aspect-square w-full rounded-lg object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* 01 / ABOUT PREVIEW + AT A GLANCE */}
        <section
          id="about"
          className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
            <div className="flex flex-col justify-between gap-6">
              <div>
                <Eyebrow>01 / ABOUT SHABNUM</Eyebrow>
                <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
                  AI Engineer ready to transform business operations through
                  thoughtful automation.
                </p>
              </div>
              <div>
                <Link href="/about" className={sectionButtonClass}>
                  <span>Read more about me</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="border-t border-[#1e293b] pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
              <h2 className="text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
                I build systems that move businesses forward.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                With 5+ years of experience in production AI systems, I help teams
                automate workflows, unlock insights, and deliver AI applications
                that are useful beyond the demo.
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-[#1e293b] pt-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow>AT A GLANCE</Eyebrow>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
                  Built for practical progress.
                </h3>
              </div>
              <p className="max-w-sm text-xs leading-5 text-subtle sm:text-right">
                A few profile highlights from Shabnum&apos;s current professional
                record.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => (
                <div
                  key={item.index}
                  className="surface-card surface-hover rounded-xl p-5"
                >
                  <span className="font-mono text-[10px] tracking-[0.16em] text-accent">
                    {item.index}
                  </span>
                  <strong className="mt-5 block text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                    {item.value}
                    {"suffix" in item && item.suffix ? (
                      <span className="ml-1 text-lg text-accent">
                        {item.suffix}
                      </span>
                    ) : null}
                  </strong>
                  <span className="mt-2 block text-sm leading-5 text-muted">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PreviewSection
          id="services"
          eyebrow="02 / SERVICES"
          title="Capabilities for useful products."
          description="Core areas of AI engineering and backend architecture. Explore all eight capabilities on the Services page."
          ctaLabel="View all services"
          ctaHref="/services"
          items={featuredServices}
        />

        <PreviewSection
          id="projects"
          eyebrow="03 / PROJECTS"
          title="Selected work directions."
          description="Representative AI and backend architectures showing the types of systems this portfolio presents."
          ctaLabel="View all projects"
          ctaHref="/projects"
          items={featuredProjects}
        />

        <PreviewSection
          id="skills"
          eyebrow="04 / SKILLS"
          title="The tools behind the work."
          description="A concise preview of core technologies. Visit the Skills page for the complete seven-group capability map."
          ctaLabel="Explore all skills"
          ctaHref="/skills"
          items={featuredSkills}
        />

        {/* 05 / HOW I WORK (ENGINEERING PROCESS) */}
        <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>05 / PROCESS</Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
                A clear path from question to system.
              </h2>
            </div>
            <p className="text-sm text-subtle">
              Structured engineering from discovery to iteration.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="surface-card rounded-xl p-5 sm:p-6"
              >
                <span className="font-mono text-xs text-accent">
                  {step.number}
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 06 / CLIENT FEEDBACK */}
        <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>06 / CLIENT FEEDBACK</Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
                Trusted for thoughtful delivery.
              </h2>
            </div>
            <p className="text-sm text-subtle">
              Feedback shown from the supplied Upwork profile.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {feedback.map((item) => (
              <article
                key={item.title}
                className="surface-card surface-hover flex flex-col justify-between rounded-xl p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs tracking-wider text-accent">
                    ★★★★★
                  </span>
                  <span className={tagClass}>{item.rating}</span>
                </div>
                <div className="mt-7">
                  <h3 className="text-base font-medium leading-snug text-foreground sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-subtle">{item.source}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 07 / CONTACT CTA */}
        <section
          id="contact"
          className="section-frame rounded-2xl border-[#2b3c54] p-7 sm:p-10 lg:p-14"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-14">
            <div>
              <Eyebrow>07 / CONTACT</Eyebrow>
              <h2 className="mt-3 max-w-3xl text-[clamp(2rem,4.5vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
                Let&apos;s build something useful
                <span className="text-accent">.</span>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Free consultation before starting. Share the problem, and
                let&apos;s find a practical path forward.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <span>Start a conversation</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130]/75 px-5 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent"
              >
                View services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
