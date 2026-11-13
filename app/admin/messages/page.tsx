"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type {
  ContactInquiryMode,
  ContactMessageRead,
  ContactMessageStatus,
  PaginatedResponse,
} from "@/lib/admin/types";
import { AdminSectionHeader } from "../components/admin-section-header";
import {
  IconCheck,
  IconEye,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "../components/admin-icons";
import { AdminModal } from "../components/admin-modal";
import { AdminConfirmDialog } from "../components/admin-confirm-dialog";
import { AdminPagination } from "../components/admin-pagination";

export default function AdminMessagesPage() {
  const [data, setData] = useState<PaginatedResponse<ContactMessageRead> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "all">("all");
  const [modeFilter, setModeFilter] = useState<ContactInquiryMode | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Message Details Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRead | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageRead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMessages = useCallback(async (isSilent = false) => {
    if (isSilent) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminApi.listMessages({
        status: statusFilter === "all" ? undefined : statusFilter,
        inquiry_mode: modeFilter === "all" ? undefined : modeFilter,
        page,
        page_size: 15,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setData(response);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to load contact messages.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, statusFilter, modeFilter]);

  useEffect(() => {
    let isCancelled = false;

    adminApi
      .listMessages({
        status: statusFilter === "all" ? undefined : statusFilter,
        inquiry_mode: modeFilter === "all" ? undefined : modeFilter,
        page,
        page_size: 15,
        sort_by: "created_at",
        sort_order: "desc",
      })
      .then((response) => {
        if (!isCancelled) {
          setData(response);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          if (err instanceof ApiClientError) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("Failed to load contact messages.");
          }
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, statusFilter, modeFilter]);

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  function openMessageDetails(msg: ContactMessageRead) {
    setSelectedMessage(msg);
    setAdminNotes(msg.admin_notes || "");
  }

  async function handleUpdateStatus(msgId: string, newStatus: ContactMessageStatus) {
    setIsUpdatingStatus(true);
    try {
      const updated = await adminApi.updateMessage(msgId, { status: newStatus });
      setSelectedMessage(updated);
      showSuccess(`Message marked as ${newStatus}.`);
      loadMessages(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to update message status.");
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleSaveNotes() {
    if (!selectedMessage) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await adminApi.updateMessage(selectedMessage.id, {
        admin_notes: adminNotes.trim() || null,
      });
      setSelectedMessage(updated);
      showSuccess("Admin triage notes saved.");
      loadMessages(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to save admin notes.");
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await adminApi.deleteMessage(deleteTarget.id);
      showSuccess(`Deleted inquiry from ${deleteTarget.sender_name}.`);
      setDeleteTarget(null);
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      loadMessages(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to delete message.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredItems = (data?.items || []).filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.sender_name.toLowerCase().includes(q) ||
      m.sender_email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.project_type.toLowerCase().includes(q)
    );
  });

  const unreadCount = (data?.items || []).filter((m) => m.status === "unread").length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <AdminSectionHeader
        badge="Administration"
        title="Messages"
        description="Inbound contact submissions, project inquiries, triage status, and client correspondence"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isLoading || isRefreshing}
              onClick={() => loadMessages(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
              title="Refresh messages"
            >
              <IconRefresh className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-3 py-1 font-mono text-xs text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                {unreadCount} Unread on page
              </span>
            )}
          </div>
        }
      />

      {/* Notifications */}
      {successMessage && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs text-emerald-300">
          <IconCheck className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-xs text-red-200">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => loadMessages()} className="font-semibold underline hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#233044] bg-[#0e141f] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inquiries, sender, subject..."
            className="w-full rounded-lg border border-[#233044] bg-[#0b0f16] py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="msg-mode-filter" className="text-xs text-muted">Mode:</label>
            <select
              id="msg-mode-filter"
              value={modeFilter}
              onChange={(e) => { setModeFilter(e.target.value as ContactInquiryMode | "all"); setPage(1); }}
              className="rounded-lg border border-[#233044] bg-[#0b0f16] px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="project">Project Inquiries</option>
              <option value="advisory">Advisory Inquiries</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="msg-status-filter" className="text-xs text-muted">Status:</label>
            <select
              id="msg-status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as ContactMessageStatus | "all"); setPage(1); }}
              className="rounded-lg border border-[#233044] bg-[#0b0f16] px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            >
              <option value="all">All ({data?.total || 0})</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List Content */}
      <div className="section-frame rounded-2xl p-4 sm:p-6">
        {isLoading && !data ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card h-20 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-foreground">No messages found</p>
            <p className="mt-1 text-xs text-muted">
              {searchQuery ? "No messages match your search query." : "Inbound contact submissions will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {filteredItems.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between transition-colors rounded-lg px-2 ${
                  msg.status === "unread" ? "bg-amber-950/10 hover:bg-amber-950/20" : "hover:bg-[#111823]/40"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {msg.sender_name}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                        msg.status === "unread"
                          ? "border border-amber-500/40 bg-amber-950/40 text-amber-300 font-bold"
                          : msg.status === "read"
                          ? "border border-[#2b3a50] bg-[#172130] text-muted"
                          : "border border-zinc-700 bg-zinc-900/60 text-zinc-400"
                      }`}
                    >
                      {msg.status.toUpperCase()}
                    </span>
                    <span className="rounded border border-[#2b3a50] bg-[#172130] px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {msg.project_type || msg.inquiry_mode}
                    </span>
                    <span className="font-mono text-[11px] text-subtle">
                      {new Date(msg.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="mt-1 font-medium text-xs text-foreground truncate">
                    {msg.subject}
                  </p>

                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                    {msg.message}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {msg.status === "unread" ? (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(msg.id, "read")}
                      className="rounded-lg border border-[#2b3a50] bg-[#172130]/60 px-2.5 py-1 text-xs font-medium text-muted hover:text-foreground"
                    >
                      Mark Read
                    </button>
                  ) : msg.status === "read" ? (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(msg.id, "archived")}
                      className="rounded-lg border border-[#2b3a50] bg-[#172130]/60 px-2.5 py-1 text-xs font-medium text-muted hover:text-foreground"
                    >
                      Archive
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => openMessageDetails(msg)}
                    title="View message"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted hover:text-foreground"
                  >
                    <IconEye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(msg)}
                    title="Delete inquiry"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted hover:text-red-400"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && (
          <AdminPagination
            page={page}
            pageSize={15}
            total={data.total}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Message Details Modal */}
      <AdminModal
        isOpen={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subject || "Inquiry Details"}
        subtitle={selectedMessage ? `From ${selectedMessage.sender_name} (${selectedMessage.sender_email})` : undefined}
        maxWidth="3xl"
      >
        {selectedMessage && (
          <div className="space-y-4 text-xs text-muted">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[10px] ${
                    selectedMessage.status === "unread"
                      ? "border border-amber-500/40 bg-amber-950/40 text-amber-300 font-bold"
                      : selectedMessage.status === "read"
                      ? "border border-[#2b3a50] bg-[#172130] text-muted"
                      : "border border-zinc-700 bg-zinc-900/60 text-zinc-400"
                  }`}
                >
                  {selectedMessage.status.toUpperCase()}
                </span>
                <span className="rounded border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[10px] text-foreground">
                  Mode: {selectedMessage.inquiry_mode}
                </span>
                <span className="rounded border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[10px] text-foreground">
                  Project: {selectedMessage.project_type}
                </span>
              </div>

              <span className="font-mono text-xs text-subtle">
                Received: {new Date(selectedMessage.created_at).toLocaleString()}
              </span>
            </div>

            {/* Sender card */}
            <div className="surface-card rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">{selectedMessage.sender_name}</span>
                <a
                  href={`mailto:${selectedMessage.sender_email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="font-mono text-accent hover:underline text-xs"
                >
                  Reply via Email ↗
                </a>
              </div>
              <p className="font-mono text-xs text-muted">{selectedMessage.sender_email}</p>
            </div>

            {/* Message Body */}
            <div>
              <h3 className="font-mono text-[11px] text-foreground uppercase tracking-wider">
                Inquiry Message
              </h3>
              <div className="mt-2 rounded-xl border border-[#233044] bg-[#0b0f16]/60 p-4 text-foreground leading-relaxed whitespace-pre-wrap text-xs">
                {selectedMessage.message}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="border-t border-[#1e293b] pt-3">
              <h3 className="font-mono text-[11px] text-foreground uppercase tracking-wider">
                Internal Triage Notes
              </h3>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add private administrator notes regarding follow-up or lead qualification..."
                className="mt-1.5 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={handleSaveNotes}
                className="mt-2 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/40 disabled:opacity-50"
              >
                Save Notes
              </button>
            </div>

            {/* Status Change Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1e293b] pt-4">
              <div className="flex items-center gap-2">
                <span className="text-subtle">Change Status:</span>
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedMessage.status === "unread"}
                  onClick={() => handleUpdateStatus(selectedMessage.id, "unread")}
                  className="rounded border border-[#2b3a50] px-2 py-1 text-xs hover:border-amber-400 disabled:opacity-40"
                >
                  Unread
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedMessage.status === "read"}
                  onClick={() => handleUpdateStatus(selectedMessage.id, "read")}
                  className="rounded border border-[#2b3a50] px-2 py-1 text-xs hover:border-accent disabled:opacity-40"
                >
                  Read
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedMessage.status === "archived"}
                  onClick={() => handleUpdateStatus(selectedMessage.id, "archived")}
                  className="rounded border border-[#2b3a50] px-2 py-1 text-xs hover:border-zinc-400 disabled:opacity-40"
                >
                  Archive
                </button>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(selectedMessage)}
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:underline"
              >
                <IconTrash className="h-3.5 w-3.5" />
                <span>Delete Message</span>
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact Message"
        message={`Are you sure you want to permanently delete the inquiry from "${deleteTarget?.sender_name}" regarding "${deleteTarget?.subject}"?`}
        confirmLabel="Delete Inquiry"
        isLoading={isDeleting}
      />
    </div>
  );
}
