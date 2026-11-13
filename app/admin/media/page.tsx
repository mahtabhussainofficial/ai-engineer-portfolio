"use client";

import { AdminSectionHeader } from "../components/admin-section-header";
import { IconMedia } from "../components/admin-icons";

export default function AdminMediaPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <AdminSectionHeader
        badge="Administration"
        title="Media"
        description="Asset library, external CDN URLs, cover images, and project attachments"
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 font-mono text-xs text-muted">
              Endpoint: /api/v1/admin/media
            </span>
          </div>
        }
      />

      <section className="section-frame rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#233044] bg-[#0b0f16]/40 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
            <IconMedia className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Media Asset Library Foundation Ready
          </h2>
          <p className="mt-2 max-w-md text-xs text-muted leading-relaxed">
            The administrative media reference API (`GET`, `POST`, `DELETE` at{" "}
            <code className="text-accent">/api/v1/admin/media</code>) is fully implemented
            for URL metadata, alt-text accessibility, and media associations.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              CDN URL Storage
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Alt Text & A11y
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              File Type Tracking
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Cover Image Selection
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
