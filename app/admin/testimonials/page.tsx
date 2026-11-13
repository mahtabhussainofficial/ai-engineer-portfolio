"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type {
  PaginatedResponse,
  PublishStatus,
  TestimonialCreate,
  TestimonialRead,
  TestimonialUpdate,
} from "@/lib/admin/types";
import { AdminSectionHeader } from "../components/admin-section-header";
import {
  IconCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "../components/admin-icons";
import { AdminModal } from "../components/admin-modal";
import { AdminConfirmDialog } from "../components/admin-confirm-dialog";
import { AdminPagination } from "../components/admin-pagination";
import { AdminFeaturedBadge, AdminStatusBadge } from "../components/admin-badge";

export default function AdminTestimonialsPage() {
  const [data, setData] = useState<PaginatedResponse<TestimonialRead> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Details modal
  const [detailItem, setDetailItem] = useState<TestimonialRead | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<TestimonialRead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formAuthorName, setFormAuthorName] = useState("");
  const [formAuthorRole, setFormAuthorRole] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [formRatingLabel, setFormRatingLabel] = useState("Outstanding Engineering");
  const [formStars, setFormStars] = useState(5);
  const [formSource, setFormSource] = useState("LinkedIn Recommendation");
  const [formSourceUrl, setFormSourceUrl] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublishStatus, setFormPublishStatus] = useState<PublishStatus>("draft");

  const loadTestimonials = useCallback(async (isSilent = false) => {
    if (isSilent) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminApi.listTestimonials({
        publish_status: statusFilter === "all" ? undefined : statusFilter,
        page,
        page_size: 15,
        sort_by: "display_order",
        sort_order: "asc",
      });
      setData(response);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to load testimonials from server.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    let isCancelled = false;

    adminApi
      .listTestimonials({
        publish_status: statusFilter === "all" ? undefined : statusFilter,
        page,
        page_size: 15,
        sort_by: "display_order",
        sort_order: "asc",
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
            setErrorMessage("Failed to load testimonials from server.");
          }
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, statusFilter]);

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  function openCreateForm() {
    setFormMode("create");
    setActiveId(null);
    setFormTitle("");
    setFormAuthorName("");
    setFormAuthorRole("");
    setFormQuote("");
    setFormRatingLabel("Outstanding Engineering");
    setFormStars(5);
    setFormSource("LinkedIn Recommendation");
    setFormSourceUrl("");
    setFormDisplayOrder(0);
    setFormFeatured(false);
    setFormPublishStatus("draft");
    setFormErrors({});
    setIsFormOpen(true);
  }

  function openEditForm(item: TestimonialRead) {
    setFormMode("edit");
    setActiveId(item.id);
    setFormTitle(item.title);
    setFormAuthorName(item.author_name || "");
    setFormAuthorRole(item.author_role || "");
    setFormQuote(item.quote || "");
    setFormRatingLabel(item.rating_label);
    setFormStars(item.stars);
    setFormSource(item.source);
    setFormSourceUrl(item.source_url ? String(item.source_url) : "");
    setFormDisplayOrder(item.display_order);
    setFormFeatured(item.featured);
    setFormPublishStatus(item.publish_status);
    setFormErrors({});
    setIsFormOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formTitle.trim() || formTitle.trim().length < 2) {
      errors.title = "Title is required (min 2 characters).";
    }
    if (!formRatingLabel.trim()) {
      errors.rating_label = "Rating label is required.";
    }
    if (!formSource.trim() || formSource.trim().length < 2) {
      errors.source = "Source is required (e.g. LinkedIn, Client Review).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setFormErrors({});

    try {
      if (formMode === "create") {
        const payload: TestimonialCreate = {
          title: formTitle.trim(),
          author_name: formAuthorName.trim() || null,
          author_role: formAuthorRole.trim() || null,
          quote: formQuote.trim() || null,
          rating_label: formRatingLabel.trim(),
          stars: Number(formStars),
          source: formSource.trim(),
          source_url: formSourceUrl.trim() || null,
          display_order: Number(formDisplayOrder) || 0,
          featured: formFeatured,
          publish_status: formPublishStatus,
        };
        await adminApi.createTestimonial(payload);
        showSuccess(`Testimonial "${formTitle}" created.`);
      } else if (activeId) {
        const payload: TestimonialUpdate = {
          title: formTitle.trim(),
          author_name: formAuthorName.trim() || null,
          author_role: formAuthorRole.trim() || null,
          quote: formQuote.trim() || null,
          rating_label: formRatingLabel.trim(),
          stars: Number(formStars),
          source: formSource.trim(),
          source_url: formSourceUrl.trim() || null,
          display_order: Number(formDisplayOrder) || 0,
          featured: formFeatured,
          publish_status: formPublishStatus,
        };
        await adminApi.updateTestimonial(activeId, payload);
        showSuccess(`Testimonial "${formTitle}" updated.`);
      }
      setIsFormOpen(false);
      loadTestimonials(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setFormErrors({ submit: err.message });
      } else {
        setFormErrors({ submit: "An error occurred while saving the testimonial." });
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTogglePublish(item: TestimonialRead) {
    try {
      if (item.publish_status === "published") {
        await adminApi.unpublishTestimonial(item.id);
        showSuccess(`Testimonial "${item.title}" moved to draft.`);
      } else {
        await adminApi.publishTestimonial(item.id);
        showSuccess(`Testimonial "${item.title}" published live.`);
      }
      loadTestimonials(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to transition testimonial publication status.");
      }
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await adminApi.deleteTestimonial(deleteTarget.id);
      showSuccess(`Deleted testimonial "${deleteTarget.title}".`);
      setDeleteTarget(null);
      loadTestimonials(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to delete testimonial.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredItems = (data?.items || []).filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.author_name && t.author_name.toLowerCase().includes(q)) ||
      (t.author_role && t.author_role.toLowerCase().includes(q)) ||
      t.source.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <AdminSectionHeader
        badge="Content CMS"
        title="Testimonials"
        description="Client reviews, stakeholder endorsements, star ratings, and social proof"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isLoading || isRefreshing}
              onClick={() => loadTestimonials(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
              title="Refresh testimonials"
            >
              <IconRefresh className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/60 bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <IconPlus className="h-4 w-4" />
              <span>New Testimonial</span>
            </button>
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
          <button type="button" onClick={() => loadTestimonials()} className="font-semibold underline hover:text-white">
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
            placeholder="Search testimonials & authors..."
            className="w-full rounded-lg border border-[#233044] bg-[#0b0f16] py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="test-status-filter" className="text-xs text-muted">
            Status:
          </label>
          <select
            id="test-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PublishStatus | "all");
              setPage(1);
            }}
            className="rounded-lg border border-[#233044] bg-[#0b0f16] px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          >
            <option value="all">All ({data?.total || 0})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="section-frame rounded-2xl p-4 sm:p-6">
        {isLoading && !data ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card h-20 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-foreground">No testimonials found</p>
            <p className="mt-1 text-xs text-muted">
              {searchQuery ? "No testimonials match your query." : "Add endorsements and reviews from past clients."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-primary/30"
              >
                <IconPlus className="h-3.5 w-3.5" />
                <span>Add Testimonial</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#111823]/40 rounded-lg px-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {item.title}
                    </span>
                    <AdminStatusBadge status={item.publish_status} />
                    <AdminFeaturedBadge featured={item.featured} />
                    <span className="rounded border border-amber-500/30 bg-amber-950/20 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                      {"★".repeat(item.stars)} ({item.stars}/5)
                    </span>
                    <span className="rounded border border-[#2b3a50] bg-[#172130] px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {item.source}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {item.quote ? `"${item.quote}"` : item.rating_label}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-subtle">
                    {item.author_name && <span>{item.author_name}</span>}
                    {item.author_role && <span>• {item.author_role}</span>}
                    <span>• Order: {item.display_order}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      item.publish_status === "published"
                        ? "border-[#2b3a50] bg-[#172130]/60 text-muted hover:border-amber-500/40 hover:text-amber-300"
                        : "border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30"
                    }`}
                  >
                    {item.publish_status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    title="View details"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted hover:text-foreground"
                  >
                    <IconEye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    title="Edit testimonial"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted hover:text-foreground"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    title="Delete testimonial"
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

      {/* Create / Edit Form Modal */}
      <AdminModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Add Testimonial" : "Edit Testimonial"}
        subtitle="Manage client endorsement quote, star rating, and publication status"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {formErrors.submit && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-red-300">
              {formErrors.submit}
            </div>
          )}

          <div>
            <label htmlFor="test-title" className="block font-medium text-foreground">Title / Headline *</label>
            <input
              id="test-title"
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Enterprise GenAI Infrastructure Overhaul"
              className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
            />
            {formErrors.title && <p className="mt-1 text-red-400">{formErrors.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="test-author" className="block font-medium text-foreground">Author Name</label>
              <input
                id="test-author"
                type="text"
                value={formAuthorName}
                onChange={(e) => setFormAuthorName(e.target.value)}
                placeholder="Sarah Chen"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="test-role" className="block font-medium text-foreground">Author Role / Organization</label>
              <input
                id="test-role"
                type="text"
                value={formAuthorRole}
                onChange={(e) => setFormAuthorRole(e.target.value)}
                placeholder="VP of Engineering @ Series-B HealthTech"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="test-quote" className="block font-medium text-foreground">Testimonial Quote</label>
            <textarea
              id="test-quote"
              rows={3}
              value={formQuote}
              onChange={(e) => setFormQuote(e.target.value)}
              placeholder="Shabnum delivered our LLM pipeline with zero regressions and cut latency by 60%..."
              className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="test-stars" className="block font-medium text-foreground">Star Rating (1-5)</label>
              <select
                id="test-stars"
                value={formStars}
                onChange={(e) => setFormStars(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              >
                <option value={5}>5 Stars ★★★★★</option>
                <option value={4}>4 Stars ★★★★☆</option>
                <option value={3}>3 Stars ★★★☆☆</option>
                <option value={2}>2 Stars ★★☆☆☆</option>
                <option value={1}>1 Star ★☆☆☆☆</option>
              </select>
            </div>

            <div>
              <label htmlFor="test-rating-label" className="block font-medium text-foreground">Rating Label *</label>
              <input
                id="test-rating-label"
                type="text"
                required
                value={formRatingLabel}
                onChange={(e) => setFormRatingLabel(e.target.value)}
                placeholder="Outstanding Engineering"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="test-source" className="block font-medium text-foreground">Source *</label>
              <input
                id="test-source"
                type="text"
                required
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                placeholder="LinkedIn Recommendation"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="test-source-url" className="block font-medium text-foreground">Source URL (optional)</label>
              <input
                id="test-source-url"
                type="url"
                value={formSourceUrl}
                onChange={(e) => setFormSourceUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="test-order" className="block font-medium text-foreground">Display Order</label>
                <input
                  id="test-order"
                  type="number"
                  min={0}
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 font-mono text-foreground focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="test-status" className="block font-medium text-foreground">Status</label>
                <select
                  id="test-status"
                  value={formPublishStatus}
                  onChange={(e) => setFormPublishStatus(e.target.value as PublishStatus)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1e293b] pt-4">
            <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-[#233044] bg-[#0b0f16] text-primary focus:ring-accent"
              />
              <span>Feature on public homepage & hero social proof</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#1e293b] pt-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-[#2b3a50] bg-[#172130]/60 px-4 py-2 text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg border border-primary/60 bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : formMode === "create" ? "Add Testimonial" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Details Modal */}
      <AdminModal
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={detailItem?.title || "Testimonial Details"}
        subtitle={detailItem ? `${detailItem.author_name || "Anonymous"} • ${detailItem.author_role || ""}` : undefined}
        maxWidth="lg"
      >
        {detailItem && (
          <div className="space-y-4 text-xs text-muted">
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge status={detailItem.publish_status} />
              <AdminFeaturedBadge featured={detailItem.featured} />
              <span className="text-amber-300 font-bold">
                {"★".repeat(detailItem.stars)}
              </span>
              <span>Source: {detailItem.source}</span>
            </div>

            {detailItem.quote && (
              <blockquote className="rounded-xl border border-[#233044] bg-[#0b0f16]/60 p-4 italic text-foreground leading-relaxed">
                &ldquo;{detailItem.quote}&rdquo;
              </blockquote>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="font-mono text-[10px] text-subtle uppercase">Rating Label</span>
                <p className="font-semibold text-foreground">{detailItem.rating_label}</p>
              </div>
              <div>
                <span className="font-mono text-[10px] text-subtle uppercase">Order</span>
                <p className="font-mono text-foreground">{detailItem.display_order}</p>
              </div>
            </div>

            {detailItem.source_url && (
              <div className="border-t border-[#1e293b] pt-3">
                <a
                  href={String(detailItem.source_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent hover:underline"
                >
                  View Source Endorsement ↗
                </a>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Testimonial"
        message={`Are you sure you want to permanently delete testimonial "${deleteTarget?.title}"?`}
        confirmLabel="Delete Testimonial"
        isLoading={isDeleting}
      />
    </div>
  );
}
