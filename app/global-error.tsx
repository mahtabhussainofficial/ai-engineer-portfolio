"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en" className="h-full antialiased">
      <body className="bg-grid-canvas flex min-h-screen flex-col justify-center bg-[#0b0f16] px-4 py-12 text-[#f1f5f9] sm:px-6 lg:px-8">
        <main className="mx-auto w-full max-w-3xl">
          <section className="section-frame rounded-2xl border border-[#1e293b] bg-[#111823]/90 p-8 sm:p-12">
            <p className="font-mono text-[11px] tracking-[0.18em] text-[#60a5fa]">
              APPLICATION RECOVERY
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.12] tracking-[-0.03em] text-[#f1f5f9] sm:text-4xl">
              Something went wrong.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#a1acba]">
              An unexpected issue prevented the application from rendering. Try
              reloading this view or return to the homepage.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => retry()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#2563eb] bg-[#2563eb] px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-[#1d4ed8] hover:bg-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]"
              >
                <span>Try again</span>
                <span aria-hidden="true">↻</span>
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Root layout crashed; hard navigation resets app shell safely */}
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130]/75 px-5 py-3 text-sm font-medium text-[#f1f5f9] transition-colors duration-200 hover:border-[#60a5fa]/60 hover:text-[#60a5fa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60a5fa]"
              >
                Return home
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
