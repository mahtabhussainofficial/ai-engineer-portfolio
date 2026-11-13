"use client";

interface AdminPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export function AdminPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  if (total <= pageSize && page === 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#1e293b] pt-4 text-xs text-muted">
      <div>
        Showing <span className="font-mono text-foreground">{startItem}</span> to{" "}
        <span className="font-mono text-foreground">{endItem}</span> of{" "}
        <span className="font-mono text-foreground">{total}</span> records
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-[#233044] bg-[#111823] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent/40 disabled:opacity-40"
        >
          Previous
        </button>

        <span className="font-mono text-xs text-muted">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-[#233044] bg-[#111823] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent/40 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
