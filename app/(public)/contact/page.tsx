import type { Metadata } from "next";
import { Eyebrow } from "@/app/components/site-shell";
import { getSiteProfile } from "@/lib/site-config";
import { ContactMessageForm } from "./contact-form";
import { DirectEmailCard } from "./email-card";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Shabnum H. about AI applications, workflow automation, or backend systems.",
};

const SOCIAL_LINKS = [
  { name: "GitHub", href: "https://github.com" },
  { name: "LinkedIn", href: "https://linkedin.com" },
  { name: "Upwork", href: "https://upwork.com" },
  { name: "X (Twitter)", href: "https://x.com" },
];

export default function ContactPage() {
  const siteProfile = getSiteProfile();
  const directEmail = siteProfile.directEmail || "shabnumhuma@gmail.com";

  return (
    <>
      {/* 01 / HERO - EXACT ORIGINAL TEXT */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Eyebrow>Direct Communication</Eyebrow>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Let&apos;s talk ideas &amp; projects.
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Available for production AI engineering builds, intelligent workflow
            automations, and high-reliability Python backend architectures.
          </p>
        </div>
      </section>

      {/* 02 / DIRECT EMAIL & CONNECT CHANNELS */}
      <section className="pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Direct Email Card with 1-click Copy */}
          <DirectEmailCard email={directEmail} />

          {/* Social Profiles Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-[#0c0d12] px-4 py-3.5 sm:px-6 sm:py-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Verified Profiles
            </span>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#07080b] px-4 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:border-[#c4f042]/50 hover:bg-[#c4f042]/10 hover:text-white"
                >
                  <span>{link.name}</span>
                  <span className="text-[10px] text-zinc-400">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 03 / FORM - MATCHING USER SCREENSHOT 1 */}
      <section className="pb-16 sm:pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ContactMessageForm />
        </div>
      </section>
    </>
  );
}
