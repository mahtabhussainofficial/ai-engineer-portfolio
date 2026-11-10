"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Skills", href: "/#skills" },
  { label: "Contact", href: "/contact" },
];

const projectTypes = [
  "AI application",
  "Agentic workflow",
  "RAG or knowledge system",
  "Backend or API",
  "Something else",
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
              aria-current={item.label === "Contact" ? "page" : undefined}
              className={
                item.label === "Contact"
                  ? "text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  : linkClass
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
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
                aria-current={item.label === "Contact" ? "page" : undefined}
                className={`block rounded-lg px-3 py-2.5 ${
                  item.label === "Contact"
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
          <span>Backend contact integration will be added later.</span>
        </div>
      </div>
    </footer>
  );
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <Header />
      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
            <p className="mb-5 font-mono text-xs tracking-[0.2em] text-accent">
              CONTACT / START A CONVERSATION
            </p>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
                Let&apos;s Build Something <span className="text-accent">Intelligent</span>
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted">
                Have an AI application, automation workflow, or backend system
                in mind? Share a little about the problem and the direction you
                are exploring.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-24 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-28">
          <aside aria-labelledby="contact-info-heading">
            <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent">
              CONTACT INFORMATION
            </p>
            <h2
              id="contact-info-heading"
              className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              Tell me what you&apos;re working on.
            </h2>
            <p className="mt-5 leading-7 text-muted">
              Email and social links will be published here once the editable
              contact details are confirmed.
            </p>
            <dl className="mt-10 space-y-6">
              <div>
                <dt className="font-mono text-xs tracking-widest text-accent">EMAIL</dt>
                <dd className="mt-2 text-sm text-muted">Editable email placeholder</dd>
              </div>
              <div>
                <dt className="font-mono text-xs tracking-widest text-accent">GITHUB</dt>
                <dd className="mt-2 text-sm text-muted">Editable GitHub link placeholder</dd>
              </div>
              <div>
                <dt className="font-mono text-xs tracking-widest text-accent">LINKEDIN</dt>
                <dd className="mt-2 text-sm text-muted">Editable LinkedIn link placeholder</dd>
              </div>
            </dl>
            <div className="mt-10 rounded-xl border border-white/10 bg-surface p-5">
              <p className="font-mono text-xs tracking-widest text-accent">AVAILABILITY</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Open to discussing AI engineering and backend development
                projects. Availability and response details can be confirmed
                during the conversation.
              </p>
            </div>
          </aside>

          <section aria-labelledby="form-heading" className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-8">
            <h2 id="form-heading" className="text-2xl font-semibold text-foreground">
              Project inquiry
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              This form is a frontend preview. Submission will be connected to
              the FastAPI backend later.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Full Name</span>
                  <input
                    required
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-foreground">Email Address</span>
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-foreground">Subject</span>
                <input
                  required
                  name="subject"
                  type="text"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground">Project Type</span>
                <select
                  required
                  name="projectType"
                  defaultValue=""
                  className="mt-2 w-full rounded-lg border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="" disabled>
                    Select a project type
                  </option>
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-foreground">Message</span>
                <textarea
                  required
                  name="message"
                  rows={6}
                  className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Submit inquiry
              </button>
              {submitted && (
                <p role="status" className="text-sm leading-6 text-accent">
                  Your message has not been sent. Backend form integration is
                  not available yet; this submission was only recorded in the
                  page state.
                </p>
              )}
            </form>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
