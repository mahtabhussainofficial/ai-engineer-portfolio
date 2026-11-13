"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminMobileNav } from "./admin-mobile-nav";
import { AdminTopbar } from "./admin-topbar";

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f16] text-foreground">
      {/* Mobile Drawer (small screens) */}
      <AdminMobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Desktop Persistent Sidebar (lg screens) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <AdminSidebar />
      </div>

      {/* Main Content Viewport */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        {/* Sticky Topbar */}
        <AdminTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
