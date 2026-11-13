"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type {
  PaginatedResponse,
  ProjectCreate,
  ProjectRead,
  ProjectSummary,
  ProjectType,
  ProjectUpdate,
  PublishStatus,
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

const DEFAULT_PROJECT_TYPE: ProjectType = "Case Study";

export default function AdminProjectsPage() {
  const [data, setData] = useState<PaginatedResponse<ProjectSummary> | null>(null);
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
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Detail Modal State
  const [detailProject, setDetailProject] = useState<ProjectRead | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formProjectType, setFormProjectType] = useState<ProjectType>(DEFAULT_PROJECT_TYPE);
  const [formSummary, setFormSummary] = useState("");
  const [formProblem, setFormProblem] = useState("");
  const [formSolution, setFormSolution] = useState("");
  const [formDeliverables, setFormDeliverables] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formLiveUrl, setFormLiveUrl] = useState("");
  const [formRepoUrl, setFormRepoUrl] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublishStatus, setFormPublishStatus] = useState<PublishStatus>("draft");

  const loadProjects = useCallback(async (isSilent = false) => {
    if (isSilent) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminApi.listProjects({
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
        setErrorMessage("Failed to load projects from server.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    let isCancelled = false;

    adminApi
      .listProjects({
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
            setErrorMessage("Failed to load projects from server.");
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

  // Auto-generate slug from title
  function handleTitleChange(newTitle: string) {
    setFormTitle(newTitle);
    if (formMode === "create") {
      const autoSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormSlug(autoSlug);
    }
  }

  function openCreateForm() {
    setFormMode("create");
    setActiveProjectId(null);
    setFormTitle("");
    setFormSlug("");
    setFormCategory("");
    setFormProjectType(DEFAULT_PROJECT_TYPE);
    setFormSummary("");
    setFormProblem("");
    setFormSolution("");
    setFormDeliverables("");
    setFormTags("");
    setFormLiveUrl("");
    setFormRepoUrl("");
    setFormDisplayOrder(0);
    setFormFeatured(false);
    setFormPublishStatus("draft");
    setFormErrors({});
    setIsFormOpen(true);
  }

  async function openEditForm(summary: ProjectSummary) {
    setFormMode("edit");
    setActiveProjectId(summary.id);
    setIsFormOpen(true);
    setIsSaving(true);
    setFormErrors({});

    try {
      const full = await adminApi.getProject(summary.id);
      setFormTitle(full.title);
      setFormSlug(full.slug);
      setFormCategory(full.category);
      setFormProjectType(full.project_type);
      setFormSummary(full.summary);
      setFormProblem(full.problem || "");
      setFormSolution(full.solution || "");
      setFormDeliverables((full.deliverables || []).join("\n"));
      setFormTags((full.tags || []).join(", "));
      setFormLiveUrl(full.live_url || "");
      setFormRepoUrl(full.repo_url || "");
      setFormDisplayOrder(full.display_order);
      setFormFeatured(full.featured);
      setFormPublishStatus(full.publish_status);
    } catch {
      setErrorMessage("Could not load full project details for editing.");
      setIsFormOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function openDetailModal(projectId: string) {
    setIsLoadingDetail(true);
    try {
      const full = await adminApi.getProject(projectId);
      setDetailProject(full);
    } catch {
      setErrorMessage("Failed to load project details.");
    } finally {
      setIsLoadingDetail(false);
    }
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = "Title is required.";
    if (!formSlug.trim()) errors.slug = "Slug is required.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formSlug.trim())) {
      errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens.";
    }
    if (!formCategory.trim()) errors.category = "Category is required.";
    if (!formSummary.trim()) errors.summary = "Summary is required.";
    if (!formProblem.trim()) errors.problem = "Problem description is required.";
    if (!formSolution.trim()) errors.solution = "Solution description is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setFormErrors({});

    const deliverablesList = formDeliverables
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const tagsList = formTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (formMode === "create") {
        const payload: ProjectCreate = {
          title: formTitle.trim(),
          slug: formSlug.trim(),
          category: formCategory.trim(),
          project_type: formProjectType,
          summary: formSummary.trim(),
          problem: formProblem.trim(),
          solution: formSolution.trim(),
          deliverables: deliverablesList,
          tags: tagsList,
          live_url: formLiveUrl.trim() || null,
          repo_url: formRepoUrl.trim() || null,
          featured: formFeatured,
          display_order: Number(formDisplayOrder) || 0,
          publish_status: formPublishStatus,
        };
        await adminApi.createProject(payload);
        showSuccess(`Project "${formTitle}" created successfully.`);
      } else if (activeProjectId) {
        const payload: ProjectUpdate = {
          title: formTitle.trim(),
          slug: formSlug.trim(),
          category: formCategory.trim(),
          project_type: formProjectType,
          summary: formSummary.trim(),
          problem: formProblem.trim(),
          solution: formSolution.trim(),
          deliverables: deliverablesList,
          tags: tagsList,
          live_url: formLiveUrl.trim() || null,
          repo_url: formRepoUrl.trim() || null,
          featured: formFeatured,
          display_order: Number(formDisplayOrder) || 0,
          publish_status: formPublishStatus,
        };
        await adminApi.updateProject(activeProjectId, payload);
        showSuccess(`Project "${formTitle}" updated successfully.`);
      }
      setIsFormOpen(false);
      loadProjects(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setFormErrors({ submit: err.message });
      } else {
        setFormErrors({ submit: "An error occurred while saving the project." });
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTogglePublish(item: ProjectSummary) {
    try {
      if (item.publish_status === "published") {
        await adminApi.unpublishProject(item.id);
        showSuccess(`Project "${item.title}" moved to draft.`);
      } else {
        await adminApi.publishProject(item.id);
        showSuccess(`Project "${item.title}" published live.`);
      }
      loadProjects(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to transition project publication status.");
      }
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await adminApi.deleteProject(deleteTarget.id);
      showSuccess(`Project "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      loadProjects(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to delete project.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  // Filter items client-side by search query
  const filteredItems = (data?.items || []).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <AdminSectionHeader
        badge="Content CMS"
        title="Projects"
        description="Manage case studies, architectures, live demos, and technical deliverables"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isLoading || isRefreshing}
              onClick={() => loadProjects(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
              title="Refresh projects list"
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
              <span>New Project</span>
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
          <button type="button" onClick={() => loadProjects()} className="font-semibold underline hover:text-white">
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
            placeholder="Search projects..."
            className="w-full rounded-lg border border-[#233044] bg-[#0b0f16] py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="project-status-filter" className="text-xs text-muted">
            Status:
          </label>
          <select
            id="project-status-filter"
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

      {/* Projects Content Area */}
      <div className="section-frame rounded-2xl p-4 sm:p-6">
        {isLoading && !data ? (
          <div className="flex flex-col gap-3 animate-pulse" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card h-20 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-foreground">No projects found</p>
            <p className="mt-1 text-xs text-muted">
              {searchQuery ? "No projects match your search query." : "Get started by adding your first project case study."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-primary/30"
              >
                <IconPlus className="h-3.5 w-3.5" />
                <span>Create Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {filteredItems.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#111823]/40 rounded-lg px-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {project.title}
                    </span>
                    <AdminStatusBadge status={project.publish_status} />
                    <AdminFeaturedBadge featured={project.featured} />
                    <span className="rounded border border-[#2b3a50] bg-[#172130] px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {project.category}
                    </span>
                    <span className="font-mono text-[10px] text-subtle">
                      Order: {project.display_order}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-1 text-xs text-muted">
                    {project.summary}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] text-subtle">
                      /{project.slug}
                    </span>
                    {project.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded bg-[#111823] px-1.5 py-0.2 font-mono text-[9px] text-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(project)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      project.publish_status === "published"
                        ? "border-[#2b3a50] bg-[#172130]/60 text-muted hover:border-amber-500/40 hover:text-amber-300"
                        : "border-emerald-500/40 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30"
                    }`}
                  >
                    {project.publish_status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openDetailModal(project.id)}
                    title="View details"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    <IconEye className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditForm(project)}
                    title="Edit project"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(project)}
                    title="Delete project"
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
        title={formMode === "create" ? "Create New Project" : "Edit Project"}
        subtitle="Configure project case study parameters, content, and publishing status"
        maxWidth="3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {formErrors.submit && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-red-300">
              {formErrors.submit}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="form-title" className="block font-medium text-foreground">
                Title *
              </label>
              <input
                id="form-title"
                type="text"
                required
                value={formTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enterprise AI Platform"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
              {formErrors.title && <p className="mt-1 text-red-400">{formErrors.title}</p>}
            </div>

            <div>
              <label htmlFor="form-slug" className="block font-medium text-foreground">
                Slug *
              </label>
              <input
                id="form-slug"
                type="text"
                required
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="enterprise-ai-platform"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 font-mono text-foreground focus:border-accent focus:outline-none"
              />
              {formErrors.slug && <p className="mt-1 text-red-400">{formErrors.slug}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="form-category" className="block font-medium text-foreground">
                Category *
              </label>
              <input
                id="form-category"
                type="text"
                required
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="AI Systems"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
              {formErrors.category && <p className="mt-1 text-red-400">{formErrors.category}</p>}
            </div>

            <div>
              <label htmlFor="form-project-type" className="block font-medium text-foreground">
                Project Type *
              </label>
              <select
                id="form-project-type"
                value={formProjectType}
                onChange={(e) => setFormProjectType(e.target.value as ProjectType)}
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              >
                <option value="Case Study">Case Study</option>
                <option value="Concept Brief">Concept Brief</option>
              </select>
            </div>

            <div>
              <label htmlFor="form-publish-status" className="block font-medium text-foreground">
                Publication Status *
              </label>
              <select
                id="form-publish-status"
                value={formPublishStatus}
                onChange={(e) => setFormPublishStatus(e.target.value as PublishStatus)}
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="form-summary" className="block font-medium text-foreground">
              Summary *
            </label>
            <textarea
              id="form-summary"
              rows={2}
              required
              value={formSummary}
              onChange={(e) => setFormSummary(e.target.value)}
              placeholder="High-level overview of the system and its architecture..."
              className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
            />
            {formErrors.summary && <p className="mt-1 text-red-400">{formErrors.summary}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="form-problem" className="block font-medium text-foreground">
                Problem Description *
              </label>
              <textarea
                id="form-problem"
                rows={3}
                required
                value={formProblem}
                onChange={(e) => setFormProblem(e.target.value)}
                placeholder="The core engineering bottleneck or business challenge..."
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
              {formErrors.problem && <p className="mt-1 text-red-400">{formErrors.problem}</p>}
            </div>

            <div>
              <label htmlFor="form-solution" className="block font-medium text-foreground">
                Solution Architecture *
              </label>
              <textarea
                id="form-solution"
                rows={3}
                required
                value={formSolution}
                onChange={(e) => setFormSolution(e.target.value)}
                placeholder="Technical architecture, models, and orchestration implemented..."
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
              {formErrors.solution && <p className="mt-1 text-red-400">{formErrors.solution}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="form-deliverables" className="block font-medium text-foreground">
                Deliverables (one per line)
              </label>
              <textarea
                id="form-deliverables"
                rows={3}
                value={formDeliverables}
                onChange={(e) => setFormDeliverables(e.target.value)}
                placeholder="High-throughput inference cluster&#10;Zero-downtime database migration"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 font-mono text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="form-tags" className="block font-medium text-foreground">
                Tags (comma-separated)
              </label>
              <textarea
                id="form-tags"
                rows={3}
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="FastAPI, PyTorch, Docker, PostgreSQL"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 font-mono text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="form-live-url" className="block font-medium text-foreground">
                Live URL (optional)
              </label>
              <input
                id="form-live-url"
                type="url"
                value={formLiveUrl}
                onChange={(e) => setFormLiveUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="form-repo-url" className="block font-medium text-foreground">
                Repository URL (optional)
              </label>
              <input
                id="form-repo-url"
                type="url"
                value={formRepoUrl}
                onChange={(e) => setFormRepoUrl(e.target.value)}
                placeholder="https://github.com/example/repo"
                className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 border-t border-[#1e293b] pt-4">
            <div className="flex items-center gap-2">
              <label htmlFor="form-display-order" className="font-medium text-foreground">
                Display Order:
              </label>
              <input
                id="form-display-order"
                type="number"
                min={0}
                value={formDisplayOrder}
                onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                className="w-20 rounded-lg border border-[#233044] bg-[#0b0f16] p-1.5 font-mono text-foreground focus:border-accent focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-[#233044] bg-[#0b0f16] text-primary focus:ring-accent"
              />
              <span>Mark as Featured Case Study</span>
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
              {isSaving ? "Saving..." : formMode === "create" ? "Create Project" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Project Details Modal */}
      <AdminModal
        isOpen={Boolean(detailProject) || isLoadingDetail}
        onClose={() => setDetailProject(null)}
        title={detailProject?.title || "Loading Project..."}
        subtitle={detailProject ? `/${detailProject.slug} • ${detailProject.category}` : undefined}
        maxWidth="3xl"
      >
        {detailProject && (
          <div className="space-y-4 text-xs text-muted">
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge status={detailProject.publish_status} />
              <AdminFeaturedBadge featured={detailProject.featured} />
              <span className="rounded border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[11px] text-foreground">
                Type: {detailProject.project_type}
              </span>
              <span className="font-mono text-[11px]">
                Order: {detailProject.display_order}
              </span>
            </div>

            <div>
              <h3 className="font-mono text-[11px] text-foreground uppercase tracking-wider">
                Summary
              </h3>
              <p className="mt-1 leading-relaxed text-foreground">
                {detailProject.summary}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-card rounded-xl p-4">
                <h4 className="font-mono text-[10px] text-subtle uppercase">Problem</h4>
                <p className="mt-1 text-foreground leading-relaxed">
                  {detailProject.problem}
                </p>
              </div>

              <div className="surface-card rounded-xl p-4">
                <h4 className="font-mono text-[10px] text-subtle uppercase">Solution</h4>
                <p className="mt-1 text-foreground leading-relaxed">
                  {detailProject.solution}
                </p>
              </div>
            </div>

            {detailProject.deliverables && detailProject.deliverables.length > 0 && (
              <div>
                <h3 className="font-mono text-[11px] text-foreground uppercase tracking-wider">
                  Deliverables
                </h3>
                <ul className="mt-1.5 list-inside list-disc space-y-1">
                  {detailProject.deliverables.map((item, idx) => (
                    <li key={idx} className="text-foreground">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {detailProject.tags && detailProject.tags.length > 0 && (
              <div>
                <h3 className="font-mono text-[11px] text-foreground uppercase tracking-wider">
                  Tags & Tech Stack
                </h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {detailProject.tags.map((tag) => (
                    <span key={tag} className="rounded bg-[#111823] border border-[#233044] px-2 py-0.5 font-mono text-[10px] text-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(detailProject.live_url || detailProject.repo_url) && (
              <div className="flex flex-wrap gap-4 border-t border-[#1e293b] pt-3 font-mono text-xs">
                {detailProject.live_url && (
                  <a
                    href={detailProject.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Live Demo ↗
                  </a>
                )}
                {detailProject.repo_url && (
                  <a
                    href={detailProject.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    GitHub Repository ↗
                  </a>
                )}
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
        title="Delete Project"
        message={`Are you sure you want to permanently delete project "${deleteTarget?.title}"? This action removes all deliverables and associations.`}
        confirmLabel="Delete Project"
        isLoading={isDeleting}
      />
    </div>
  );
}
