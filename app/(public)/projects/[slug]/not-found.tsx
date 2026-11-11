import Link from "next/link";
import {
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
} from "@/app/components/site-shell";

export default function ProjectNotFound() {
  return (
    <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-14">
      <Eyebrow>404 / PROJECTS</Eyebrow>
      <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl">
        Project brief not found.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
        This case study has not been published yet or may no longer be
        available. You can browse active project briefs or start a conversation
        directly.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/projects" className={primaryButtonClass}>
          Back to projects
        </Link>
        <Link href="/contact" className={sectionButtonClass}>
          <span>Discuss a project</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
