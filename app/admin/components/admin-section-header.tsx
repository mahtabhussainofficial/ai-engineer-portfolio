import type { ReactNode } from "react";

interface AdminSectionHeaderProps {
  badge?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function AdminSectionHeader({
  badge,
  title,
  description,
  actions,
}: AdminSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#181a20] pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {badge && (
          <p className="font-mono text-[11px] tracking-[0.16em] text-[#c4f042] uppercase font-medium">
            {badge}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 text-xs text-zinc-400 sm:text-sm">{description}</p>
      </div>

      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
