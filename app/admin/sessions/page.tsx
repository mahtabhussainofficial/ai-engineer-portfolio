"use client";

import { useState } from "react";
import { useAuth } from "@/lib/admin/auth-context";
import { AdminSectionHeader } from "../components/admin-section-header";
import { IconSessions, IconShield, IconSignOut } from "../components/admin-icons";

export default function AdminSessionsPage() {
  const { user, logout, logoutAll } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleLogoutCurrent() {
    setIsProcessing(true);
    setStatusMessage("Signing out of current browser session...");
    try {
      await logout();
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRevokeAllSessions() {
    if (
      !window.confirm(
        "Are you sure you want to revoke ALL active administrator sessions across all devices? You will be signed out immediately."
      )
    ) {
      return;
    }
    setIsProcessing(true);
    setStatusMessage("Revoking all active sessions in the database...");
    try {
      await logoutAll();
    } finally {
      setIsProcessing(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <AdminSectionHeader
        badge="Administration / Security"
        title="Sessions"
        description="Active device logins, refresh-token rotation families, and instant session revocation"
        actions={
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 font-mono text-xs text-muted">
              Endpoint: /api/v1/auth/sessions
            </span>
          </div>
        }
      />

      {statusMessage && (
        <div
          role="status"
          className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs text-foreground"
        >
          {statusMessage}
        </div>
      )}

      {/* Current Active Session Card */}
      <section className="section-frame rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-[#233044] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-accent">
              <IconSessions className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Current Connected Device
              </h2>
              <p className="font-mono text-xs text-muted">
                Authenticated as: {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-mono text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              This Browser (Active)
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="surface-card rounded-xl p-4">
            <span className="font-mono text-[10px] tracking-wider text-subtle">
              ADMINISTRATOR
            </span>
            <p className="mt-1 font-mono text-xs text-foreground">
              {user.full_name}
            </p>
          </div>

          <div className="surface-card rounded-xl p-4">
            <span className="font-mono text-[10px] tracking-wider text-subtle">
              SECURITY ROLE
            </span>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-foreground">
              {user.role}
            </p>
          </div>

          <div className="surface-card rounded-xl p-4 sm:col-span-2 lg:col-span-1">
            <span className="font-mono text-[10px] tracking-wider text-subtle">
              LAST AUTHENTICATION
            </span>
            <p className="mt-1 font-mono text-xs text-foreground">
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString()
                : "Active Initial Session"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#1e293b] pt-5">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleLogoutCurrent}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-red-500/60 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          >
            <IconSignOut className="h-4 w-4" />
            <span>Sign Out This Device</span>
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleRevokeAllSessions}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/25 px-4 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          >
            <IconShield className="h-4 w-4" />
            <span>Emergency: Revoke All Active Sessions</span>
          </button>
        </div>
      </section>

      {/* Session Architecture Reference Card */}
      <section className="section-frame rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-2 text-foreground">
          <IconShield className="h-5 w-5 text-accent" />
          <h2 className="text-sm font-semibold">
            Multi-Device Session & Family Rotation Specification
          </h2>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs text-muted">
          <div className="surface-card rounded-xl p-4 space-y-2">
            <h3 className="font-mono text-xs font-semibold text-foreground">
              Session Family Isolation
            </h3>
            <p className="leading-relaxed">
              Each device login creates an independent <code className="text-accent">family_id</code>.
              Rotating a refresh token on Device A rotates only Family A; Device B continues
              uninterrupted.
            </p>
          </div>

          <div className="surface-card rounded-xl p-4 space-y-2">
            <h3 className="font-mono text-xs font-semibold text-foreground">
              Token Replay Detection
            </h3>
            <p className="leading-relaxed">
              If an expired or previously rotated refresh token is presented, the backend
              detects replay attack semantics and immediately revokes all sessions in that family.
            </p>
          </div>

          <div className="surface-card rounded-xl p-4 space-y-2">
            <h3 className="font-mono text-xs font-semibold text-foreground">
              In-Memory Access Tokens
            </h3>
            <p className="leading-relaxed">
              Short-lived JWTs are never persisted in <code className="text-accent">localStorage</code> or{" "}
              <code className="text-accent">sessionStorage</code>, neutralizing persistent XSS token theft.
            </p>
          </div>

          <div className="surface-card rounded-xl p-4 space-y-2">
            <h3 className="font-mono text-xs font-semibold text-foreground">
              Double-Submit CSRF Protection
            </h3>
            <p className="leading-relaxed">
              Cookie credentials require matching cryptographically signed <code className="text-accent">X-CSRF-Token</code> headers
              on state-changing requests and session refreshes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
