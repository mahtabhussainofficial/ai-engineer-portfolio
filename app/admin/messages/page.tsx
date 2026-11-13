"use client";

import { AdminSectionHeader } from "../components/admin-section-header";
import { IconMessages } from "../components/admin-icons";

export default function AdminMessagesPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <AdminSectionHeader
        badge="Administration"
        title="Messages"
        description="Inbound contact submissions, client project inquiries, read statuses, and triage"
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 font-mono text-xs text-muted">
              Endpoint: /api/v1/admin/messages
            </span>
          </div>
        }
      />

      <section className="section-frame rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#233044] bg-[#0b0f16]/40 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
            <IconMessages className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Messages & Inquiries Foundation Ready
          </h2>
          <p className="mt-2 max-w-md text-xs text-muted leading-relaxed">
            The administrative contact messages API (`GET`, `PUT read/archived`, `DELETE` at{" "}
            <code className="text-accent">/api/v1/admin/messages</code>) is fully implemented
            with unread counters, sender metadata, and rate-limiting audit logs.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Inbound Inquiries
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Mark as Read/Unread
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Sender Email & Company
            </span>
            <span className="rounded-md border border-[#273549] bg-[#111823] px-2.5 py-1 font-mono text-[11px] text-muted">
              Spam Filtering
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
