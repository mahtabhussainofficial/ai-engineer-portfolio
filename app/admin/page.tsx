"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/admin/auth-context";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type { AdminOverviewResponse } from "@/lib/admin/types";
import { AdminSectionHeader } from "./components/admin-section-header";
import {
  IconCareer,
  IconMedia,
  IconMessages,
  IconProjects,
  IconRefresh,
  IconServices,
  IconSessions,
  IconSettings,
  IconShield,
  IconSkills,
  IconTestimonials,
} from "./components/admin-icons";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadOverview = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);

    adminApi
      .getOverview()
      .then((res) => {
        setData(res);
        setLastUpdated(new Date());
      })
      .catch((err: unknown) => {
        if (err instanceof ApiClientError) {
          setErrorMessage(err.message);
          setErrorCode(err.code);
        } else {
          setErrorMessage("Failed to load dashboard overview data. Please try again.");
          setErrorCode("network_error");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const response = await adminApi.getOverview();
      setData(response);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
        setErrorCode(err.code);
      } else {
        setErrorMessage("Failed to load dashboard overview data. Please try again.");
        setErrorCode("network_error");
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    adminApi
      .getOverview()
      .then((res) => {
        if (!isCancelled) {
          setData(res);
          setLastUpdated(new Date());
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          if (err instanceof ApiClientError) {
            setErrorMessage(err.message);
            setErrorCode(err.code);
          } else {
            setErrorMessage("Failed to load dashboard overview data. Please try again.");
            setErrorCode("network_error");
          }
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      {/* Top Header */}
      <AdminSectionHeader
        badge="Platform / Control Center"
        title="Overview"
        description="Real-time CMS inventory, publishing workflow status, and inbound contact inquiries"
        actions={
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden font-mono text-[11px] text-muted sm:inline">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <button
              type="button"
              disabled={isLoading || isRefreshing}
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              title="Refresh dashboard metrics"
            >
              <IconRefresh className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        }
      />

      {/* Error State Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-500/40 bg-red-950/20 p-5 text-xs text-red-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-red-300">Overview Load Error</span>
              {errorCode && (
                <span className="rounded border border-red-500/30 bg-red-950/50 px-1.5 py-0.5 font-mono text-[10px] text-red-400">
                  {errorCode}
                </span>
              )}
            </div>
            <p className="mt-1 text-muted">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={loadOverview}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-500/50 bg-red-950/40 px-3.5 py-2 font-medium text-red-200 transition-colors hover:bg-red-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Retry Request
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="flex flex-col gap-8 animate-pulse" aria-busy="true" aria-label="Loading overview metrics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="surface-card h-32 rounded-xl p-5" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card h-28 rounded-xl p-5" />
            ))}
          </div>
          <div className="surface-card h-48 rounded-xl p-6" />
        </div>
      )}

      {/* Loaded Content */}
      {data && (
        <>
          {/* Section: Primary CMS Resources */}
          <section aria-labelledby="cms-resources-heading">
            <h2 id="cms-resources-heading" className="mb-3 font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">
              Content & Resource Inventory
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Projects Card */}
              <Link
                href="/admin/projects"
                className="group surface-card flex flex-col justify-between rounded-xl p-5 transition-all hover:border-[#c4f042]/40 hover:bg-[#11131a]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                    Projects
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222530] bg-[#08090d] text-zinc-400 transition-colors group-hover:border-[#c4f042]/40 group-hover:text-[#c4f042]">
                    <IconProjects className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {data.projects.total}
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[11px] text-emerald-400">
                      {data.projects.published} pub
                    </span>
                    <span className="rounded border border-[#222530] bg-[#08090d] px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                      {data.projects.draft} draft
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c4f042]">
                  <span>Manage Projects</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>

              {/* Services Card */}
              <Link
                href="/admin/services"
                className="group surface-card flex flex-col justify-between rounded-xl p-5 transition-all hover:border-[#c4f042]/40 hover:bg-[#11131a]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                    Services
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222530] bg-[#08090d] text-zinc-400 transition-colors group-hover:border-[#c4f042]/40 group-hover:text-[#c4f042]">
                    <IconServices className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {data.services.total}
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[11px] text-emerald-400">
                      {data.services.published} pub
                    </span>
                    <span className="rounded border border-[#222530] bg-[#08090d] px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                      {data.services.draft} draft
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c4f042]">
                  <span>Manage Services</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>

              {/* Skills Card */}
              <Link
                href="/admin/skills"
                className="group surface-card flex flex-col justify-between rounded-xl p-5 transition-all hover:border-[#c4f042]/40 hover:bg-[#11131a]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                    Skills
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222530] bg-[#08090d] text-zinc-400 transition-colors group-hover:border-[#c4f042]/40 group-hover:text-[#c4f042]">
                    <IconSkills className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {data.skills.total}
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[11px] text-emerald-400">
                      {data.skills.published} pub
                    </span>
                    <span className="rounded border border-[#222530] bg-[#08090d] px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                      {data.skills.draft} draft
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c4f042]">
                  <span>Manage Skills</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>

              {/* Testimonials Card */}
              <Link
                href="/admin/testimonials"
                className="group surface-card flex flex-col justify-between rounded-xl p-5 transition-all hover:border-[#c4f042]/40 hover:bg-[#11131a]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                    Testimonials
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222530] bg-[#08090d] text-zinc-400 transition-colors group-hover:border-[#c4f042]/40 group-hover:text-[#c4f042]">
                    <IconTestimonials className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {data.testimonials.total}
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[11px] text-emerald-400">
                      {data.testimonials.published} pub
                    </span>
                    <span className="rounded border border-[#222530] bg-[#08090d] px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                      {data.testimonials.draft} draft
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c4f042]">
                  <span>Manage Testimonials</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Section: Secondary CMS & Platform Settings */}
          <section aria-labelledby="platform-resources-heading">
            <h2 id="platform-resources-heading" className="mb-3 font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">
              Career History, Media & Site Settings
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Career Summary Card */}
              <Link
                href="/admin/career"
                className="group surface-card flex flex-col justify-between rounded-xl p-5 transition-all hover:border-[#c4f042]/40 hover:bg-[#11131a]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                    Career Timeline
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222530] bg-[#08090d] text-zinc-400 transition-colors group-hover:border-[#c4f042]/40 group-hover:text-[#c4f042]">
                    <IconCareer className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Experience</span>
                    <span className="font-mono text-white font-medium">{data.experience.total} items ({data.experience.published} pub)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Education</span>
                    <span className="font-mono text-white font-medium">{data.education.total} items ({data.education.published} pub)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Certifications</span>
                    <span className="font-mono text-white font-medium">{data.certifications.total} items ({data.certifications.published} pub)</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c4f042]">
                  <span>Manage Career</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>

              {/* Media Library Card */}
              <Link
                href="/admin/media"
                className="group surface-card flex flex-col justify-between rounded-xl p-5 transition-all hover:border-[#c4f042]/40 hover:bg-[#11131a]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                    Media Assets
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222530] bg-[#08090d] text-zinc-400 transition-colors group-hover:border-[#c4f042]/40 group-hover:text-[#c4f042]">
                    <IconMedia className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {data.media_assets}
                  </span>
                  <p className="mt-1 text-xs text-zinc-400">
                    Registered CDN media items & alt descriptions
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c4f042]">
                  <span>Asset Library</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>

              {/* Site Settings Card */}
              <Link
                href="/admin/settings"
                className="group surface-card flex flex-col justify-between rounded-xl p-5 transition-all hover:border-[#c4f042]/40 hover:bg-[#11131a] sm:col-span-2 lg:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                    Site Settings
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222530] bg-[#08090d] text-zinc-400 transition-colors group-hover:border-[#c4f042]/40 group-hover:text-[#c4f042]">
                    <IconSettings className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {data.site_settings}
                  </span>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded border border-[#c4f042]/40 bg-[#c4f042]/10 px-1.5 py-0.5 font-mono text-[11px] text-[#c4f042]">
                      {data.public_site_settings} public config keys
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#c4f042]">
                  <span>Configure Settings</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </Link>
            </div>
          </section>

          {/* Section: Contact Messages Statistics */}
          <section className="section-frame rounded-2xl p-6 sm:p-8" aria-labelledby="messages-summary-heading">
            <div className="flex flex-col gap-4 border-b border-[#181a20] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c4f042]/40 bg-[#c4f042]/10 text-[#c4f042]">
                  <IconMessages className="h-5 w-5" />
                </span>
                <div>
                  <h2 id="messages-summary-heading" className="text-base font-semibold text-white">
                    Inbound Inquiries & Messages
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Contact form submissions and prospective client inquiries
                  </p>
                </div>
              </div>

              <Link
                href="/admin/messages"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#222530] bg-[#12141c] px-3.5 py-2 text-xs font-medium text-[#c4f042] transition-colors hover:border-[#c4f042]/40 hover:text-white"
              >
                <span>Open Messages Inbox</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Counts Breakdown */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="surface-card rounded-xl p-4">
                <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                  Total Received
                </span>
                <p className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {data.messages.total}
                </p>
              </div>

              <div className="surface-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                    Unread Triage
                  </span>
                  {data.messages.unread > 0 && (
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
                <p className={`mt-1 text-xl font-bold tracking-tight sm:text-2xl ${data.messages.unread > 0 ? "text-amber-300" : "text-white"}`}>
                  {data.messages.unread}
                </p>
              </div>

              <div className="surface-card rounded-xl p-4">
                <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                  Read / Processed
                </span>
                <p className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {data.messages.read}
                </p>
              </div>

              <div className="surface-card rounded-xl p-4">
                <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                  Archived
                </span>
                <p className="mt-1 text-xl font-bold tracking-tight text-zinc-400 sm:text-2xl">
                  {data.messages.archived}
                </p>
              </div>
            </div>

            {/* Recent Messages List */}
            <div className="mt-6">
              <h3 className="mb-3 font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
                Recent Inbound Inquiries
              </h3>

              {data.recent_messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#222530] bg-[#08090d]/60 p-8 text-center">
                  <p className="text-xs font-medium text-white">
                    No contact inquiries received yet
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Inbound submissions from the public contact form will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#181a20] rounded-xl border border-[#222530] bg-[#0c0d12]">
                  {data.recent_messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex flex-col gap-2 p-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-xs font-semibold text-white">
                            {msg.sender_name}
                          </span>
                          <span className="rounded border border-[#222530] bg-[#101218] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                            {msg.project_type || msg.inquiry_mode}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                              msg.status === "unread"
                                ? "border border-amber-500/30 bg-amber-950/40 text-amber-300"
                                : msg.status === "read"
                                ? "border border-[#222530] bg-[#101218] text-zinc-400"
                                : "border border-zinc-800 bg-zinc-900/60 text-zinc-400"
                            }`}
                          >
                            {msg.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-zinc-400">
                          {msg.subject}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:gap-1">
                        <span className="font-mono text-[11px] text-zinc-500">
                          {new Date(msg.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <Link
                          href="/admin/messages"
                          className="text-xs font-medium text-[#c4f042] hover:underline"
                        >
                          View Inquiry →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section: Session Security Card */}
          <section className="section-frame rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col gap-4 border-b border-[#181a20] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c4f042]/40 bg-[#c4f042]/10 font-mono text-sm font-semibold text-[#c4f042]">
                  {user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {user.full_name}
                  </h2>
                  <p className="font-mono text-xs text-zinc-400">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-mono text-xs text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Session Active
                </span>
                <span className="rounded-md border border-[#222530] bg-[#0c0d12] px-2.5 py-1 font-mono text-xs text-zinc-400">
                  Role: {user.role === "super_admin" ? "Super Admin" : "Admin"}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <IconShield className="h-4 w-4 text-[#c4f042]" />
                <span>Double-submit CSRF and in-memory JWT protection active.</span>
              </div>
              <Link
                href="/admin/sessions"
                className="inline-flex items-center gap-1.5 font-medium text-[#c4f042] hover:underline"
              >
                <IconSessions className="h-3.5 w-3.5" />
                <span>Manage Connected Sessions & Revocation →</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
