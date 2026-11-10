import Link from "next/link";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Skills", href: "/#skills" },
  { label: "Contact", href: "/contact" },
];

const interestGroups = [
  {
    title: "Intelligent systems",
    items: ["Agentic AI", "LLM applications", "RAG"],
  },
  {
    title: "Applied automation",
    items: ["AI automation", "Workflow design", "Conversational agents"],
  },
  {
    title: "Reliable foundations",
    items: ["Backend engineering", "REST APIs", "Data integrations"],
  },
];

const technologyGroups = [
  { title: "Programming", items: ["Python"] },
  { title: "Backend", items: ["FastAPI", "REST APIs"] },
  { title: "AI / ML", items: ["Machine Learning", "LLM Integration", "RAG"] },
  { title: "Database", items: ["PostgreSQL"] },
  { title: "DevOps", items: ["Docker", "Git", "GitHub"] },
];

const linkClass =
  "text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

function Header() {
  return (
    <header className="border-b border-white/10">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8"
      >
        <Link
          href="/#home"
          className="font-mono text-sm font-semibold tracking-[0.18em] text-foreground transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          YOUR NAME<span className="text-accent">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.label === "About" ? "page" : undefined}
              className={
                item.label === "About"
                  ? "text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  : linkClass
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="rounded-full border border-primary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Let&apos;s talk
          </Link>
        </div>

        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg border border-white/10 px-3 py-2 text-sm text-foreground marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <span className="sr-only">Open navigation</span>
            <span aria-hidden="true" className="text-lg leading-none">
              ☰
            </span>
          </summary>
          <div className="absolute right-0 top-12 z-10 w-48 rounded-xl border border-white/10 bg-surface p-2 shadow-2xl">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.label === "About" ? "page" : undefined}
                className={`block rounded-lg px-3 py-2.5 ${
                  item.label === "About"
                    ? "text-accent"
                    : "text-muted hover:text-foreground"
                } hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <Link
            href="/#home"
            className="font-mono text-sm font-semibold tracking-[0.18em] text-foreground hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            YOUR NAME<span className="text-accent">.</span>
          </Link>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Your Name. AI / BACKEND / SYSTEMS</span>
          <span>Building practical intelligent software.</span>
        </div>
      </div>
    </footer>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
            <p className="mb-5 font-mono text-xs tracking-[0.2em] text-accent">
              ABOUT / AI ENGINEERING
            </p>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                About <span className="text-accent">Me</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted">
                AI Engineer &amp; Backend Developer focused on building
                practical AI-powered applications, intelligent automation, and
                reliable backend systems.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="introduction-heading">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[0.7fr_1.3fr] lg:px-8 lg:py-28">
            <p className="font-mono text-xs tracking-[0.2em] text-accent">
              PROFESSIONAL INTRODUCTION
            </p>
            <div className="max-w-3xl">
              <h2
                id="introduction-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl"
              >
                Turning complex problems into useful systems.
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted">
                I work at the intersection of applied AI and backend
                engineering. The focus is on translating a real need into a
                clear product experience, a dependable technical foundation,
                and software that can continue to evolve.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10" aria-labelledby="approach-heading">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
            <div>
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                HOW I THINK
              </p>
              <h2
                id="approach-heading"
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                My approach to engineering
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
              <p className="leading-8 text-muted">
                Start with the problem rather than the tool. Break the work
                into understandable parts, make the system boundaries clear,
                and build the smallest useful path through the complexity.
                Reliability, observability, and maintainability are part of the
                solution—not afterthoughts.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10" aria-labelledby="interests-heading">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
            <div className="mb-12">
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                AREAS OF INTEREST
              </p>
              <h2
                id="interests-heading"
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                Technical interests
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {interestGroups.map((group, index) => (
                <article
                  key={group.title}
                  className="rounded-2xl border border-white/10 bg-surface p-6 transition-colors hover:border-primary/60"
                >
                  <span className="font-mono text-xs text-accent">0{index + 1}</span>
                  <h3 className="mt-8 text-xl font-semibold text-foreground">
                    {group.title}
                  </h3>
                  <ul className="mt-5 space-y-3 text-sm text-muted">
                    {group.items.map((item) => (
                      <li key={item}>— {item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10" aria-labelledby="philosophy-heading">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
            <div className="rounded-2xl border border-primary/40 bg-surface p-6 sm:p-8">
              <p className="font-mono text-xs tracking-[0.2em] text-accent">
                ENGINEERING PHILOSOPHY
              </p>
              <h2
                id="philosophy-heading"
                className="mt-6 text-3xl font-semibold leading-tight text-foreground sm:text-4xl"
              >
                Clean foundations. Useful outcomes.
              </h2>
              <p className="mt-6 leading-8 text-muted">
                Good engineering should be clear enough to maintain, structured
                enough to scale, and grounded enough to measure by its
                usefulness. I value clean code, thoughtful interfaces, and
                solutions that make the next improvement easier.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {["Clean code", "Maintainability", "Scalability", "Measurable usefulness"].map(
                (principle, index) => (
                  <div
                    key={principle}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-surface px-5 py-4"
                  >
                    <span className="font-medium text-foreground">{principle}</span>
                    <span className="font-mono text-xs text-accent">0{index + 1}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10" aria-labelledby="technologies-heading">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-28">
            <div>
              <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
                EDITABLE TOOLKIT
              </p>
              <h2
                id="technologies-heading"
                className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                Technologies I work with
              </h2>
              <p className="mt-5 max-w-md leading-7 text-muted">
                A selection of technologies already represented across the
                portfolio, organized by their role in a system.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {technologyGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-xl border border-white/10 bg-surface px-5 py-4"
                >
                  <h3 className="font-mono text-xs tracking-widest text-accent">
                    {group.title}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-white/10 px-2.5 py-1 text-sm text-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="rounded-2xl border border-primary/40 bg-surface px-6 py-12 text-center sm:px-12">
              <p className="font-mono text-xs tracking-[0.2em] text-accent">
                NEXT STEP
              </p>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Have an AI project in mind?
              </h2>
              <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
                Let&apos;s explore the problem and find a practical path to
                build something useful.
              </p>
              <Link
                href="/#contact"
                className="mt-8 inline-flex rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Start a conversation <span className="ml-2" aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
