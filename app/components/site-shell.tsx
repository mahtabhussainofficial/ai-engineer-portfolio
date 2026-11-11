import Link from "next/link";
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

export function SiteHeader({ active }: { active?: string }) {
  return <SiteNavbar items={navigation} active={active} />;
}

export function SiteFooter({ dark = false }: { dark?: boolean }) {
  return (
    <footer className={`px-4 pt-2 pb-8 sm:px-6 lg:px-8 ${dark ? "bg-[#0b0f16]" : ""}`}>
      <div className="section-frame mx-auto max-w-7xl rounded-2xl px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="font-mono text-sm font-semibold tracking-[0.14em] text-[#f1f5f9] transition-colors duration-200 hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]"
            >
              SHABNUM H<span className="text-[#60a5fa]">.</span>
            </Link>
            <p className="mt-1.5 text-xs text-[#788596]">
              AI Engineer &amp; Backend Developer
            </p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={mutedLink}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-[#1e293b] pt-5 text-xs text-[#788596] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Shabnum H. All rights reserved.</span>
          <span className="font-mono tracking-[0.14em] text-[#a1acba]/80">
            AI / BACKEND / SYSTEMS
          </span>
        </div>
      </div>
    </footer>
  );
}

export function PageIntro({
  label,
  title,
  description,
  active,
}: {
  label: string;
  title: React.ReactNode;
  description: string;
  active?: string;
}) {
  return (
    <>
      <SiteHeader active={active} />
      <section className="border-b border-[#293547] bg-[#0b0f16]">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-24">
          <p className="mb-5 font-mono text-[11px] tracking-[0.18em] text-[#60a5fa]">
            {label}
          </p>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-end lg:gap-20">
            <h1 className="max-w-4xl text-[clamp(2.8rem,6vw,5.75rem)] font-semibold leading-[1] tracking-[-0.05em] text-[#f1f5f9]">
              {title}
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[#a1acba]">
              {description}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.18em] text-[#60a5fa]">
      {children}
    </p>
  );
}
