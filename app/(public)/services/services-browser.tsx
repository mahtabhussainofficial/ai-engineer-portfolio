"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  ServiceFilterCategory,
  ServiceRecord,
} from "@/lib/services-data";

export function ServicesBrowser({
  services,
  categories,
}: {
  services: readonly ServiceRecord[];
  categories: readonly ServiceFilterCategory[];
}) {
  const [selected, setSelected] =
    useState<ServiceFilterCategory>("All Services");

  const filtered =
    selected === "All Services"
      ? services
      : services.filter((service) => service.category === selected);

  return (
    <section className="section-divider py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Pill Category Filter Buttons */}
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter services by focus area"
          >
            {categories.map((category) => {
              const isSelected = selected === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelected(category)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                    isSelected
                      ? "bg-[#c4f042] text-zinc-950 font-bold shadow-sm"
                      : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-medium text-zinc-400">
            Showing <span className="text-white font-semibold">{filtered.length}</span> of {services.length} capabilities
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="dev-card mt-8 rounded-2xl p-12 text-center">
            <p className="text-base font-medium text-white">
              No services published in this category yet.
            </p>
            <button
              type="button"
              onClick={() => setSelected("All Services")}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Show all services
            </button>
          </div>
        ) : (
          /* Exact 3-column match to Home Page (Crop 2 reference) */
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service, index) => {
              // Sequential clean numbering: 01, 02, 03...
              const displayNumber = String(index + 1).padStart(2, "0");
              const displayDomain = service.domain || service.category.toUpperCase();

              return (
                <div
                  key={service.id}
                  className="dev-card group relative flex flex-col justify-between h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#c4f042]/50"
                >
                  {/* Top Content */}
                  <div>
                    {/* Unified Top Line (01 · DOMAIN + Green Dot) */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                      <span className="text-xs font-bold tracking-wider text-[#c4f042] uppercase">
                        {displayNumber} · {displayDomain}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#c4f042]" />
                    </div>

                    <h3 className="mt-5 text-xl font-bold tracking-tight text-white group-hover:text-[#c4f042] transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-zinc-400 min-h-[3rem]">
                      {service.description}
                    </p>
                  </div>

                  {/* Bottom: Perfectly Aligned Tooling with Unified Hover Effect */}
                  <div className="mt-8 border-t border-white/[0.06] pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                      Core Tooling
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {service.tools.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-150 hover:border-[#c4f042]/60 hover:bg-[#c4f042]/5 hover:text-white"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    {/* Explore service details link matching home page */}
                    <div className="mt-6 pt-2">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-300 group-hover:text-[#c4f042] transition-colors"
                      >
                        <span>Explore service details</span>
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-150 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
