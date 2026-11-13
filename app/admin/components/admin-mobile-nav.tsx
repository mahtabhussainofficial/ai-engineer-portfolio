"use client";

import { useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { IconClose } from "./admin-icons";

interface AdminMobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminMobileNav({ isOpen, onClose }: AdminMobileNavProps) {
  // Listen for Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Administration Navigation"
      className="fixed inset-0 z-50 lg:hidden"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer */}
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col shadow-2xl">
        <div className="absolute right-2 top-3 z-10">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation drawer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2b3a50] bg-[#172130] text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <AdminSidebar onNavigate={onClose} className="h-full w-full" />
      </div>
    </div>
  );
}
