import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import portraitImage from "../../public/shabnum-portrait.jpg";
import {
  ContactCtaSection,
  Eyebrow,
  SiteFooter,
  SiteHeader,
} from "../components/site-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Professional biography, engineering approach, career journey, and academic foundations of Shabnum H., AI Engineer & Backend Developer.",
};

/* Structured constants below can be connected directly to a future portfolio dashboard/CMS. */

const bioParagraphs = [
  "I'm Shabnum H., an AI Engineer and Backend Developer focused on turning everyday operational bottlenecks into reliable software. My work connects applied AI—RAG pipelines, tool-using agents, and workflow automation—with clean Python services and dependable APIs.",
  "I care far more about production reliability than flashy demos: grounding answers in trusted business data, enforcing structured outputs, keeping humans in the loop for sensitive actions, and leaving codebases clear enough for teams to build on.",
] as const;

const approachPrinciples = [
  {
    number: "01",
    title: "Start with the problem",
    description:
      "Clarify workflows, edge cases, and data quality before choosing a model or framework.",
  },
  {
    number: "02",
    title: "Make AI predictable",
    description:
      "Rely on retrieval grounding, strict schemas, and testing loops rather than prompt guesswork.",
  },
  {
    number: "03",
    title: "Build clean foundations",
    description:
      "Pair AI logic with modular FastAPI services, clear database models, and observable behavior.",
  },
] as const;

const careerJourney = [
  {
    period: "2023 — Present",
    role: "AI Engineer & Backend Consultant",
    organization: "Independent Practice",
    summary:
      "Delivering custom LLM applications, RAG knowledge assistants, and automated business workflows integrated with client APIs.",
  },
  {
    period: "2021 — 2023",
    role: "Backend & AI Integration Developer",
    organization: "Product Studio (Placeholder)",
    summary:
      "Built Python REST services, document extraction pipelines, and PostgreSQL-backed platforms for internal operations.",
  },
  {
    period: "2019 — 2021",
    role: "Software & Automation Engineer",
    organization: "Engineering Team (Placeholder)",
    summary:
      "Developed automation scripts, data workflows, and reliable backend integrations across business tools.",
  },
] as const;

const educationEntries = [
  {
    period: "2015 — 2019",
    degree: "B.S. in Computer Science",
    institution: "University Name (Placeholder)",
  },
] as const;

const certificationEntries = [
  {
    year: "2024",
    title: "LLM Engineering & Agentic Workflows",
    issuer: "Certification Provider (Placeholder)",
  },
  {
    year: "2023",
    title: "Backend Architecture with Python & FastAPI",
    issuer: "Certification Provider (Placeholder)",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
      <SiteHeader active="About" />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8"
      >
        {/* PROFESSIONAL BIO */}
        <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
            <div className="mx-auto w-full max-w-[19rem] lg:mx-0">
              <div className="rounded-xl border border-[#233044] bg-[#0b0f16] p-2.5">
                <Image
                  src={portraitImage}
                  alt="Portrait of Shabnum H., AI Engineer and Backend Developer"
                  sizes="(min-width: 1024px) 284px, 304px"
                  placeholder="blur"
                  className="aspect-square w-full rounded-lg object-cover object-top"
                  priority
                />
              </div>
              <p className="mt-3 text-center font-mono text-[11px] tracking-[0.12em] text-subtle lg:text-left">
                SHABNUM H. · AI &amp; BACKEND
              </p>
            </div>

            <div>
              <Eyebrow>ABOUT / PROFESSIONAL BIO</Eyebrow>
              <h1 className="mt-4 max-w-3xl text-[clamp(1.95rem,4vw,3.35rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground">
                Practical AI engineering,
                <br />
                <span className="text-muted">built on solid backend craft.</span>
              </h1>

              <div className="mt-6 max-w-2xl space-y-4 text-base leading-7 text-muted sm:text-[17px] sm:leading-8">
                {bioParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span>Get in touch</span>
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130]/75 px-6 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  View projects
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 01 / ENGINEERING APPROACH */}
        <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div className="max-w-2xl">
            <Eyebrow>01 / ENGINEERING APPROACH</Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
              Simple architecture, reliable outcomes.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approachPrinciples.map((item, index) => (
              <article
                key={item.number}
                className={`surface-card surface-hover rounded-xl p-6 ${
                  index === 2 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <span className="font-mono text-xs text-accent">
                  {item.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* 02 / CAREER JOURNEY, EDUCATION & CERTIFICATIONS */}
        <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
          <div>
            <Eyebrow>02 / BACKGROUND</Eyebrow>
            <h2 className="mt-3 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
              Career journey &amp; credentials.
            </h2>
          </div>

          <div className="mt-8 divide-y divide-[#1e293b] rounded-xl border border-[#233044] bg-[#172130]/45">
            {careerJourney.map((entry) => (
              <article
                key={entry.role}
                className="grid gap-3 p-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8 sm:p-6"
              >
                <p className="font-mono text-xs text-accent">{entry.period}</p>
                <div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-base font-semibold text-foreground sm:text-lg">
                      {entry.role}
                    </h3>
                    <span className="text-sm text-subtle">
                      {entry.organization}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {entry.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-6 border-t border-[#1e293b] pt-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-mono text-xs tracking-[0.16em] text-accent">
                EDUCATION
              </h3>
              <div className="space-y-3">
                {educationEntries.map((edu) => (
                  <div key={edu.degree} className="surface-card rounded-xl p-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-semibold text-foreground">
                        {edu.degree}
                      </h4>
                      <span className="font-mono text-xs text-subtle">
                        {edu.period}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-mono text-xs tracking-[0.16em] text-accent">
                CERTIFICATIONS
              </h3>
              <div className="space-y-3">
                {certificationEntries.map((cert) => (
                  <div
                    key={cert.title}
                    className="surface-card flex items-baseline justify-between gap-4 rounded-xl p-5"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {cert.title}
                      </h4>
                      <p className="mt-1 text-sm text-muted">{cert.issuer}</p>
                    </div>
                    <span className="font-mono text-xs text-subtle">
                      {cert.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 03 / CONTACT CTA */}
        <ContactCtaSection
          eyebrow="03 / CONTACT"
          title="Have a problem worth exploring"
          description="Free consultation before starting. Share what you're working on, and let's find a practical path forward."
          primaryLabel="Get in touch"
          primaryHref="/contact"
          secondaryLabel="View services"
          secondaryHref="/services"
        />
      </main>

      <SiteFooter />
    </div>
  );
}
