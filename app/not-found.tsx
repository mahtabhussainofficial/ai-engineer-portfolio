import Link from "next/link";
import {
  Eyebrow,
  SiteFooter,
  SiteHeader,
  sectionButtonClass,
} from "./components/site-shell";

export default function NotFound() {
  return (
    <div className="bg-grid-canvas min-h-screen overflow-x-clip text-foreground">
      <SiteHeader />

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8"
      >
        <section className="section-frame rounded-2xl p-8 sm:p-12 lg:p-16">
          <Eyebrow>404 / NOT FOUND</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-foreground">
            This page doesn&apos;t exist.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
            The route you requested could not be found. You can return to the
            homepage or browse projects and services directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Back to home
            </Link>
            <Link href="/projects" className={sectionButtonClass}>
              <span>View projects</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
