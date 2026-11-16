import type { Metadata } from "next";
import Link from "next/link";
import { ConnectIcon, Eyebrow } from "@/app/components/site-shell";
import { getConnectChannels, getSiteProfile } from "@/lib/site-config";
import { ContactInquiryPanel } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Shabnum H. about AI applications, workflow automation, or backend systems.",
};

export default function ContactPage() {
  const siteProfile = getSiteProfile();
  const connectChannels = getConnectChannels();
  const cvUrl = siteProfile.cvUrl;
  const directEmail = siteProfile.directEmail;

  return (
    <>
      {/* INTRO - Open Canvas */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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

      {/* CV / RESUME BANNER */}
      <section className="section-divider py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="dev-card flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-blue-400">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-base font-bold text-white sm:text-lg">
                    Curriculum Vitae &amp; Credentials
                  </h2>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {cvUrl ? "PDF READY" : "ON REQUEST"}
                  </span>
                </div>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                  {cvUrl
                    ? "Full summary of AI architecture experience, backend systems track record, and credentials."
                    : "Detailed record of AI systems, backend engineering, and certifications. A PDF copy is available upon request."}
                </p>
              </div>
            </div>

            {cvUrl ? (
              <a
                href={cvUrl}
                download
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-200 sm:w-auto"
              >
                <span>Download CV</span>
                <span aria-hidden="true">↓</span>
              </a>
            ) : (
              <a
                href="#contact-form"
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] sm:w-auto"
              >
                <span>Request CV</span>
                <span aria-hidden="true">↓</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* CHANNELS + FORM SPLIT */}
      <section className="section-divider py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            {/* Left: Channels */}
            <aside className="min-w-0">
              <Eyebrow>Direct Channels</Eyebrow>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Get in touch.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Send a direct brief using the form or reach out through verified
                developer handles.
              </p>

              <div className="mt-6 space-y-3">
                {connectChannels.map((channel) => {
                  const displayValue =
                    channel.id === "email" && directEmail
                      ? directEmail
                      : channel.handlePlaceholder;

                  const resolvedHref =
                    channel.id === "email"
                      ? directEmail
                        ? `mailto:${directEmail}`
                        : "#contact-form"
                      : channel.href;

                  const innerContent = (
                    <>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-blue-400">
                        <ConnectIcon name={channel.icon} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-white">
                          {channel.label}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-xs text-zinc-400">
                          {displayValue}
                        </span>
                      </span>
                      {resolvedHref ? (
                        <span aria-hidden="true" className="text-xs text-zinc-400">
                          ↗
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-zinc-500">
                          {channel.status ?? "soon"}
                        </span>
                      )}
                    </>
                  );

                  if (!resolvedHref) {
                    return (
                      <div
                        key={channel.id}
                        className="dev-card flex items-center gap-3.5 rounded-xl p-4"
                      >
                        {innerContent}
                      </div>
                    );
                  }

                  if (
                    resolvedHref.startsWith("mailto:") ||
                    resolvedHref.startsWith("#") ||
                    channel.external
                  ) {
                    return (
                      <a
                        key={channel.id}
                        href={resolvedHref}
                        target={channel.external ? "_blank" : undefined}
                        rel={channel.external ? "noopener noreferrer" : undefined}
                        className="dev-card flex items-center gap-3.5 rounded-xl p-4"
                      >
                        {innerContent}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={channel.id}
                      href={resolvedHref}
                      className="dev-card flex items-center gap-3.5 rounded-xl p-4"
                    >
                      {innerContent}
                    </Link>
                  );
                })}
              </div>
            </aside>

            {/* Right: Form */}
            <ContactInquiryPanel />
          </div>
        </div>
      </section>
    </>
  );
}
