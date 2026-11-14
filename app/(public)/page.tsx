import Image from "next/image";
import Link from "next/link";
import {
  ContactCtaSection,
  Eyebrow,
  PreviewCardItem,
  PreviewSection,
  ProfileHighlights,
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
  ] = await Promise.all([
    getPublicHomeHero(),
    getPublicHomeAboutPreview(),
    getPublicProcessSteps(),
    getPublicTestimonials({ featured: true }),
    getPublicFeaturedServices(),
    getPublicFeaturedProjects(),
    getPublicFeaturedSkills(),
  ]);

  const featuredServices: readonly PreviewCardItem[] =
    featuredServicesList.map((service, index) => ({
      number: service.number || String(index + 1).padStart(2, "0"),
      category: service.homeCategoryLabel ?? service.domain,
      title: service.homeTitle ?? service.title,
      description: service.homeDescription ?? service.description,
      tags: service.homeTags ?? service.tools.slice(0, 3),
      href: "/services",
      linkLabel: "Explore services",
    }));

  const featuredProjects: readonly PreviewCardItem[] =
    featuredProjectsList.map((project) => ({
      number: project.number,
      category: project.homeCategoryLabel,
      title: project.title,
      description: project.summary,
      tags: project.tags,
      href: `/projects/${project.slug}`,
      linkLabel: "Open project brief",
    }));

  const featuredSkills: readonly PreviewCardItem[] = featuredSkillsList.map(
    (skill) => ({
      number: skill.number,
      category: skill.category,
      title: skill.title,
      description: skill.description,
      tags: skill.tags,
      href: skill.href,
      linkLabel: skill.linkLabel,
    }),
  );

  return (
    <>
      {/* HERO SECTION */}
      <section
        id="home"
        className="section-frame rounded-2xl p-6 sm:p-10 lg:px-14 lg:py-12"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-14">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-accent">
              {hero.eyebrow}
            </p>

            <h1 className="mt-5 max-w-3xl text-[clamp(2rem,5.1vw,4.35rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-foreground">
              {hero.headingPrimary}
              <br />
              <span className="text-muted">{hero.headingSecondary}</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
              {hero.summary}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#projects" className={primaryButtonClass}>
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

            <div className="mt-14 border-t border-[#1e293b] pt-5">
              <p className="mb-3 font-mono text-[10px] tracking-[0.16em] text-subtle">
                SPECIALIZATIONS
              </p>
              <div className="flex flex-wrap gap-2">
                {hero.specializations.map((item) => (
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
                alt={hero.portraitAlt}
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 400px, 92vw"
                placeholder="blur"
                className="aspect-square w-full rounded-lg object-cover object-top"
                preload
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
              <Eyebrow>{aboutPreview.eyebrow}</Eyebrow>
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
                {aboutPreview.sideNote}
              </p>
            </div>
            <div>
              <Link href={aboutPreview.ctaHref} className={sectionButtonClass}>
                <span>{aboutPreview.ctaLabel}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="border-t border-[#1e293b] pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
            <h2 className="text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
              {aboutPreview.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
              {aboutPreview.description}
            </p>
          </div>
        </div>

        <ProfileHighlights />
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
            Selected feedback from completed client engagements.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feedback.map((item, index) => (
            <article
              key={item.id}
              className={`surface-card surface-hover flex flex-col justify-between rounded-xl p-6 ${
                index === 2 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  aria-label="5 out of 5 stars"
                  className="text-xs tracking-wider text-accent"
                >
                  {item.stars}
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

      <ContactCtaSection
        eyebrow="07 / CONTACT"
        title="Let's build something useful"
        description="Free consultation before starting. Share the problem, and let's find a practical path forward."
        primaryLabel="Start a conversation"
        primaryHref="/contact"
        secondaryLabel="View services"
        secondaryHref="/services"
      />
    </>
  );
}
