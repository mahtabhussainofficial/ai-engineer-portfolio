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
  "text-sm text-[#a1acba] transition-colors duration-200 hover:text-[#f1f5f9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export const sectionButtonClass =
  "inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-[#2b3a50] bg-[#172130]/75 px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:self-auto";

export const tagClass =
  "max-w-full break-words rounded-md border border-[#273549] bg-[#0b0f16]/85 px-2.5 py-1 font-mono text-[11px] text-muted";

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
  className = "h-3.5 w-3.5 shrink-0",
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
  const connectChannels = getConnectChannels();
  const brandPrefix = siteProfile.brandName.replace(/\.$/, "");
  const hasTrailingDot = siteProfile.brandName.endsWith(".");

  return (
    <footer className="px-4 pt-2 pb-8 sm:px-6 lg:px-8">
      <div className="section-frame mx-auto max-w-7xl rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_1.15fr] lg:gap-12">
          {/* Column 1: Brand & Bio */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-mono text-sm font-semibold tracking-[0.14em] text-[#f1f5f9] transition-colors duration-200 hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130] text-xs text-[#60a5fa]">
                {siteProfile.initials}
              </span>
              <span>
                {brandPrefix}
                {hasTrailingDot ? (
                  <span className="text-[#60a5fa]">.</span>
                ) : null}
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#a1acba]">
              {siteProfile.tagline}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h2 className="text-sm font-semibold text-[#f1f5f9]">
              Quick Links
            </h2>
            <nav
              aria-label="Footer navigation"
              className="mt-4 flex flex-col gap-2.5"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${mutedLink} w-fit`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Connect */}
          <div>
            <h2 className="text-sm font-semibold text-[#f1f5f9]">Connect</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {connectChannels.map((channel) => {
                if (!channel.href) {
                  return (
                    <span
                      key={channel.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#0b0f16]/65 px-3.5 py-2 text-xs font-medium text-subtle"
                    >
                      <ConnectIcon name={channel.icon} />
                      <span>{channel.label}</span>
                      {channel.status ? (
                        <span className="font-mono text-[10px] text-subtle">
                          {channel.status}
                        </span>
                      ) : null}
                    </span>
                  );
                }

                if (channel.external) {
                  return (
                    <a
                      key={channel.id}
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#233044] bg-[#172130]/75 px-3.5 py-2 text-xs font-medium text-[#f1f5f9] transition-colors duration-200 hover:border-[#60a5fa]/60 hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60a5fa]"
                    >
                      <ConnectIcon name={channel.icon} />
                      <span>{channel.label}</span>
                    </a>
                  );
                }

                return (
                  <Link
                    key={channel.id}
                    href={channel.href}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#233044] bg-[#172130]/75 px-3.5 py-2 text-xs font-medium text-[#f1f5f9] transition-colors duration-200 hover:border-[#60a5fa]/60 hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60a5fa]"
                  >
                    <ConnectIcon name={channel.icon} />
                    <span>{channel.label}</span>
                  </Link>
                );
              })}
            </div>

            <p className="mt-5 text-xs text-subtle">
              Direct:{" "}
              {siteProfile.directEmail ? (
                <a
                  href={`mailto:${siteProfile.directEmail}`}
                  className="font-medium text-[#f1f5f9] transition-colors hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60a5fa]"
                >
                  {siteProfile.directEmail}
                </a>
              ) : (
                <Link
                  href="/contact"
                  className="font-medium text-[#f1f5f9] transition-colors hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60a5fa]"
                >
                  Start an inquiry via Contact →
                </Link>
              )}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[#1e293b] pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {siteProfile.copyrightYear} {siteProfile.ownerName}{" "}
            {siteProfile.copyrightNote}
          </span>
          <span className="font-mono tracking-[0.14em] text-[#a1acba]">
            {siteProfile.techNote}
          </span>
        </div>
      </div>
    </footer>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.18em] text-[#60a5fa]">
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
        {ctaLabel && ctaHref ? (
          <Link href={ctaHref} className={sectionButtonClass}>
            <span>{ctaLabel}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={`${item.number}-${item.title}`}
            className={`surface-card surface-hover flex min-w-0 flex-col rounded-xl p-5 xl:p-6 ${
              items.length === 3 && index === 2
                ? "md:col-span-2 lg:col-span-1"
                : ""
            }`}
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

            <div className="mt-auto flex flex-col gap-5 pt-6">
              <div className="flex flex-wrap content-start gap-2 md:min-h-[3.75rem]">
                {item.tags.map((tag) => (
                  <span key={tag} className={tagClass}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="border-t border-[#233044] pt-4">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span>{item.linkLabel}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
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
    <div className="mt-10 border-t border-[#1e293b] pt-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>{PROFILE_HIGHLIGHTS_META.eyebrow}</Eyebrow>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
            {title}
          </h3>
        </div>
        <p className="max-w-sm text-xs leading-5 text-subtle sm:text-right">
          {note}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <div
            key={item.id}
            className="surface-card surface-hover rounded-xl p-5"
          >
            <span className="font-mono text-[10px] tracking-[0.16em] text-accent">
              {item.index}
            </span>
            <span className="mt-5 block text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              {item.value}
              {item.suffix ? (
                <span className="ml-1 text-lg text-accent">{item.suffix}</span>
              ) : null}
            </span>
            <span className="mt-2 block text-sm leading-5 text-muted">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactCtaSection({
  eyebrow,
  title,
  description,
  primaryLabel = "Start a conversation",
  primaryHref = "/contact",
  secondaryLabel = "View services",
  secondaryHref = "/services",
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section
      id="contact"
      className="section-frame rounded-2xl border-[#2b3c54] p-7 sm:p-10 lg:p-14"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-14">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-3xl text-[clamp(1.85rem,4.3vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.04em] text-foreground">
            {title}
            <span className="text-accent">.</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Link href={primaryHref} className={primaryButtonClass}>
            <span>{primaryLabel}</span>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130]/75 px-5 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
