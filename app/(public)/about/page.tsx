import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ContactCtaSection,
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
} from "@/app/components/site-shell";
import {
  getPublicAboutProfile,
  getPublicApproachPrinciples,
  getPublicBackground,
} from "@/lib/public-api";
import portraitImage from "@/public/shabnum-portrait.jpg";

export const metadata: Metadata = {
  title: "About",
  description:
    "Professional biography, engineering approach, career journey, and academic foundations of Shabnum H., AI Engineer & Backend Developer.",
};

export default async function AboutPage() {
  const [aboutProfile, approachPrinciples, background] = await Promise.all([
    getPublicAboutProfile(),
    getPublicApproachPrinciples(),
    getPublicBackground(),
  ]);
  const careerJourney = background.experience;
  const educationEntries = background.education;
  const certificationEntries = background.certifications;

  return (
    <>
      {/* BIO HEADER - Open Canvas */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <div className="mx-auto w-full max-w-[18rem] lg:mx-0">
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#12141a] p-2">
                <Image
                  src={portraitImage}
                  alt={aboutProfile.portraitAlt}
                  sizes="(min-width: 1024px) 270px, 300px"
                  placeholder="blur"
                  className="aspect-square w-full rounded-xl object-cover object-top"
                  priority
                />
              </div>
              <p className="mt-3 text-center font-mono text-[11px] text-zinc-400 lg:text-left">
                {aboutProfile.portraitCaption}
              </p>
            </div>

            <div>
              <Eyebrow>{aboutProfile.eyebrow}</Eyebrow>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                {aboutProfile.headlinePrimary}
                <span className="mt-1 block text-zinc-400">
                  {aboutProfile.headlineSecondary}
                </span>
              </h1>

              <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-zinc-400">
                {aboutProfile.bioParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/contact" className={primaryButtonClass}>
                  <span>Get in touch</span>
                  <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/projects" className={sectionButtonClass}>
                  <span>View projects</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH PRINCIPLES */}
      <section className="section-divider py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>Philosophy</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Simple architecture, reliable outcomes.
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {approachPrinciples.map((item) => (
              <article
                key={item.id}
                className="dev-card rounded-xl p-6 sm:p-7"
              >
                <span className="font-mono text-xs font-semibold text-blue-400">
                  {item.number}
                </span>
                <h3 className="mt-3 text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CAREER TIMELINE & CREDENTIALS */}
      <section className="section-divider py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>Career Record</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Experience &amp; credentials.
            </h2>
          </div>

          {/* Connected timeline */}
          <div className="mt-8 divide-y divide-white/[0.06] rounded-xl border border-zinc-800 bg-[#111318]">
            {careerJourney.map((entry) => (
              <article
                key={entry.id}
                className="grid gap-3 p-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-8"
              >
                <p className="shrink-0 font-mono text-xs font-semibold text-blue-400">
                  {entry.period}
                </p>
                <div className="min-w-0">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-base font-bold text-white">
                      {entry.role}
                    </h3>
                    <span className="font-mono text-xs text-zinc-400">
                      {entry.organization}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {entry.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Education & Certifications */}
          <div className="mt-10 grid gap-8 border-t border-white/[0.06] pt-10 md:grid-cols-2">
            <div>
              <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Education
              </h3>
              <div className="space-y-3">
                {educationEntries.map((edu) => (
                  <div key={edu.id} className="dev-card rounded-xl p-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-bold text-white">
                        {edu.degree}
                      </h4>
                      <span className="shrink-0 font-mono text-xs text-zinc-400">
                        {edu.period}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Certifications
              </h3>
              <div className="space-y-3">
                {certificationEntries.map((cert) => (
                  <div
                    key={cert.id}
                    className="dev-card flex items-baseline justify-between gap-4 rounded-xl p-5"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-white">
                        {cert.title}
                      </h4>
                      <p className="mt-1 text-sm text-zinc-400">{cert.issuer}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-zinc-400">
                      {cert.year}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <ContactCtaSection
        eyebrow="Get In Touch"
        title="Have an engineering problem worth exploring?"
        description="Share what you are building. Let's find a practical architecture together."
        primaryLabel="Get in touch"
        primaryHref="/contact"
        secondaryLabel="View services"
        secondaryHref="/services"
      />
    </>
  );
}
