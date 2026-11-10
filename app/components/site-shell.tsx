import Link from "next/link";

export const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/skills" },
  { label: "Contact", href: "/contact" },
];

export const mutedLink =
  "text-sm text-[#a1acba] transition-colors hover:text-[#f1f5f9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]";

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="border-b border-[#293547] bg-[#0b0f16]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link href="/" className="font-mono text-sm font-semibold tracking-[0.12em] text-[#f1f5f9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]">
          SHABNUM H<span className="text-[#60a5fa]">.</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={active === item.label ? "page" : undefined} className={active === item.label ? "text-sm font-medium text-[#60a5fa]" : mutedLink}>{item.label}</Link>)}
          <Link href="/contact" className="rounded-md bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]">Let&apos;s talk</Link>
        </div>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-[#293547] px-3 py-2 text-[#f1f5f9] marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]">
            <span className="sr-only">Open navigation</span><span aria-hidden="true" className="text-lg leading-none">☰</span>
          </summary>
          <div className="absolute right-0 top-12 z-20 w-56 rounded-md border border-[#293547] bg-[#172130] p-2 shadow-2xl">
            {navigation.map((item) => <Link key={item.href} href={item.href} className={`block rounded px-3 py-2.5 text-sm ${active === item.label ? "text-[#60a5fa]" : "text-[#a1acba]"} hover:bg-[#111823] hover:text-[#f1f5f9]`}>{item.label}</Link>)}
            <Link href="/contact" className="mt-1 block rounded border-t border-[#293547] px-3 py-2.5 text-sm text-[#60a5fa]">Let&apos;s talk</Link>
          </div>
        </details>
      </nav>
    </header>
  );
}

export function SiteFooter({ dark = false }: { dark?: boolean }) {
  return (
    <footer className={`border-t border-[#293547] ${dark ? "bg-[#0b0f16]" : "bg-[#111823]"}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <Link href="/" className="font-mono text-sm font-semibold tracking-[0.12em] text-[#f1f5f9]">SHABNUM H<span className="text-[#60a5fa]">.</span></Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">{navigation.map((item) => <Link key={item.href} href={item.href} className={mutedLink}>{item.label}</Link>)}</nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#293547] pt-5 text-xs text-[#788596] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Shabnum H. All rights reserved.</span><span className="font-mono">AI / BACKEND / SYSTEMS</span>
        </div>
      </div>
    </footer>
  );
}

export function PageIntro({ label, title, description, active }: { label: string; title: React.ReactNode; description: string; active?: string }) {
  return (
    <>
      <SiteHeader active={active} />
      <section className="border-b border-[#293547] bg-[#0b0f16]">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
          <p className="mb-5 font-mono text-[11px] tracking-[0.18em] text-[#60a5fa]">{label}</p>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:items-end lg:gap-20">
            <h1 className="max-w-4xl text-[clamp(2.8rem,6vw,5.75rem)] font-semibold leading-[1] tracking-[-0.05em] text-[#f1f5f9]">{title}</h1>
            <p className="max-w-xl text-lg leading-8 text-[#a1acba]">{description}</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] tracking-[0.18em] text-[#60a5fa]">{children}</p>;
}
