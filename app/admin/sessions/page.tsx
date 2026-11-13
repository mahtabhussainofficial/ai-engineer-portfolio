"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/admin/auth-context";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type { AdminSessionRead } from "@/lib/admin/types";
import { AdminSectionHeader } from "../components/admin-section-header";
import {
  IconCheck,
  IconClose,
  IconRefresh,
  IconSessions,
  IconShield,
  IconSignOut,
  IconTrash,
} from "../components/admin-icons";

function parseDeviceSummary(ua?: string | null): { browser: string; os: string; isMobile: boolean } {
  if (!ua) return { browser: "Unknown Client", os: "Unknown OS", isMobile: false };

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  let browser = "Web Browser";
  let os = "Desktop Device";

  if (/Firefox\/([0-9.]+)/i.test(ua)) browser = "Firefox";
  else if (/Edg\/([0-9.]+)/i.test(ua)) browser = "Microsoft Edge";
  else if (/Chrome\/([0-9.]+)/i.test(ua)) browser = "Chrome";
  else if (/Safari\/([0-9.]+)/i.test(ua)) browser = "Safari";

  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";

  return { browser, os, isMobile };
}

export default function AdminSessionsPage() {
  const { user, logout, logoutAll } = useAuth();
  const [sessions, setSessions] = useState<AdminSessionRead[]>([]);
  const [includeRevoked, setIncludeRevoked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Revoke target modal
  const [revokeTarget, setRevokeTarget] = useState<AdminSessionRead | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Logout All Modal
  const [isLogoutAllOpen, setIsLogoutAllOpen] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const loadSessions = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await adminApi.getSessions(includeRevoked);
      setSessions(res.sessions);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to load active sessions.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [includeRevoked]);

  useEffect(() => {
    let isCancelled = false;

    adminApi
      .getSessions(includeRevoked)
      .then((res) => {
        if (!isCancelled) {
          setSessions(res.sessions);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          if (err instanceof ApiClientError) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("Failed to load active sessions.");
          }
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [includeRevoked]);

  // Identify newest active session as the current device's primary session
  const activeSessions = sessions.filter((s) => !s.revoked_at);
  const currentSessionId = activeSessions.length > 0 ? activeSessions[0].id : null;

  async function handleRevokeConfirm() {
    if (!revokeTarget) return;

    setIsRevoking(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (revokeTarget.id === currentSessionId) {
        // Revoking current device session logs user out
        await logout();
        return;
      }

      await adminApi.revokeSession(revokeTarget.id);
      setSuccessMessage("Session revoked successfully.");
      setRevokeTarget(null);
      await loadSessions(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to revoke session.");
      }
    } finally {
      setIsRevoking(false);
    }
  }

  async function handleLogoutAllConfirm() {
    setIsLoggingOutAll(true);
    setErrorMessage(null);
    try {
      await logoutAll();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to revoke all sessions.");
      }
      setIsLoggingOutAll(false);
      setIsLogoutAllOpen(false);
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadSessions(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              aria-label="Refresh sessions list"
            >
              <IconRefresh className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLogoutAllOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <IconShield className="h-3.5 w-3.5" />
              <span>Revoke All Sessions</span>
            </button>
          </div>
        }
      />

      {/* Notifications */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-xs text-red-200"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200"
            aria-label="Dismiss error"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs text-emerald-200"
        >
          <div className="flex items-center gap-2">
            <IconCheck className="h-4 w-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
            aria-label="Dismiss success message"
          >
            <IconClose className="h-4 w-4" />
          </button>
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
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:border-red-500/60 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <IconSignOut className="h-4 w-4" />
            <span>Sign Out This Device</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLogoutAllOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/25 px-4 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <IconShield className="h-4 w-4" />
            <span>Revoke All Active Sessions</span>
          </button>
        </div>
      </section>

      {/* Real Sessions List Section */}
      <section className="section-frame rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-[#233044] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <IconSessions className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Database Refresh Sessions</h2>
            <span className="rounded-full border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[11px] text-muted">
              {sessions.length} {includeRevoked ? "Total" : "Active"}
            </span>
          </div>

          <label className="flex items-center gap-2 font-mono text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={includeRevoked}
              onChange={(e) => setIncludeRevoked(e.target.checked)}
              className="rounded border-[#233044] bg-[#0b0f16] text-accent focus:ring-accent"
            />
            <span>Include revoked sessions</span>
          </label>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="mt-3 text-xs text-muted">Loading session records...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#233044] bg-[#0b0f16]/40 p-10 text-center">
            <IconSessions className="h-8 w-8 text-subtle" />
            <p className="mt-2 text-xs text-muted">No sessions found matching current filter.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {sessions.map((sess) => {
              const isCurrent = sess.id === currentSessionId;
              const isRevoked = Boolean(sess.revoked_at);
              const { browser, os } = parseDeviceSummary(sess.user_agent);

              return (
                <div
                  key={sess.id}
                  className={`surface-card flex flex-col justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center ${
                    isCurrent
                      ? "border-accent/40 bg-accent/5"
                      : isRevoked
                      ? "border-slate-800 bg-[#0d131c]/60 opacity-60"
                      : "border-[#233044] hover:border-[#2b3a50]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">
                        {browser} on {os}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          THIS DEVICE
                        </span>
                      )}
                      {isRevoked ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-950/40 px-2 py-0.5 font-mono text-[10px] text-red-400">
                          REVOKED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-[11px] text-muted">
                      IP: <span className="text-foreground">{sess.ip_address || "127.0.0.1"}</span>
                      {sess.family_id && (
                        <span className="ml-3 text-subtle">
                          Family: {sess.family_id.substring(0, 8)}...
                        </span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-subtle font-mono pt-1">
                      <span>Created: {new Date(sess.created_at).toLocaleString()}</span>
                      <span>Expires: {new Date(sess.expires_at).toLocaleString()}</span>
                      {sess.revoked_at && (
                        <span className="text-red-400">
                          Revoked: {new Date(sess.revoked_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t border-[#1e293b] pt-3 sm:border-0 sm:pt-0">
                    {!isRevoked && (
                      <button
                        type="button"
                        onClick={() => setRevokeTarget(sess)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-900/40 transition-colors"
                        title="Revoke session"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                        <span>{isCurrent ? "Sign Out" : "Revoke"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Architecture Spec Card */}
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
        </div>
      </section>

      {/* Revoke Target Confirmation Modal */}
      {revokeTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="surface-card w-full max-w-md rounded-2xl border border-red-500/30 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/40 text-red-400">
                <IconTrash className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {revokeTarget.id === currentSessionId ? "Sign Out This Device?" : "Revoke Session?"}
                </h3>
                <p className="text-xs text-muted">
                  {revokeTarget.id === currentSessionId
                    ? "This will terminate your current browser session immediately."
                    : "This device will be immediately logged out and its refresh token invalidated."}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#233044] bg-[#0b0f16]/60 p-3 font-mono text-xs space-y-1">
              <p className="text-foreground">Session ID: {revokeTarget.id}</p>
              <p className="text-subtle">IP: {revokeTarget.ip_address || "127.0.0.1"}</p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isRevoking}
                onClick={() => setRevokeTarget(null)}
                className="rounded-lg border border-[#2b3a50] bg-[#172130] px-4 py-2 text-xs font-medium text-foreground hover:bg-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleRevokeConfirm}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/50 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-900/60 disabled:opacity-50"
              >
                {isRevoking && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-300 border-t-transparent" />
                )}
                <span>Revoke Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout All Confirmation Modal */}
      {isLogoutAllOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="surface-card w-full max-w-md rounded-2xl border border-red-500/40 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/40 bg-red-950/40 text-red-400">
                <IconShield className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">Revoke ALL Sessions</h3>
                <p className="text-xs text-muted">Emergency Global Session Invalidation</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted leading-relaxed">
              This will revoke <strong className="text-foreground">every active administrator session</strong> across all devices, browsers, and mobile logins. You will be signed out of this session immediately and redirected to the login page.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isLoggingOutAll}
                onClick={() => setIsLogoutAllOpen(false)}
                className="rounded-lg border border-[#2b3a50] bg-[#172130] px-4 py-2 text-xs font-medium text-foreground hover:bg-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOutAll}
                onClick={handleLogoutAllConfirm}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/60 px-4 py-2 text-xs font-medium text-red-200 hover:bg-red-900/80 disabled:opacity-50"
              >
                {isLoggingOutAll && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-200 border-t-transparent" />
                )}
                <span>Revoke All Sessions</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
