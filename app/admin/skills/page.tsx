"use client";

import { AdminSectionHeader } from "../components/admin-section-header";
import { IconSkills } from "../components/admin-icons";

export default function AdminSkillsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <AdminSectionHeader
        badge="Content CMS"
        title="Skills"
        description="AI/ML, backend architecture, cloud engineering, and delivery skill inventory"
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 font-mono text-xs text-muted">
              Endpoint: /api/v1/admin/skills
            </span>
          </div>
        }
      />

      <section className="section-frame rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#233044] bg-[#0b0f16]/40 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
            <IconSkills className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Skills Inventory Foundation Ready
          </h2>
          <p className="mt-2 max-w-md text-xs text-muted leading-relaxed">
            The administrative backend CRUD API (`GET`, `POST`, `PUT`, `DELETE` at{" "}
            <code className="text-accent">/api/v1/admin/skills</code>) is fully implemented
            with proficiency levels, category groupings, and display order.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              AI / LLM Frameworks
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Backend Systems
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Cloud & DevOps
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Proficiency Ratings
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
