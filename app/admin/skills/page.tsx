"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type {
  PaginatedResponse,
  PublishStatus,
  SkillCreate,
  SkillLayer,
  SkillRead,
  SkillUpdate,
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

const SKILL_LAYERS: { label: string; value: SkillLayer }[] = [
  { label: "AI & ML", value: "ai" },
  { label: "Backend Systems", value: "backend" },
  { label: "Delivery & DevOps", value: "delivery" },
];

export default function AdminSkillsPage() {
  const [data, setData] = useState<PaginatedResponse<SkillRead> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">("all");
  const [layerFilter, setLayerFilter] = useState<SkillLayer | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Detail Modal State
  const [detailSkill, setDetailSkill] = useState<SkillRead | null>(null);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<SkillRead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formLayer, setFormLayer] = useState<SkillLayer>("ai");
  const [formDomain, setFormDomain] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formItems, setFormItems] = useState("");
  const [formDisplayNumber, setFormDisplayNumber] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublishStatus, setFormPublishStatus] = useState<PublishStatus>("draft");

  const loadSkills = useCallback(async (isSilent = false) => {
    if (isSilent) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminApi.listSkills({
        publish_status: statusFilter === "all" ? undefined : statusFilter,
        layer: layerFilter === "all" ? undefined : layerFilter,
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
        setErrorMessage("Failed to load skills from server.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, statusFilter, layerFilter]);

  useEffect(() => {
    let isCancelled = false;

    adminApi
      .listSkills({
        publish_status: statusFilter === "all" ? undefined : statusFilter,
        layer: layerFilter === "all" ? undefined : layerFilter,
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
            setErrorMessage("Failed to load skills from server.");
          }
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [page, statusFilter, layerFilter]);

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  function openCreateForm() {
    setFormMode("create");
    setActiveSkillId(null);
    setFormLayer("ai");
    setFormDomain("");
    setFormTitle("");
    setFormDescription("");
    setFormItems("");
    setFormDisplayNumber("");
    setFormDisplayOrder(0);
    setFormFeatured(false);
    setFormPublishStatus("draft");
    setFormErrors({});
    setIsFormOpen(true);
  }

  function openEditForm(skill: SkillRead) {
    setFormMode("edit");
    setActiveSkillId(skill.id);
    setFormLayer(skill.layer);
    setFormDomain(skill.domain);
    setFormTitle(skill.title);
    setFormDescription(skill.description);
    setFormItems((skill.items || []).join(", "));
    setFormDisplayNumber(skill.display_number || "");
    setFormDisplayOrder(skill.display_order);
    setFormFeatured(skill.featured);
    setFormPublishStatus(skill.publish_status);
    setFormErrors({});
    setIsFormOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formTitle.trim() || formTitle.trim().length < 2) {
      errors.title = "Title must be at least 2 characters.";
    }
    if (!formDomain.trim() || formDomain.trim().length < 2) {
      errors.domain = "Domain must be at least 2 characters.";
    }
    if (!formDescription.trim() || formDescription.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setFormErrors({});

    const itemsList = formItems
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      if (formMode === "create") {
        const payload: SkillCreate = {
          layer: formLayer,
          domain: formDomain.trim(),
          title: formTitle.trim(),
          description: formDescription.trim(),
          items: itemsList,
          display_number: formDisplayNumber.trim() || null,
          display_order: Number(formDisplayOrder) || 0,
          featured: formFeatured,
          publish_status: formPublishStatus,
        };
        await adminApi.createSkill(payload);
        showSuccess(`Skill group "${formTitle}" created successfully.`);
      } else if (activeSkillId) {
        const payload: SkillUpdate = {
          layer: formLayer,
          domain: formDomain.trim(),
          title: formTitle.trim(),
          description: formDescription.trim(),
          items: itemsList,
          display_number: formDisplayNumber.trim() || null,
          display_order: Number(formDisplayOrder) || 0,
          featured: formFeatured,
          publish_status: formPublishStatus,
        };
        await adminApi.updateSkill(activeSkillId, payload);
        showSuccess(`Skill group "${formTitle}" updated successfully.`);
      }
      setIsFormOpen(false);
      loadSkills(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setFormErrors({ submit: err.message });
      } else {
        setFormErrors({ submit: "An error occurred while saving the skill group." });
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTogglePublish(item: SkillRead) {
    const nextStatus: PublishStatus = item.publish_status === "published" ? "draft" : "published";
    try {
      await adminApi.updateSkill(item.id, { publish_status: nextStatus });
      showSuccess(
        `Skill group "${item.title}" ${nextStatus === "published" ? "published live" : "moved to draft"}.`
      );
      loadSkills(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to transition skill group publication status.");
      }
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await adminApi.deleteSkill(deleteTarget.id);
      showSuccess(`Skill group "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      loadSkills(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to delete skill group.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredItems = (data?.items || []).filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.domain.toLowerCase().includes(q) ||
      s.layer.toLowerCase().includes(q) ||
      (s.items || []).some((item) => item.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <AdminSectionHeader
        badge="Content CMS"
        title="Skills"
        description="Layered skill groups across AI/ML frameworks, backend systems, and delivery tooling"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isLoading || isRefreshing}
              onClick={() => loadSkills(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
              title="Refresh skills list"
            >
              <IconRefresh className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-accent" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/60 bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <IconPlus className="h-4 w-4" />
              <span>New Skill Group</span>
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
          <button type="button" onClick={() => loadSkills()} className="font-semibold underline hover:text-white">
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
            placeholder="Search skills & tools..."
            className="w-full rounded-lg border border-[#233044] bg-[#0b0f16] py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="skill-layer-filter" className="text-xs text-muted">
              Layer:
            </label>
            <select
              id="skill-layer-filter"
              value={layerFilter}
              onChange={(e) => {
                setLayerFilter(e.target.value as SkillLayer | "all");
                setPage(1);
              }}
              className="rounded-lg border border-[#233044] bg-[#0b0f16] px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
            >
              <option value="all">All Layers</option>
              <option value="ai">AI & ML</option>
              <option value="backend">Backend Systems</option>
              <option value="delivery">Delivery & DevOps</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="skill-status-filter" className="text-xs text-muted">
              Status:
            </label>
            <select
              id="skill-status-filter"
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
      </div>

      {/* Skills List Content */}
      <div className="section-frame rounded-2xl p-4 sm:p-6">
        {isLoading && !data ? (
          <div className="flex flex-col gap-3 animate-pulse" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card h-20 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-foreground">No skill groups found</p>
            <p className="mt-1 text-xs text-muted">
              {searchQuery ? "No skill groups match your search query." : "Add your first skill group to organize technical competencies."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-primary/30"
              >
                <IconPlus className="h-3.5 w-3.5" />
                <span>Create Skill Group</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {filteredItems.map((skill) => (
              <div
                key={skill.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#111823]/40 rounded-lg px-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {skill.title}
                    </span>
                    <AdminStatusBadge status={skill.publish_status} />
                    <AdminFeaturedBadge featured={skill.featured} />
                    <span className="rounded border border-[#2b3a50] bg-[#172130] px-1.5 py-0.5 font-mono text-[10px] text-accent uppercase">
                      Layer: {skill.layer}
                    </span>
                    <span className="rounded border border-[#2b3a50] bg-[#172130] px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {skill.domain}
                    </span>
                    <span className="font-mono text-[10px] text-subtle">
                      Order: {skill.display_order}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {skill.description}
                  </p>

                  {skill.items && skill.items.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {skill.items.map((item) => (
                        <span key={item} className="rounded bg-[#111823] border border-[#233044] px-1.5 py-0.5 font-mono text-[9px] text-foreground">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(skill)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      skill.publish_status === "published"
                        ? "border-[#2b3a50] bg-[#172130]/60 text-muted hover:border-amber-500/40 hover:text-amber-300"
                        : "border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30"
                    }`}
                  >
                    {skill.publish_status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDetailSkill(skill)}
                    title="View details"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    <IconEye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditForm(skill)}
                    title="Edit skill group"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(skill)}
                    title="Delete skill group"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted transition-colors hover:border-red-500/40 hover:text-red-400"
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
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={formMode === "create" ? "Create New Skill Group" : "Edit Skill Group"}
        subtitle="Configure skill layer category, domain scope, and key technical items"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {formErrors.submit && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-red-300">
              {formErrors.submit}
            </div>
          )}

          <div>
            <label htmlFor="skill-form-title" className="block font-medium text-foreground">
              Title *
            </label>
            <input
              id="skill-form-title"
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Deep Learning & LLM Systems"
              className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
            />
            {formErrors.title && <p className="mt-1 text-red-400">{formErrors.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="skill-form-layer" className="block font-medium text-foreground">
                Architectural Layer *
              </label>
              <select
                id="skill-form-layer"
                value={formLayer}
                onChange={(e) => setFormLayer(e.target.value as SkillLayer)}
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              >
                {SKILL_LAYERS.map((layer) => (
                  <option key={layer.value} value={layer.value}>
                    {layer.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="skill-form-domain" className="block font-medium text-foreground">
                Domain *
              </label>
              <input
                id="skill-form-domain"
                type="text"
                required
                value={formDomain}
                onChange={(e) => setFormDomain(e.target.value)}
                placeholder="Generative AI & Evaluation"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
              {formErrors.domain && <p className="mt-1 text-red-400">{formErrors.domain}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="skill-form-description" className="block font-medium text-foreground">
              Description * (min 10 characters)
            </label>
            <textarea
              id="skill-form-description"
              rows={3}
              required
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Hands-on competence in pretraining, instruction tuning, RAG systems, and evaluation harnesses..."
              className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
            />
            {formErrors.description && <p className="mt-1 text-red-400">{formErrors.description}</p>}
          </div>

          <div>
            <label htmlFor="skill-form-items" className="block font-medium text-foreground">
              Skill Items & Frameworks (comma-separated)
            </label>
            <textarea
              id="skill-form-items"
              rows={2}
              value={formItems}
              onChange={(e) => setFormItems(e.target.value)}
              placeholder="PyTorch, Hugging Face, vLLM, LangGraph, DSPy, DeepSpeed"
              className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 font-mono text-foreground focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="skill-form-display-number" className="block font-medium text-foreground">
                Display Number (e.g. 01)
              </label>
              <input
                id="skill-form-display-number"
                type="text"
                value={formDisplayNumber}
                onChange={(e) => setFormDisplayNumber(e.target.value)}
                placeholder="01"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 font-mono text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="skill-form-display-order" className="block font-medium text-foreground">
                Display Order
              </label>
              <input
                id="skill-form-display-order"
                type="number"
                min={0}
                value={formDisplayOrder}
                onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 font-mono text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="skill-form-publish-status" className="block font-medium text-foreground">
                Status
              </label>
              <select
                id="skill-form-publish-status"
                value={formPublishStatus}
                onChange={(e) => setFormPublishStatus(e.target.value as PublishStatus)}
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
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
              <span>Feature on public portfolio highlights</span>
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
              {isSaving ? "Saving..." : formMode === "create" ? "Create Skill Group" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Skill Details Modal */}
      <AdminModal
        isOpen={Boolean(detailSkill)}
        onClose={() => setDetailSkill(null)}
        title={detailSkill?.title || "Skill Group Details"}
        subtitle={detailSkill ? `Layer: ${detailSkill.layer.toUpperCase()} • ${detailSkill.domain}` : undefined}
        maxWidth="lg"
      >
        {detailSkill && (
          <div className="space-y-4 text-xs text-muted">
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge status={detailSkill.publish_status} />
              <AdminFeaturedBadge featured={detailSkill.featured} />
              {detailSkill.display_number && (
                <span className="font-mono text-foreground font-semibold">
                  #{detailSkill.display_number}
                </span>
              )}
              <span className="font-mono text-[11px]">
                Order: {detailSkill.display_order}
              </span>
            </div>

            <div>
              <h3 className="font-mono text-[11px] text-foreground uppercase tracking-wider">
                Description
              </h3>
              <p className="mt-1 leading-relaxed text-foreground">
                {detailSkill.description}
              </p>
            </div>

            {detailSkill.items && detailSkill.items.length > 0 && (
              <div>
                <h3 className="font-mono text-[11px] text-foreground uppercase tracking-wider">
                  Technical Items & Libraries
                </h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {detailSkill.items.map((item) => (
                    <span key={item} className="rounded bg-[#111823] border border-[#233044] px-2 py-0.5 font-mono text-[10px] text-foreground">
                      {item}
                    </span>
                  ))}
                </div>
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
        title="Delete Skill Group"
        message={`Are you sure you want to permanently delete skill group "${deleteTarget?.title}"?`}
        confirmLabel="Delete Skill Group"
        isLoading={isDeleting}
      />
    </div>
  );
}
