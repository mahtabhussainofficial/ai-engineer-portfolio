"use client";

import { useState } from "react";
import type {
  ServiceFilterCategory,
  ServiceRecord,
} from "../../lib/services-data";
import { Eyebrow, tagClass } from "../components/site-shell";

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
    <section className="section-frame rounded-2xl p-6 sm:p-10 lg:p-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Eyebrow>01 / CAPABILITIES</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[2.25rem]">
            What we can build together.
          </h2>
          <p className="mt-3 text-base leading-7 text-muted">
            Filter by focus area or browse all eight AI engineering and backend
            capabilities.
          </p>
        </div>
        <p className="font-mono text-xs text-subtle">
          Showing {filtered.length} of {services.length}
        </p>
      </div>

      <div
        className="mt-8 flex flex-wrap gap-2"
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
              className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-4 sm:text-sm ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-[#2b3a50] bg-[#172130]/60 text-muted hover:border-accent/50 hover:text-foreground"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {filtered.map((service) => (
          <article
            key={service.id}
            className="surface-card surface-hover flex min-w-0 flex-col rounded-xl p-6 sm:p-7"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#233044] pb-4">
              <span className="font-mono text-xs text-accent">
                {service.number}
              </span>
              <span className="font-mono text-[11px] tracking-[0.08em] text-subtle">
                {service.domain}
              </span>
            </div>

            <h3 className="mt-6 text-xl font-semibold leading-snug text-foreground">
              {service.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              {service.description}
            </p>

            <div className="mt-auto pt-6">
              <div className="flex flex-wrap gap-2 border-t border-[#233044] pt-4">
                {service.tools.map((tool) => (
                  <span key={tool} className={tagClass}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
