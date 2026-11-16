import Image from "next/image";
import Link from "next/link";
import {
  ContactCtaSection,
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
  tagClass,
} from "@/app/components/site-shell";
import {
  getPublicFeaturedProjects,
  getPublicFeaturedServices,
  getPublicFeaturedSkills,
  getPublicHomeAboutPreview,
  getPublicHomeHero,
  getPublicProcessSteps,
  getPublicProfileHighlights,
  getPublicTestimonials,
} from "@/lib/public-api";
import portraitImage from "@/public/shabnum-portrait.jpg";

export default async function Home() {
  const [
    hero,
    aboutPreview,
    processSteps,
    feedback,
    featuredServicesList,
    featuredProjectsList,
    featuredSkillsList,
    profileHighlights,
  ] = await Promise.all([
    getPublicHomeHero(),
    getPublicHomeAboutPreview(),
    getPublicProcessSteps(),
    getPublicTestimonials({ featured: true }),
    getPublicFeaturedServices(),
    getPublicFeaturedProjects(),
    getPublicFeaturedSkills(),
    getPublicProfileHighlights(),
  ]);

  return (
    <>
      {/* HERO SECTION - Inspired by Muhammad Umar Two-Tone Black & Lime Aesthetic */}
      <section id="home" className="relative pt-2 pb-10 sm:pt-4 sm:pb-14 lg:pt-6 lg:pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
            
            {/* Left Column: Typography & CTAs */}
            <div>
              {/* Giant Name: Solid Line 1 + Outlined Line 2 */}
              <div className="flex flex-col">
                <span className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl leading-[0.92]">
                  Shabnum
                </span>
                <span className="text-stroke text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl leading-[0.92] mt-1 sm:mt-2">
                  Huma
                </span>
              </div>

              {/* Subtitle in Vibrant Lime Green */}
              <h2 className="mt-5 text-xl font-bold tracking-tight text-[#c4f042] sm:text-2xl lg:text-3xl">
                AI Engineer &amp; Backend Developer
              </h2>

              {/* Clean Summary Description */}
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base sm:leading-7">
                {hero.summary}
              </p>

              {/* Action Buttons: Lime Green Primary + Transparent Outline Secondary */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c4f042] px-7 py-3.5 text-sm font-bold text-zinc-950 transition-all duration-150 hover:bg-[#b2e232] hover:scale-[1.02]"
                >
                  <span>View My Work</span>
                  <span aria-hidden="true">→</span>
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-transparent px-7 py-3.5 text-sm font-medium text-white transition-all duration-150 hover:border-zinc-400 hover:bg-white/[0.04]"
                >
                  <span>Work With Me</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Portrait Seamlessly on Dark Canvas */}
            <div className="mx-auto w-full max-w-[20rem] lg:max-w-[22rem] lg:justify-self-end">
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-[#0a0a0c]">
                <Image
                  src={portraitImage}
                  alt={hero.portraitAlt}
                  sizes="(min-width: 1024px) 350px, 320px"
                  placeholder="blur"
                  className="aspect-[4/5] w-full rounded-2xl object-cover object-top"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT SECTION - 2 Column Layout with Stats on the Right */}
      <section id="about" className="section-divider py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            
            {/* Left Column: Story, Title, Button */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>About Shabnum Huma</Eyebrow>
              </div>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
                {aboutPreview.title}
              </h2>

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-400">
                {aboutPreview.description}
              </p>

              <div className="mt-8">
                <Link
                  href={aboutPreview.ctaHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c4f042] px-7 py-3.5 text-sm font-bold text-zinc-950 transition-all duration-150 hover:bg-[#b2e232] hover:scale-[1.02]"
                >
                  <span>{aboutPreview.ctaLabel}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Right Column: 2x2 Grid of the 4 Stat Numbers */}
            <div className="grid grid-cols-2 gap-4">
              {profileHighlights.map((item) => {
                const cleanCategory = item.index.replace(/^\d+\s*\/\s*/, "");
                return (
                  <div
                    key={item.id}
                    className="dev-card group relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-[#c4f042] uppercase">
                        {cleanCategory}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]/60 group-hover:bg-[#c4f042] transition-colors" />
                    </div>

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                        {item.value}
                      </span>
                      {item.suffix ? (
                        <span className="text-xl sm:text-2xl font-bold text-[#c4f042]">
                          {item.suffix}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-xs font-medium leading-relaxed text-zinc-400">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 01 / SERVICES SECTION - Refined Developer Services */}
      <section id="services" className="section-divider py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Capabilities</Eyebrow>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Services &amp; Solutions.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Specialized AI engineering, autonomous agentic workflows, and robust Python backend systems built for production scale.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-transparent px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:border-zinc-400 hover:bg-white/[0.04] w-fit"
            >
              <span>All services</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServicesList.map((service, index) => {
              const displayNum = `0${index + 1}`;
              const displayDomain = service.homeCategoryLabel || service.domain;
              const displayDesc = service.homeDescription || service.description;
              const displayTools = service.homeTags && service.homeTags.length > 0 ? service.homeTags : service.tools.slice(0, 4);

              return (
                <div
                  key={service.id}
                  className="dev-card group relative flex flex-col justify-between h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
                >
                  {/* Top Content */}
                  <div>
                    {/* Unified Top Line (01 · NAME + Green Dot) */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                      <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                        {displayNum} · {displayDomain}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
                    </div>

                    <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-zinc-400 min-h-[3rem]">
                      {displayDesc}
                    </p>
                  </div>

                  {/* Bottom: Perfectly Aligned Tooling with Unified Hover Effect */}
                  <div className="mt-8 border-t border-white/[0.06] pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                      Core Tooling
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {displayTools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/5 hover:text-white"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 pt-2">
                      <Link
                        href="/services"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 group-hover:text-[#c4f042] transition-colors"
                      >
                        <span>Explore service details</span>
                        <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 02 / PROJECTS SECTION - Authentic Human Developer Case Studies */}
      <section id="projects" className="section-divider py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Featured Work</Eyebrow>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Recent Projects.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Production-grade AI architectures, RAG pipelines, and scalable Python backends engineered for business impact.
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-transparent px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:border-zinc-400 hover:bg-white/[0.04] w-fit"
            >
              <span>All projects</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featuredProjectsList.map((project, index) => {
              const displayNum = `0${index + 1}`;
              const displayCategory = project.homeCategoryLabel || project.category;

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

                    {/* Key Deliverables */}
                    {project.deliverables && project.deliverables.length > 0 ? (
                      <div className="mt-5 space-y-2">
                        {project.deliverables.slice(0, 2).map((item) => (
                          <div key={item} className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
                            <span className="text-[#c4f042] font-bold">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Bottom: Tags & Action with Unified Hover Effect */}
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
        </div>
      </section>

      {/* 03 / SKILLS SECTION - Clean Developer Capability Arsenal */}
      <section id="skills" className="section-divider py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Tooling &amp; Stack</Eyebrow>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Technical Arsenal.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Battle-tested frameworks, production AI libraries, and cloud infrastructure used to construct resilient enterprise software.
              </p>
            </div>
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-transparent px-6 py-3 text-sm font-medium text-white transition-all duration-150 hover:border-zinc-400 hover:bg-white/[0.04] w-fit"
            >
              <span>View full stack</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* 3 Specialized Pillars of Technical Expertise */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            
            {/* Pillar 1: AI & LLM Systems */}
            <div className="dev-card group relative flex flex-col h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50">
              <div className="h-[150px]">
                {/* Unified Top Line (01 · NAME + Green Dot) */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                    01 · AI &amp; Intelligence
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
                </div>

                <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                  Intelligent Systems
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                  Retrieval architectures, autonomous agents, and grounded multi-model pipelines.
                </p>
              </div>

              {/* Bottom: Strictly Aligned Tooling with Unified Hover Effect */}
              <div className="border-t border-white/[0.06] pt-5 mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Core Tooling
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "LangChain",
                    "LangGraph",
                    "CrewAI",
                    "RAG Pipelines",
                    "OpenAI API",
                    "Claude API",
                    "ChromaDB",
                    "Pinecone",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/5 hover:text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 2: Backend Engineering */}
            <div className="dev-card group relative flex flex-col h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50">
              <div className="h-[150px]">
                {/* Unified Top Line (01 · NAME + Green Dot) */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                    02 · Backend &amp; Persistence
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
                </div>

                <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                  APIs &amp; Architecture
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                  High-uptime asynchronous APIs, typed schemas, and reliable database architectures.
                </p>
              </div>

              {/* Bottom: Strictly Aligned Tooling with Unified Hover Effect */}
              <div className="border-t border-white/[0.06] pt-5 mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Core Tooling
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Python",
                    "FastAPI",
                    "PostgreSQL",
                    "Redis",
                    "Pydantic",
                    "REST APIs",
                    "SQLAlchemy",
                    "Celery",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/5 hover:text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar 3: Infrastructure & DevOps */}
            <div className="dev-card group relative flex flex-col h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50">
              <div className="h-[150px]">
                {/* Unified Top Line (01 · NAME + Green Dot) */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                    03 · DevOps &amp; Delivery
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
                </div>

                <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                  Cloud &amp; Runtime
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                  Reproducible containers, CI/CD pipelines, and robust Linux runtime environments.
                </p>
              </div>

              {/* Bottom: Strictly Aligned Tooling with Unified Hover Effect */}
              <div className="border-t border-white/[0.06] pt-5 mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                  Core Tooling
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Docker",
                    "Docker Compose",
                    "Linux / Bash",
                    "Git / GitHub",
                    "CI/CD Pipelines",
                    "AWS / Cloud",
                    "Pytest",
                    "Microservices",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/5 hover:text-white"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 04 / ENGINEERING PROCESS - Connected Pipeline */}
      <section id="process" className="section-divider py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Workflow</Eyebrow>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                How I build systems.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                A disciplined engineering methodology that guarantees reliable architectures, fast iterations, and dependable production delivery.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => {
              const phases = [
                "Discovery & Scoping",
                "System Architecture",
                "Build & Integration",
                "Testing & Launch",
              ];
              const phaseName = phases[index] || `Phase ${step.number}`;

              return (
                <div
                  key={step.number}
                  className="dev-card group relative flex flex-col justify-between h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
                >
                  <div>
                    {/* Top Step Indicator & Connector */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                      <span className="text-2xl font-black tracking-tight text-[#c4f042]">
                        {step.number}
                      </span>
                      <span className="text-xs font-semibold text-zinc-500 group-hover:text-[#c4f042] transition-colors">
                        Step 0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-white/[0.06] pt-4">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-zinc-400 group-hover:border-[#c4f042]/30 group-hover:text-zinc-200 transition-colors">
                      {phaseName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 05 / CLIENT FEEDBACK - High-Trust Testimonials */}
      <section id="feedback" className="section-divider py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Client Reviews</Eyebrow>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Proven Track Record.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
                Direct client feedback from production AI implementations and backend infrastructure contracts.
              </p>
            </div>
            
            {/* 5.0 Star Verified Rating Pill */}
            <div className="inline-flex items-center gap-3 rounded-full border border-[#c4f042]/20 bg-[#c4f042]/5 px-4 py-2 w-fit">
              <div className="flex text-xs text-[#c4f042]">
                ★★★★★
              </div>
              <span className="text-xs font-bold text-white">
                5.0 Rating
              </span>
              <span className="text-[11px] text-zinc-400">
                · 100% Job Success
              </span>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {feedback.map((item) => (
              <article
                key={item.id}
                className="dev-card group relative flex flex-col justify-between h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                    <span className="text-sm tracking-wider text-[#c4f042]">
                      ★★★★★
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                      {item.rating}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-base font-semibold leading-relaxed text-zinc-100 group-hover:text-[#c4f042] transition-colors">
                      &ldquo;{item.title}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/[0.06] pt-4 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[#c4f042]">✓</span>
                    <span>{item.source}</span>
                  </span>
                  <span className="font-semibold text-zinc-500 text-[11px]">
                    Verified
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 06 / CONTACT CTA */}
      <ContactCtaSection
        eyebrow="Get In Touch"
        title="Let's build something reliable together."
        description="Share your workflow challenge, enterprise RAG pipeline requirements, or backend architecture scope. Let's find an elegant, practical path forward."
        primaryLabel="Start a conversation"
        primaryHref="/contact"
        secondaryLabel="Explore services"
        secondaryHref="/services"
      />
    </>
  );
}
