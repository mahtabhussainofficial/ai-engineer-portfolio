"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/admin/auth-context";
import { ADMIN_NAV_ITEMS, type AdminNavItem } from "./admin-nav-items";
import {
  IconExternalLink,
  IconShield,
  IconSignOut,
  renderNavIcon,
} from "./admin-icons";

interface AdminSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar({ onNavigate, className = "" }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function isItemActive(item: AdminNavItem): boolean {
    if (item.href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate?.();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const coreItems = ADMIN_NAV_ITEMS.filter((i) => i.group === "core");
  const contentItems = ADMIN_NAV_ITEMS.filter((i) => i.group === "content");
  const adminItems = ADMIN_NAV_ITEMS.filter((i) => i.group === "admin");

  return (
    <aside
      className={`flex h-full flex-col border-r border-[#181a20] bg-[#0a0b0e] text-zinc-200 ${className}`}
      aria-label="Admin Navigation Sidebar"
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#181a20] px-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c4f042]/40 bg-[#c4f042]/10 text-[#c4f042]">
            <IconShield className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-[-0.02em] text-white">
                Control Center
              </span>
            </div>
            <p className="font-mono text-[10px] tracking-widest text-[#c4f042] uppercase">
              Admin CMS
            </p>
          </div>
        </Link>

        <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
          LIVE
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Section */}
        <div>
          <p className="px-3 pb-2 font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
            Platform
          </p>
          <ul className="space-y-1">
            {coreItems.map((item) => (
              <li key={item.id}>
                <SidebarNavLink
                  item={item}
                  isActive={isItemActive(item)}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Content CMS Section */}
        <div>
          <p className="px-3 pb-2 font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
            Content Management
          </p>
          <ul className="space-y-1">
            {contentItems.map((item) => (
              <li key={item.id}>
                <SidebarNavLink
                  item={item}
                  isActive={isItemActive(item)}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Administration Section */}
        <div>
          <p className="px-3 pb-2 font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
            Administration
          </p>
          <ul className="space-y-1">
            {adminItems.map((item) => (
              <li key={item.id}>
                <SidebarNavLink
                  item={item}
                  isActive={isItemActive(item)}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Card & Actions Footer */}
      <div className="shrink-0 border-t border-[#181a20] bg-[#07080a] p-3">
        {user && (
          <div className="mb-2.5 flex items-center gap-3 rounded-lg border border-[#1e2029] bg-[#0d0e14] p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#c4f042]/40 bg-[#c4f042]/10 font-mono text-xs font-semibold text-[#c4f042]">
              {user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {user.full_name}
              </p>
              <p className="truncate font-mono text-[11px] text-zinc-400">
                {user.email}
              </p>
            </div>
            <span className="shrink-0 rounded border border-[#232630] bg-[#14161f] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              {user.role === "super_admin" ? "SUPER" : "ADMIN"}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#1e2029] bg-[#101218] px-2.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-[#c4f042]/40 hover:text-white"
          >
            <span>Public Site</span>
            <IconExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            title="Sign out of admin session"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1e2029] bg-[#101218] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
          >
            <IconSignOut className="h-3.5 w-3.5" />
            <span>{isLoggingOut ? "..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarNavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: AdminNavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
        isActive
          ? "border border-[#c4f042]/40 bg-[#c4f042]/10 text-[#c4f042] font-semibold shadow-sm shadow-[#c4f042]/5"
          : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="flex items-center gap-2.5 truncate">
        <span
          className={`shrink-0 transition-colors ${
            isActive ? "text-[#c4f042]" : "text-zinc-500 group-hover:text-zinc-300"
          }`}
        >
          {renderNavIcon(item.id, "h-4 w-4")}
        </span>
        <span className="truncate">{item.label}</span>
      </div>

      {item.badge && (
        <span className="shrink-0 rounded-full border border-[#c4f042]/30 bg-[#c4f042]/10 px-1.5 py-0.5 font-mono text-[9px] text-[#c4f042]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
