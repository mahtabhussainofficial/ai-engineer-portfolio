import type { PublishStatus } from "@/lib/admin/types";

interface AdminStatusBadgeProps {
  status: PublishStatus | "unread" | "read" | "archived";
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        PUBLISHED
      </span>
    );
  }

  if (status === "draft") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        DRAFT
      </span>
    );
  }

  if (status === "unread") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 font-mono text-[10px] text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        UNREAD
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[10px] text-muted">
      {status.toUpperCase()}
    </span>
  );
}

export function AdminFeaturedBadge({ featured }: { featured: boolean }) {
  if (!featured) return null;
  return (
    <span className="inline-flex items-center rounded border border-primary/40 bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] text-accent">
      ★ FEATURED
    </span>
  );
}
