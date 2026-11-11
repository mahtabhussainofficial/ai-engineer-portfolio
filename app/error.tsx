"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Eyebrow,
  primaryButtonClass,
  sectionButtonClass,
} from "./components/site-shell";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-grid-canvas flex min-h-screen flex-1 flex-col justify-center px-4 py-12 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <section className="section-frame rounded-2xl p-8 sm:p-12 lg:p-16">
          <Eyebrow>500 / UNEXPECTED ERROR</Eyebrow>
          <h1 className="mt-4 max-w-2xl text-[clamp(1.85rem,4.2vw,3.1rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-foreground">
            Something interrupted this page.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
            We couldn&apos;t finish loading this view right now. You can retry
            loading the section or return to the homepage.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className={primaryButtonClass}
            >
              <span>Try again</span>
              <span aria-hidden="true">↻</span>
            </button>
            <Link href="/" className={sectionButtonClass}>
              <span>Back to home</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
