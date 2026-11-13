"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type {
  CertificationCreate,
  CertificationRead,
  CertificationUpdate,
  EducationCreate,
  EducationRead,
  EducationUpdate,
  ExperienceCreate,
  ExperienceRead,
  ExperienceUpdate,
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
import { AdminStatusBadge } from "../components/admin-badge";

type CareerTab = "experience" | "education" | "certifications";

export default function AdminCareerPage() {
  const [activeTab, setActiveTab] = useState<CareerTab>("experience");
  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Data states
  const [experiences, setExperiences] = useState<ExperienceRead[]>([]);
  const [expTotal, setExpTotal] = useState(0);

  const [educationList, setEducationList] = useState<EducationRead[]>([]);
  const [eduTotal, setEduTotal] = useState(0);

  const [certifications, setCertifications] = useState<CertificationRead[]>([]);
  const [certTotal, setCertTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Details modal
  const [detailItem, setDetailItem] = useState<{
    type: CareerTab;
    title: string;
    content: Record<string, string | number | boolean | null | undefined>;
  } | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    type: CareerTab;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Experience Form
  const [expPeriod, setExpPeriod] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expOrg, setExpOrg] = useState("");
  const [expLocation, setExpLocation] = useState("");
  const [expSummary, setExpSummary] = useState("");
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDisplayOrder, setExpDisplayOrder] = useState(0);
  const [expPublishStatus, setExpPublishStatus] = useState<PublishStatus>("draft");

  // Education Form
  const [eduPeriod, setEduPeriod] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduInstitution, setEduInstitution] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduDesc, setEduDesc] = useState("");
  const [eduDisplayOrder, setEduDisplayOrder] = useState(0);
  const [eduPublishStatus, setEduPublishStatus] = useState<PublishStatus>("draft");

  // Certification Form
  const [certYear, setCertYear] = useState("");
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certCredentialId, setCertCredentialId] = useState("");
  const [certCredentialUrl, setCertCredentialUrl] = useState("");
  const [certDisplayOrder, setCertDisplayOrder] = useState(0);
  const [certPublishStatus, setCertPublishStatus] = useState<PublishStatus>("draft");

  const loadData = useCallback(async (tab = activeTab, silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    const filter = statusFilter === "all" ? undefined : statusFilter;

    try {
      if (tab === "experience") {
        const res = await adminApi.listExperiences({
          publish_status: filter,
          page,
          page_size: 15,
        });
        setExperiences(res.items);
        setExpTotal(res.total);
      } else if (tab === "education") {
        const res = await adminApi.listEducation({
          publish_status: filter,
          page,
          page_size: 15,
        });
        setEducationList(res.items);
        setEduTotal(res.total);
      } else if (tab === "certifications") {
        const res = await adminApi.listCertifications({
          publish_status: filter,
          page,
          page_size: 15,
        });
        setCertifications(res.items);
        setCertTotal(res.total);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to load career data.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, statusFilter, page]);

  useEffect(() => {
    let isCancelled = false;
    const filter = statusFilter === "all" ? undefined : statusFilter;

    if (activeTab === "experience") {
      adminApi.listExperiences({ publish_status: filter, page, page_size: 15 })
        .then((res) => {
          if (!isCancelled) {
            setExperiences(res.items);
            setExpTotal(res.total);
            setIsLoading(false);
          }
        })
        .catch(() => { if (!isCancelled) setIsLoading(false); });
    } else if (activeTab === "education") {
      adminApi.listEducation({ publish_status: filter, page, page_size: 15 })
        .then((res) => {
          if (!isCancelled) {
            setEducationList(res.items);
            setEduTotal(res.total);
            setIsLoading(false);
          }
        })
        .catch(() => { if (!isCancelled) setIsLoading(false); });
    } else if (activeTab === "certifications") {
      adminApi.listCertifications({ publish_status: filter, page, page_size: 15 })
        .then((res) => {
          if (!isCancelled) {
            setCertifications(res.items);
            setCertTotal(res.total);
            setIsLoading(false);
          }
        })
        .catch(() => { if (!isCancelled) setIsLoading(false); });
    }

    return () => {
      isCancelled = true;
    };
  }, [activeTab, statusFilter, page]);

  function showSuccess(msg: string) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  // Open Create Form for active tab
  function openCreateForm() {
    setFormMode("create");
    setActiveId(null);
    setFormErrors({});

    if (activeTab === "experience") {
      setExpPeriod("");
      setExpRole("");
      setExpOrg("");
      setExpLocation("");
      setExpSummary("");
      setExpIsCurrent(false);
      setExpDisplayOrder(0);
      setExpPublishStatus("draft");
    } else if (activeTab === "education") {
      setEduPeriod("");
      setEduDegree("");
      setEduInstitution("");
      setEduField("");
      setEduDesc("");
      setEduDisplayOrder(0);
      setEduPublishStatus("draft");
    } else if (activeTab === "certifications") {
      setCertYear("");
      setCertTitle("");
      setCertIssuer("");
      setCertCredentialId("");
      setCertCredentialUrl("");
      setCertDisplayOrder(0);
      setCertPublishStatus("draft");
    }

    setIsFormOpen(true);
  }

  // Open Edit Form
  function openEditForm(item: ExperienceRead | EducationRead | CertificationRead) {
    setFormMode("edit");
    setActiveId(item.id);
    setFormErrors({});

    if (activeTab === "experience") {
      const exp = item as ExperienceRead;
      setExpPeriod(exp.period);
      setExpRole(exp.role);
      setExpOrg(exp.organization);
      setExpLocation(exp.location || "");
      setExpSummary(exp.summary);
      setExpIsCurrent(exp.is_current);
      setExpDisplayOrder(exp.display_order);
      setExpPublishStatus(exp.publish_status);
    } else if (activeTab === "education") {
      const edu = item as EducationRead;
      setEduPeriod(edu.period);
      setEduDegree(edu.degree);
      setEduInstitution(edu.institution);
      setEduField(edu.field_of_study || "");
      setEduDesc(edu.description || "");
      setEduDisplayOrder(edu.display_order);
      setEduPublishStatus(edu.publish_status);
    } else if (activeTab === "certifications") {
      const cert = item as CertificationRead;
      setCertYear(cert.year);
      setCertTitle(cert.title);
      setCertIssuer(cert.issuer);
      setCertCredentialId(cert.credential_id || "");
      setCertCredentialUrl(cert.credential_url ? String(cert.credential_url) : "");
      setCertDisplayOrder(cert.display_order);
      setCertPublishStatus(cert.publish_status);
    }

    setIsFormOpen(true);
  }

  // Submit Handler
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFormErrors({});

    try {
      if (activeTab === "experience") {
        if (!expRole.trim() || !expOrg.trim() || !expPeriod.trim() || expSummary.trim().length < 10) {
          setFormErrors({ submit: "Role, organization, period and summary (min 10 chars) are required." });
          setIsSaving(false);
          return;
        }

        if (formMode === "create") {
          const payload: ExperienceCreate = {
            role: expRole.trim(),
            organization: expOrg.trim(),
            period: expPeriod.trim(),
            location: expLocation.trim() || null,
            summary: expSummary.trim(),
            is_current: expIsCurrent,
            display_order: Number(expDisplayOrder) || 0,
            publish_status: expPublishStatus,
          };
          await adminApi.createExperience(payload);
          showSuccess(`Experience "${expRole}" created.`);
        } else if (activeId) {
          const payload: ExperienceUpdate = {
            role: expRole.trim(),
            organization: expOrg.trim(),
            period: expPeriod.trim(),
            location: expLocation.trim() || null,
            summary: expSummary.trim(),
            is_current: expIsCurrent,
            display_order: Number(expDisplayOrder) || 0,
            publish_status: expPublishStatus,
          };
          await adminApi.updateExperience(activeId, payload);
          showSuccess(`Experience "${expRole}" updated.`);
        }
      } else if (activeTab === "education") {
        if (!eduDegree.trim() || !eduInstitution.trim() || !eduPeriod.trim()) {
          setFormErrors({ submit: "Degree, institution, and period are required." });
          setIsSaving(false);
          return;
        }

        if (formMode === "create") {
          const payload: EducationCreate = {
            degree: eduDegree.trim(),
            institution: eduInstitution.trim(),
            period: eduPeriod.trim(),
            field_of_study: eduField.trim() || null,
            description: eduDesc.trim() || null,
            display_order: Number(eduDisplayOrder) || 0,
            publish_status: eduPublishStatus,
          };
          await adminApi.createEducation(payload);
          showSuccess(`Education "${eduDegree}" created.`);
        } else if (activeId) {
          const payload: EducationUpdate = {
            degree: eduDegree.trim(),
            institution: eduInstitution.trim(),
            period: eduPeriod.trim(),
            field_of_study: eduField.trim() || null,
            description: eduDesc.trim() || null,
            display_order: Number(eduDisplayOrder) || 0,
            publish_status: eduPublishStatus,
          };
          await adminApi.updateEducation(activeId, payload);
          showSuccess(`Education "${eduDegree}" updated.`);
        }
      } else if (activeTab === "certifications") {
        if (!certTitle.trim() || !certIssuer.trim() || !certYear.trim()) {
          setFormErrors({ submit: "Title, issuer, and year are required." });
          setIsSaving(false);
          return;
        }

        if (formMode === "create") {
          const payload: CertificationCreate = {
            title: certTitle.trim(),
            issuer: certIssuer.trim(),
            year: certYear.trim(),
            credential_id: certCredentialId.trim() || null,
            credential_url: certCredentialUrl.trim() || null,
            display_order: Number(certDisplayOrder) || 0,
            publish_status: certPublishStatus,
          };
          await adminApi.createCertification(payload);
          showSuccess(`Certification "${certTitle}" created.`);
        } else if (activeId) {
          const payload: CertificationUpdate = {
            title: certTitle.trim(),
            issuer: certIssuer.trim(),
            year: certYear.trim(),
            credential_id: certCredentialId.trim() || null,
            credential_url: certCredentialUrl.trim() || null,
            display_order: Number(certDisplayOrder) || 0,
            publish_status: certPublishStatus,
          };
          await adminApi.updateCertification(activeId, payload);
          showSuccess(`Certification "${certTitle}" updated.`);
        }
      }

      setIsFormOpen(false);
      loadData(activeTab, true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setFormErrors({ submit: err.message });
      } else {
        setFormErrors({ submit: "An error occurred while saving." });
      }
    } finally {
      setIsSaving(false);
    }
  }

  // Toggle publish
  async function handleTogglePublish(item: ExperienceRead | EducationRead | CertificationRead) {
    const nextStatus: PublishStatus = item.publish_status === "published" ? "draft" : "published";
    try {
      if (activeTab === "experience") {
        await adminApi.updateExperience(item.id, { publish_status: nextStatus });
      } else if (activeTab === "education") {
        await adminApi.updateEducation(item.id, { publish_status: nextStatus });
      } else if (activeTab === "certifications") {
        await adminApi.updateCertification(item.id, { publish_status: nextStatus });
      }
      showSuccess(`Status changed to ${nextStatus}.`);
      loadData(activeTab, true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to transition status.");
      }
    }
  }

  // Delete
  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      if (deleteTarget.type === "experience") {
        await adminApi.deleteExperience(deleteTarget.id);
      } else if (deleteTarget.type === "education") {
        await adminApi.deleteEducation(deleteTarget.id);
      } else if (deleteTarget.type === "certifications") {
        await adminApi.deleteCertification(deleteTarget.id);
      }
      showSuccess(`Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      loadData(activeTab, true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to delete record.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  // Filter items
  const currentItems = activeTab === "experience"
    ? experiences
    : activeTab === "education"
    ? educationList
    : certifications;

  const currentTotal = activeTab === "experience"
    ? expTotal
    : activeTab === "education"
    ? eduTotal
    : certTotal;

  const filteredItems = currentItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if ("role" in item) {
      return item.role.toLowerCase().includes(q) || item.organization.toLowerCase().includes(q);
    }
    if ("degree" in item) {
      return item.degree.toLowerCase().includes(q) || item.institution.toLowerCase().includes(q);
    }
    if ("issuer" in item) {
      return item.title.toLowerCase().includes(q) || item.issuer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Header */}
      <AdminSectionHeader
        badge="Content CMS"
        title="Career Timeline"
        description="Chronological work experience, degree education, and verified industry certifications"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isLoading || isRefreshing}
              onClick={() => loadData(activeTab, true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
              title="Refresh"
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
              <span>
                {activeTab === "experience"
                  ? "New Experience"
                  : activeTab === "education"
                  ? "New Education"
                  : "New Certification"}
              </span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b] gap-2 text-xs">
        <button
          type="button"
          onClick={() => { setActiveTab("experience"); setPage(1); }}
          className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === "experience"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Work Experience ({expTotal})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("education"); setPage(1); }}
          className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === "education"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Education ({eduTotal})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("certifications"); setPage(1); }}
          className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === "certifications"
              ? "border-accent text-accent font-semibold"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Certifications ({certTotal})
        </button>
      </div>

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
          <button type="button" onClick={() => loadData(activeTab)} className="font-semibold underline hover:text-white">
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
            placeholder={`Search ${activeTab}...`}
            className="w-full rounded-lg border border-[#233044] bg-[#0b0f16] py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="career-status-filter" className="text-xs text-muted">
            Status:
          </label>
          <select
            id="career-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PublishStatus | "all");
              setPage(1);
            }}
            className="rounded-lg border border-[#233044] bg-[#0b0f16] px-2.5 py-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="section-frame rounded-2xl p-4 sm:p-6">
        {isLoading && currentItems.length === 0 ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card h-20 rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-foreground">No records found</p>
            <p className="mt-1 text-xs text-muted">
              {searchQuery ? "No entries match your search." : `Get started by adding your first ${activeTab} entry.`}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-primary/30"
              >
                <IconPlus className="h-3.5 w-3.5" />
                <span>Add Entry</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {filteredItems.map((item) => {
              const title = "role" in item
                ? `${item.role} @ ${item.organization}`
                : "degree" in item
                ? `${item.degree} — ${item.institution}`
                : `${item.title} (${item.issuer})`;

              const subtitle = "summary" in item
                ? item.summary
                : "description" in item && item.description
                ? item.description
                : "credential_id" in item && item.credential_id
                ? `ID: ${item.credential_id}`
                : "";

              const metaPeriod = "period" in item ? item.period : "year" in item ? item.year : "";

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#111823]/40 rounded-lg px-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {title}
                      </span>
                      <AdminStatusBadge status={item.publish_status} />
                      {"is_current" in item && item.is_current && (
                        <span className="rounded border border-primary/40 bg-primary/20 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                          CURRENT
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-muted">
                        {metaPeriod}
                      </span>
                      <span className="font-mono text-[10px] text-subtle">
                        Order: {item.display_order}
                      </span>
                    </div>

                    {subtitle && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted">
                        {subtitle}
                      </p>
                    )}
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
                      onClick={() =>
                        setDetailItem({
                          type: activeTab,
                          title,
                          content: item as unknown as Record<string, string | number | boolean | null | undefined>,
                        })
                      }
                      title="View details"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted hover:text-foreground"
                    >
                      <IconEye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      title="Edit"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted hover:text-foreground"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: item.id, title, type: activeTab })}
                      title="Delete"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#233044] bg-[#172130]/60 text-muted hover:text-red-400"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AdminPagination
          page={page}
          pageSize={15}
          total={currentTotal}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Create / Edit Form Modal */}
      <AdminModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          formMode === "create"
            ? `Add ${activeTab === "experience" ? "Experience" : activeTab === "education" ? "Education" : "Certification"}`
            : `Edit ${activeTab === "experience" ? "Experience" : activeTab === "education" ? "Education" : "Certification"}`
        }
        subtitle="Fill in record details and publishing attributes"
        maxWidth="2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {formErrors.submit && (
            <div role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-red-300">
              {formErrors.submit}
            </div>
          )}

          {activeTab === "experience" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="exp-role" className="block font-medium text-foreground">Role *</label>
                  <input
                    id="exp-role"
                    type="text"
                    required
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    placeholder="Principal AI Systems Engineer"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="exp-org" className="block font-medium text-foreground">Organization *</label>
                  <input
                    id="exp-org"
                    type="text"
                    required
                    value={expOrg}
                    onChange={(e) => setExpOrg(e.target.value)}
                    placeholder="Scale AI / Enterprise"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="exp-period" className="block font-medium text-foreground">Period *</label>
                  <input
                    id="exp-period"
                    type="text"
                    required
                    value={expPeriod}
                    onChange={(e) => setExpPeriod(e.target.value)}
                    placeholder="2024 — Present"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="exp-location" className="block font-medium text-foreground">Location</label>
                  <input
                    id="exp-location"
                    type="text"
                    value={expLocation}
                    onChange={(e) => setExpLocation(e.target.value)}
                    placeholder="San Francisco, CA (Remote)"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="exp-summary" className="block font-medium text-foreground">Summary * (min 10 chars)</label>
                <textarea
                  id="exp-summary"
                  rows={3}
                  required
                  value={expSummary}
                  onChange={(e) => setExpSummary(e.target.value)}
                  placeholder="Led the architecture and deployment of large-scale distributed inference systems..."
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expIsCurrent}
                    onChange={(e) => setExpIsCurrent(e.target.checked)}
                    className="h-4 w-4 rounded border-[#233044] bg-[#0b0f16] text-primary focus:ring-accent"
                  />
                  <span>Currently in this role</span>
                </label>

                <div className="flex items-center gap-2">
                  <label htmlFor="exp-order" className="font-medium text-foreground">Order:</label>
                  <input
                    id="exp-order"
                    type="number"
                    min={0}
                    value={expDisplayOrder}
                    onChange={(e) => setExpDisplayOrder(Number(e.target.value))}
                    className="w-20 rounded-lg border border-[#233044] bg-[#0b0f16] p-1.5 font-mono text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="exp-status" className="font-medium text-foreground">Status:</label>
                  <select
                    id="exp-status"
                    value={expPublishStatus}
                    onChange={(e) => setExpPublishStatus(e.target.value as PublishStatus)}
                    className="rounded-lg border border-[#233044] bg-[#0b0f16] p-1.5 text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === "education" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edu-degree" className="block font-medium text-foreground">Degree *</label>
                  <input
                    id="edu-degree"
                    type="text"
                    required
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    placeholder="B.S. in Computer Science"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edu-inst" className="block font-medium text-foreground">Institution *</label>
                  <input
                    id="edu-inst"
                    type="text"
                    required
                    value={eduInstitution}
                    onChange={(e) => setEduInstitution(e.target.value)}
                    placeholder="University of Engineering & Technology"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="edu-period" className="block font-medium text-foreground">Period *</label>
                  <input
                    id="edu-period"
                    type="text"
                    required
                    value={eduPeriod}
                    onChange={(e) => setEduPeriod(e.target.value)}
                    placeholder="2018 — 2022"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="edu-field" className="block font-medium text-foreground">Field of Study</label>
                  <input
                    id="edu-field"
                    type="text"
                    value={eduField}
                    onChange={(e) => setEduField(e.target.value)}
                    placeholder="Artificial Intelligence & Systems"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edu-desc" className="block font-medium text-foreground">Description</label>
                <textarea
                  id="edu-desc"
                  rows={2}
                  value={eduDesc}
                  onChange={(e) => setEduDesc(e.target.value)}
                  placeholder="Relevant coursework, research projects, or honors..."
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <label htmlFor="edu-order" className="font-medium text-foreground">Order:</label>
                  <input
                    id="edu-order"
                    type="number"
                    min={0}
                    value={eduDisplayOrder}
                    onChange={(e) => setEduDisplayOrder(Number(e.target.value))}
                    className="w-20 rounded-lg border border-[#233044] bg-[#0b0f16] p-1.5 font-mono text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="edu-status" className="font-medium text-foreground">Status:</label>
                  <select
                    id="edu-status"
                    value={eduPublishStatus}
                    onChange={(e) => setEduPublishStatus(e.target.value as PublishStatus)}
                    className="rounded-lg border border-[#233044] bg-[#0b0f16] p-1.5 text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === "certifications" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cert-title" className="block font-medium text-foreground">Certification Title *</label>
                  <input
                    id="cert-title"
                    type="text"
                    required
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    placeholder="AWS Certified Solutions Architect"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="cert-issuer" className="block font-medium text-foreground">Issuer *</label>
                  <input
                    id="cert-issuer"
                    type="text"
                    required
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    placeholder="Amazon Web Services"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cert-year" className="block font-medium text-foreground">Year *</label>
                  <input
                    id="cert-year"
                    type="text"
                    required
                    value={certYear}
                    onChange={(e) => setCertYear(e.target.value)}
                    placeholder="2025"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="cert-cred-id" className="block font-medium text-foreground">Credential ID</label>
                  <input
                    id="cert-cred-id"
                    type="text"
                    value={certCredentialId}
                    onChange={(e) => setCertCredentialId(e.target.value)}
                    placeholder="AWS-PSA-991283"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 font-mono text-foreground focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cert-url" className="block font-medium text-foreground">Verification URL (optional)</label>
                <input
                  id="cert-url"
                  type="url"
                  value={certCredentialUrl}
                  onChange={(e) => setCertCredentialUrl(e.target.value)}
                  placeholder="https://credly.com/badges/..."
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-2 text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <label htmlFor="cert-order" className="font-medium text-foreground">Order:</label>
                  <input
                    id="cert-order"
                    type="number"
                    min={0}
                    value={certDisplayOrder}
                    onChange={(e) => setCertDisplayOrder(Number(e.target.value))}
                    className="w-20 rounded-lg border border-[#233044] bg-[#0b0f16] p-1.5 font-mono text-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="cert-status" className="font-medium text-foreground">Status:</label>
                  <select
                    id="cert-status"
                    value={certPublishStatus}
                    onChange={(e) => setCertPublishStatus(e.target.value as PublishStatus)}
                    className="rounded-lg border border-[#233044] bg-[#0b0f16] p-1.5 text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </>
          )}

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
              {isSaving ? "Saving..." : formMode === "create" ? "Create Entry" : "Save Changes"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Details Inspection Modal */}
      <AdminModal
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        title={detailItem?.title || "Career Record Details"}
        subtitle={`Career Category: ${detailItem?.type?.toUpperCase()}`}
        maxWidth="lg"
      >
        {detailItem && (
          <div className="space-y-3 text-xs text-muted">
            {Object.entries(detailItem.content).map(([key, val]) => {
              if (val === null || val === undefined || key === "id") return null;
              return (
                <div key={key} className="flex flex-col border-b border-[#1e293b] pb-2">
                  <span className="font-mono text-[10px] text-subtle uppercase">{key.replace(/_/g, " ")}</span>
                  <span className="mt-0.5 text-foreground font-medium">{String(val)}</span>
                </div>
              );
            })}
          </div>
        )}
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Career Entry"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete Record"
        isLoading={isDeleting}
      />
    </div>
  );
}
