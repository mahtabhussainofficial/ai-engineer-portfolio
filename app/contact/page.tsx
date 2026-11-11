import type { Metadata } from "next";
import Link from "next/link";
import { CONNECT_CHANNELS, SITE_PROFILE } from "../../lib/site-config";
import {
  ConnectIcon,
  SiteFooter,
  SiteHeader,
} from "../components/site-shell";
import { ContactInquiryPanel } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Shabnum H. about AI applications, workflow automation, or backend systems.",
};

export default function ContactPage() {
  const cvUrl = SITE_PROFILE.cvUrl;
  const directEmail = SITE_PROFILE.directEmail;

  return (
    <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
      <SiteHeader active="Contact" />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-4 pb-8 sm:gap-10 sm:px-6 sm:pt-6 lg:px-8"
      >
        {/* CENTERED INTRO */}
        <section className="pt-4 pb-2 text-center sm:pt-6">
          <span className="inline-flex items-center rounded-full border border-[#2b3a50] bg-[#172130]/90 px-4 py-1 font-mono text-[11px] tracking-[0.16em] text-accent">
            GET IN TOUCH
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2rem,4.8vw,3.9rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
            Let&apos;s talk ideas &amp;{" "}
            <span className="text-muted">projects</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            Open for AI engineering builds, intelligent workflow automation,
            and dependable backend architecture collaborations.
          </p>
        </section>

        {/* CV / RESUME BANNER */}
        <section className="section-frame rounded-2xl p-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2b3a50] bg-[#172130] text-accent">
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
                  <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                    Looking for Shabnum&apos;s Curriculum Vitae?
                  </h2>
                  <span className="rounded-md border border-[#2b3a50] bg-[#172130] px-2.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-accent">
                    {cvUrl ? "PDF READY" : "ON REQUEST"}
                  </span>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
                  Summary of AI systems engineering, backend experience, and
                  academic foundations. Ready to connect a direct PDF file via
                  the dashboard.
                </p>
              </div>
            </div>

            {cvUrl ? (
              <a
                href={cvUrl}
                download
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto"
              >
                <span>Download CV (PDF)</span>
                <span aria-hidden="true">↓</span>
              </a>
            ) : (
              <a
                href="#contact-form"
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:w-auto"
              >
                <span>Request CV</span>
                <span aria-hidden="true">↓</span>
              </a>
            )}
          </div>
        </section>

        {/* CHANNELS + FORM SPLIT */}
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          {/* Left: Channels */}
          <aside className="section-frame min-w-0 rounded-2xl p-5 sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">
              Contact Channels
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Reach out through the inquiry form or verified developer networks
              once published from the dashboard:
            </p>

            <div className="mt-6 space-y-3">
              {CONNECT_CHANNELS.map((channel) => {
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
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#2b3a50] bg-[#0b0f16] text-accent">
                      <ConnectIcon name={channel.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">
                        {channel.label}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {displayValue}
                      </span>
                    </span>
                    {resolvedHref ? (
                      <span
                        aria-hidden="true"
                        className="text-xs text-subtle transition-colors group-hover:text-accent"
                      >
                        ↗
                      </span>
                    ) : (
                      <span className="rounded border border-[#273549] bg-[#0b0f16]/80 px-2 py-0.5 font-mono text-[10px] text-subtle">
                        {channel.status ?? "soon"}
                      </span>
                    )}
                  </>
                );

                if (!resolvedHref) {
                  return (
                    <div
                      key={channel.id}
                      className="surface-card flex items-center gap-4 rounded-xl p-4"
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
                      className="surface-card surface-hover group flex items-center gap-4 rounded-xl p-4"
                    >
                      {innerContent}
                    </a>
                  );
                }

                return (
                  <Link
                    key={channel.id}
                    href={resolvedHref}
                    className="surface-card surface-hover group flex items-center gap-4 rounded-xl p-4"
                  >
                    {innerContent}
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Right: Interactive Form Panel */}
          <ContactInquiryPanel />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
