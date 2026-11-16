import Link from "next/link";
import {
  PROFILE_HIGHLIGHTS_META,
  getConnectChannels,
  getProfileHighlights,
  getSiteProfile,
  type SocialIconName,
} from "@/lib/site-config";
import { SiteNavbar } from "./site-navbar";

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/skills" },
  { label: "Contact", href: "/contact" },
];

export const mutedLink =
  "text-sm text-zinc-400 transition-colors duration-150 hover:text-[#c4f042] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4f042]";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#c4f042] px-7 py-3 text-sm font-bold text-zinc-950 transition-all duration-150 hover:bg-[#b2e232] hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4f042]";

export const sectionButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-transparent px-7 py-3 text-sm font-medium text-white transition-all duration-150 hover:border-zinc-400 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export const tagClass =
  "inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-[#c4f042]/50 hover:text-white";

export function SiteHeader({ active }: { active?: string }) {
  const siteProfile = getSiteProfile();

  return (
    <SiteNavbar
      items={navigation}
      brandName={siteProfile.brandName}
      active={active}
    />
  );
}

export function ConnectIcon({
  name,
  className = "h-4 w-4 shrink-0",
}: {
  name: SocialIconName;
  className?: string;
}) {
  if (name === "mail") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 0 0-4 0" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 19c-4.5 1.5-4.5-2.5-6-3m12 6v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
      </svg>
    );
  }

  if (name === "twitter") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function SiteFooter() {
  const siteProfile = getSiteProfile();

  const navColumn1 = [
    { label: "Projects", href: "/projects" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
  ];

  const navColumn2 = [
    { label: "Skills", href: "/skills" },
    { label: "Process", href: "/#process" },
    { label: "Contact", href: "/contact" },
  ];

  const socialIcons = [
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com",
      icon: "github" as const,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://linkedin.com",
      icon: "linkedin" as const,
    },
    {
      id: "upwork",
      label: "Upwork",
      href: "https://upwork.com",
      icon: "briefcase" as const,
    },
    {
      id: "twitter",
      label: "X (Twitter)",
      href: "https://x.com",
      icon: "twitter" as const,
    },
    {
      id: "mail",
      label: "Email",
      href: siteProfile.directEmail ? `mailto:${siteProfile.directEmail}` : "/contact",
      icon: "mail" as const,
    },
  ];

  const emailDisplay = siteProfile.directEmail || "shabnumhuma@gmail.com";

  return (
    <footer className="mt-20 border-t border-white/[0.08] bg-[#050507] pt-8 pb-12 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top: Massive Stroked Watermark Brand Title (CodeByUmar style - Fully visible & responsive) */}
        <div className="w-full select-none pointer-events-none pb-8 sm:pb-12 pt-2">
          <svg
            viewBox="0 0 960 110"
            className="w-full h-auto max-h-[140px]"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="50%"
              y="55%"
              dominantBaseline="central"
              textAnchor="middle"
              fill="none"
              stroke="rgba(255, 255, 255, 0.18)"
              strokeWidth="1.3"
              className="font-extrabold text-[82px] tracking-tight"
              style={{ fontFamily: "inherit" }}
            >
              Shabnum Huma
            </text>
          </svg>
        </div>

        {/* Middle: Content Grid (Brand Bio, Nav Columns, Social Icons) */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:gap-8 items-start">
          {/* Brand Bio */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Shabnum Huma
            </h3>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-xs">
              Shabnum Huma. AI Engineer &amp; Backend Developer in Pakistan.
            </p>
            <a
              href={`mailto:${emailDisplay}`}
              className="mt-2.5 inline-block text-sm text-zinc-400 hover:text-[#c4f042] transition-colors"
            >
              {emailDisplay}
            </a>
          </div>

          {/* Navigation Column 1 */}
          <div>
            <ul className="space-y-2.5">
              {navColumn1.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div>
            <ul className="space-y-2.5">
              {navColumn2.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Icons (User requested icons instead of text links) */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Connect
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {socialIcons.map((channel) => (
                <a
                  key={channel.id}
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  title={channel.label}
                  aria-label={channel.label}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02] text-zinc-300 transition-all duration-200 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/10 hover:text-[#c4f042] hover:scale-105"
                >
                  <ConnectIcon name={channel.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Divider & Copyright */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.08] pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {siteProfile.copyrightYear} {siteProfile.ownerName}</p>
          <a
            href="#main-content"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 transition-colors hover:text-[#c4f042]"
          >
            <span>Back to top</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-[10px] text-zinc-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#c4f042]/50 group-hover:bg-[#c4f042]/10 group-hover:text-[#c4f042]">
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-widest text-[#c4f042] uppercase">
      {children}
    </p>
  );
}

export interface PreviewCardItem {
  readonly number: string;
  readonly category: string;
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly href: string;
  readonly linkLabel: string;
}

export function PreviewSection({
  id,
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  items,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  items: readonly PreviewCardItem[];
}) {
  return (
    <section id={id} className="section-divider py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400 sm:text-base">
              {description}
            </p>
          </div>
          {ctaLabel && ctaHref ? (
            <Link href={ctaHref} className={sectionButtonClass}>
              <span>{ctaLabel}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={`${item.number}-${item.title}`}
              className={`dev-card flex min-w-0 flex-col rounded-2xl p-6 ${
                items.length === 3 && index === 2 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-bold text-[#c4f042]">
                  {item.number}
                </span>
                <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                  {item.category}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {item.description}
              </p>

              <div className="mt-auto flex flex-col gap-4 pt-6">
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className={tagClass}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] pt-3">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-[#c4f042]"
                  >
                    <span>{item.linkLabel}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProfileHighlights({
  title = PROFILE_HIGHLIGHTS_META.title,
  note = PROFILE_HIGHLIGHTS_META.note,
}: {
  title?: string;
  note?: string;
}) {
  const highlights = getProfileHighlights();

  return (
    <div className="mt-14 border-t border-white/[0.08] pt-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          {title}
        </h3>
        <p className="text-xs text-zinc-400">
          {note}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => {
          // Clean up "01 / EXPERIENCE" to just "EXPERIENCE"
          const cleanCategory = item.index.replace(/^\d+\s*\/\s*/, "");

          return (
            <div
              key={item.id}
              className="dev-card group relative overflow-hidden rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-[#c4f042] uppercase">
                  {cleanCategory}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#c4f042]/60 group-hover:bg-[#c4f042] transition-colors" />
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {item.value}
                </span>
                {item.suffix ? (
                  <span className="text-2xl font-bold text-[#c4f042]">
                    {item.suffix}
                  </span>
                ) : null}
              </div>

              <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-zinc-400">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ContactCtaSection({
  eyebrow = "Contact",
  title = "Let's build something reliable together.",
  description = "Share your workflow challenge, RAG pipeline requirements, or backend scope. Let's find a practical solution.",
  primaryLabel = "Start a conversation",
  primaryHref = "/contact",
  secondaryLabel = "View services",
  secondaryHref = "/services",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section id="contact" className="section-divider py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="dev-card relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 border border-zinc-800/80 bg-[#0c0d12]">
          {/* Subtle Ambient Accent Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#c4f042]/5 blur-3xl" />
          
          <div className="relative z-10 max-w-3xl">
            {/* Availability Pulse Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-zinc-300 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c4f042] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c4f042]" />
              </span>
              <span>Available for freelance contracts &amp; advisory</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg max-w-2xl">
              {description}
            </p>

            {/* Action Buttons Directly Below */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={primaryHref} className={primaryButtonClass}>
                <span>{primaryLabel}</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link href={secondaryHref} className={sectionButtonClass}>
                <span>{secondaryLabel}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
