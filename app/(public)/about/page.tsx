import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ContactCtaSection,
  Eyebrow,
  ProfileHighlights,
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
      {/* 01 / HERO & BIOGRAPHY - Perfectly aligned without image overflowing */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
            
            {/* Left Column: Portrait Card - Fitted and contained */}
            <div className="mx-auto w-full max-w-[19rem] lg:max-w-[20rem]">
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-[#0a0a0c]">
                <Image
                  src={portraitImage}
                  alt={aboutProfile.portraitAlt}
                  sizes="(min-width: 1024px) 320px, 300px"
                  placeholder="blur"
                  className="aspect-[4/5] w-full rounded-2xl object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Right Column: Bio Story & Actions */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>{aboutProfile.eyebrow}</Eyebrow>
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {aboutProfile.headlinePrimary}
                <span className="block mt-2 text-[#c4f042]">
                  {aboutProfile.headlineSecondary}
                </span>
              </h1>

              <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-400">
                {aboutProfile.bioParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/contact" className={primaryButtonClass}>
                  <span>Get in touch</span>
                  <span aria-hidden="true">→</span>
                </Link>
                <Link href="/projects" className={sectionButtonClass}>
                  <span>View case studies</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Core Metrics Highlight */}
          <ProfileHighlights
            title="Practical engineering impact."
          />
        </div>
      </section>

      {/* 02 / APPROACH & ENGINEERING PHILOSOPHY */}
      <section className="section-divider py-14 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
              <Eyebrow>Philosophy</Eyebrow>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Simple architecture, reliable outcomes.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Principles refined through hands-on system building—prioritizing determinism, maintainability, and actual business value over demo hype.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {approachPrinciples.map((item, index) => (
              <article
                key={item.id}
                className="dev-card group relative flex flex-col justify-between h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <span className="text-xs font-bold text-[#c4f042]">
                      0{index + 1}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]/40 group-hover:bg-[#c4f042] transition-colors" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white group-hover:text-[#c4f042] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 03 / CAREER JOURNEY */}
      <section className="section-divider py-14 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
              <Eyebrow>Trajectory</Eyebrow>
            </div>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Engineering track record.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Consistent focus on applied AI, structured data services, and reliable production backends.
            </p>
          </div>

          <div className="relative mt-10 border-l border-white/[0.08] pl-6 ml-3 space-y-8 sm:space-y-10">
            {careerJourney.map((entry) => (
              <div key={entry.id} className="relative group">
                <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-[#050507] transition-colors group-hover:border-[#c4f042]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                </span>

                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#c4f042] transition-colors">
                    {entry.role}
                  </h3>
                  <span className="text-xs font-semibold text-zinc-400">
                    {entry.period}
                  </span>
                </div>

                <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#c4f042]">
                  {entry.organization}
                </p>

                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400 max-w-3xl">
                  {entry.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 / EDUCATION & CERTIFICATIONS */}
      <section className="section-divider py-14 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:gap-14">
            
            {/* Education */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Academic Foundation</Eyebrow>
              </div>
              <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-white">
                Education
              </h2>

              <div className="mt-6 space-y-4">
                {educationEntries.map((edu) => (
                  <div
                    key={edu.id}
                    className="dev-card rounded-2xl p-5 sm:p-6 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-semibold text-white">
                        {edu.period}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-white">
                      {edu.degree}
                    </h3>
                    <p className="mt-1 text-xs text-[#c4f042] font-semibold">
                      {edu.institution}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                <Eyebrow>Verified Credentials</Eyebrow>
              </div>
              <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-white">
                Certifications
              </h2>

              <div className="mt-6 space-y-4">
                {certificationEntries.map((cert) => (
                  <div
                    key={cert.id}
                    className="dev-card rounded-2xl p-5 sm:p-6 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-semibold text-white">
                        {cert.year}
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]" />
                    </div>
                    <h3 className="mt-2 text-base font-bold text-white">
                      {cert.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Issued by {cert.issuer}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 05 / CTA SECTION */}
      <ContactCtaSection
        eyebrow="Collaboration"
        title="Ready to build practical AI systems?"
        description="Let's talk through your business bottlenecks, data sources, and architecture requirements."
        primaryLabel="Start a conversation"
        primaryHref="/contact"
        secondaryLabel="View services"
        secondaryHref="/services"
      />
    </>
  );
}
