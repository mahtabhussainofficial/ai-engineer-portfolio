"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/admin/auth-context";
import { ADMIN_NAV_ITEMS } from "./admin-nav-items";
import { IconExternalLink, IconMenu, IconSignOut } from "./admin-icons";

interface AdminTopbarProps {
  onOpenMobileNav: () => void;
}

export function AdminTopbar({ onOpenMobileNav }: AdminTopbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Derive current section label from pathname
  const currentNav =
    ADMIN_NAV_ITEMS.find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(item.href + "/")
    ) || { label: "Control Center", href: "/admin" };

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#1e293b] bg-[#0b0f16]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left: Mobile menu button & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130]/75 text-muted transition-colors hover:border-accent/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        >
          <IconMenu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link
            href="/admin"
            className="hidden font-mono tracking-wider text-subtle transition-colors hover:text-accent sm:inline"
          >
            ADMIN
          </Link>
          <span className="hidden text-subtle/60 sm:inline">/</span>
          <span className="font-semibold tracking-[-0.01em] text-foreground sm:text-sm">
            {currentNav.label}
          </span>
        </nav>
      </div>

      {/* Right: Public Site link & Authenticated user status */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-lg border border-[#233044] bg-[#172130]/60 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:inline-flex"
        >
          <span>Public Site</span>
          <IconExternalLink className="h-3 w-3" />
        </Link>

        {user && (
          <div className="flex items-center gap-2.5 rounded-lg border border-[#233044] bg-[#111823]/80 px-2.5 py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-accent/40 bg-accent/10 font-mono text-xs font-semibold text-accent">
              {user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div className="hidden text-left sm:block">
              <p className="max-w-[140px] truncate text-xs font-medium text-foreground">
                {user.full_name}
              </p>
              <p className="max-w-[140px] truncate font-mono text-[10px] text-muted">
                {user.role}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={isLoggingOut}
          onClick={handleLogout}
          title="Sign out of current admin session"
          className="flex h-9 items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 text-xs font-medium text-muted transition-colors hover:border-red-500/40 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
        >
          <IconSignOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </span>
        </button>
      </div>
    </header>
  );
}
