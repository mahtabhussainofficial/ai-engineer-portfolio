"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth } from "@/lib/admin/auth-context";
import { AdminShell } from "./components/admin-shell";

function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isLoginPage) {
      router.replace("/admin/login");
    } else if (isAuthenticated && isLoginPage) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  // Loading state while session bootstrapping finishes
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen flex-col items-center justify-center px-4 bg-[#07080a] text-white"
      >
        <div className="section-frame flex max-w-sm flex-col items-center gap-4 rounded-2xl p-8 text-center border-[#1e2029] bg-[#0c0d12]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4f042] border-t-transparent" />
          <p className="font-mono text-xs tracking-[0.16em] text-[#c4f042] font-semibold">
            AUTHENTICATING
          </p>
          <p className="text-sm text-zinc-400">
            Checking portfolio administrator session...
          </p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content while redirecting to login
  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  // Prevent flash of login form while redirecting to admin home
  if (isAuthenticated && isLoginPage) {
    return null;
  }

  // When on login page, render child without dashboard shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authenticated admin view: wrapped in responsive dashboard shell
  return <AdminShell>{children}</AdminShell>;
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="bg-grid-canvas min-h-screen text-foreground selection:bg-primary selection:text-white">
        <AdminRouteGuard>{children}</AdminRouteGuard>
      </div>
    </AuthProvider>
  );
}
