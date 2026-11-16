import type { PublishStatus } from "@/lib/admin/types";

interface AdminStatusBadgeProps {
  status: PublishStatus | "unread" | "read" | "archived";
}

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-2 py-0.5 font-mono text-[10px] text-emerald-400 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        PUBLISHED
      </span>
    );
  }

  if (status === "draft") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/40 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        DRAFT
      </span>
    );
  }

  if (status === "unread") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/30 px-2 py-0.5 font-mono text-[10px] text-amber-300 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        UNREAD
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
      {status.toUpperCase()}
    </span>
  );
}

export function AdminFeaturedBadge({ featured }: { featured: boolean }) {
  if (!featured) return null;
  return (
    <span className="inline-flex items-center rounded border border-[#c4f042]/40 bg-[#c4f042]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#c4f042] font-semibold">
      ★ FEATURED
    </span>
  );
}
