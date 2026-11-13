"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type {
  SiteSettingCreate,
  SiteSettingRead,
  SiteSettingUpdate,
  SiteSettingVisibilityUpdate,
} from "@/lib/admin/types";
import { AdminSectionHeader } from "../components/admin-section-header";
import {
  IconCheck,
  IconClose,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconShield,
} from "../components/admin-icons";

const PUBLIC_SETTING_KEYS = new Set([
  "site_general",
  "home_page",
  "about_page",
  "contact_page",
  "skills_page",
]);

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingRead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit / Create Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("edit");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form fields
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [valueJson, setValueJson] = useState("{}");
  const [isPublic, setIsPublic] = useState(false);
  const [portraitMediaId, setPortraitMediaId] = useState("");

  // Details Modal state
  const [detailSetting, setDetailSetting] = useState<SiteSettingRead | null>(null);

  // Visibility toggle in flight
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const searchInputId = useId();
  const categorySelectId = useId();
  const visibilitySelectId = useId();

  const loadData = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    const cat = categoryFilter === "all" ? undefined : categoryFilter;
    const isPub =
      visibilityFilter === "all"
        ? undefined
        : visibilityFilter === "public"
        ? true
        : false;

    try {
      const res = await adminApi.listSettings({
        category: cat,
        is_public: isPub,
        page: 1,
        page_size: 50,
        sort_by: "key",
        sort_order: "asc",
      });
      setSettings(res.items);
      setTotalCount(res.total);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to load site settings.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryFilter, visibilityFilter]);

  useEffect(() => {
    let isCancelled = false;
    const cat = categoryFilter === "all" ? undefined : categoryFilter;
    const isPub =
      visibilityFilter === "all"
        ? undefined
        : visibilityFilter === "public"
        ? true
        : false;

    adminApi
      .listSettings({
        category: cat,
        is_public: isPub,
        page: 1,
        page_size: 50,
        sort_by: "key",
        sort_order: "asc",
      })
      .then((res) => {
        if (!isCancelled) {
          setSettings(res.items);
          setTotalCount(res.total);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          if (err instanceof ApiClientError) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("Failed to load site settings.");
          }
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [categoryFilter, visibilityFilter]);

  // Unique categories for filter dropdown
  const availableCategories = Array.from(
    new Set(settings.map((s) => s.category).filter(Boolean))
  );

  // Client-side text filter
  const filteredSettings = settings.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.key.toLowerCase().includes(q) ||
      s.label.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  function openEditModal(setting: SiteSettingRead) {
    setFormMode("edit");
    setActiveKey(setting.key);
    setKey(setting.key);
    setLabel(setting.label);
    setCategory(setting.category || "general");
    setDescription(setting.description || "");
    try {
      setValueJson(JSON.stringify(setting.value, null, 2));
    } catch {
      setValueJson("{}");
    }
    setIsPublic(setting.is_public);
    setPortraitMediaId(setting.portrait_media_id || "");
    setFormErrors({});
    setIsFormOpen(true);
  }

  function openCreateModal() {
    setFormMode("create");
    setActiveKey(null);
    setKey("");
    setLabel("");
    setCategory("general");
    setDescription("");
    setValueJson("{\n  \n}");
    setIsPublic(false);
    setPortraitMediaId("");
    setFormErrors({});
    setIsFormOpen(true);
  }

  function formatJsonInput() {
    try {
      const parsed = JSON.parse(valueJson);
      setValueJson(JSON.stringify(parsed, null, 2));
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.valueJson;
        return next;
      });
    } catch {
      setFormErrors((prev) => ({
        ...prev,
        valueJson: "Invalid JSON syntax. Cannot format.",
      }));
    }
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (formMode === "create") {
      if (!key.trim()) {
        errors.key = "Setting key is required.";
      } else if (!/^[a-z0-9_.-]+$/.test(key.trim())) {
        errors.key = "Key must contain only lowercase alphanumeric, underscore, dot, or dash.";
      }
    }

    if (!label.trim()) {
      errors.label = "Label is required (2-150 characters).";
    }

    if (!category.trim()) {
      errors.category = "Category is required.";
    }

    try {
      const parsed = JSON.parse(valueJson);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        errors.valueJson = "Setting value must be a JSON object ({...}).";
      }
    } catch (e: unknown) {
      errors.valueJson = e instanceof Error ? e.message : "Invalid JSON format.";
    }

    if (portraitMediaId.trim()) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(portraitMediaId.trim())) {
        errors.portraitMediaId = "Portrait Media ID must be a valid UUID.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    let parsedValue: Record<string, unknown> = {};
    try {
      parsedValue = JSON.parse(valueJson) as Record<string, unknown>;
    } catch {
      setFormErrors({ valueJson: "Malformed JSON payload." });
      setIsSaving(false);
      return;
    }

    const cleanPortraitId = portraitMediaId.trim() || undefined;

    try {
      if (formMode === "create") {
        const payload: SiteSettingCreate = {
          key: key.trim(),
          label: label.trim(),
          category: category.trim(),
          description: description.trim() || null,
          value: parsedValue,
          is_public: isPublic,
          portrait_media_id: cleanPortraitId,
        };
        await adminApi.createSetting(payload);
        setSuccessMessage(`Site setting "${key.trim()}" created successfully.`);
      } else if (activeKey) {
        const payload: SiteSettingUpdate = {
          label: label.trim(),
          category: category.trim(),
          description: description.trim() || null,
          value: parsedValue,
          portrait_media_id: cleanPortraitId ?? null,
        };
        await adminApi.updateSetting(activeKey, payload);
        setSuccessMessage(`Site setting "${activeKey}" updated successfully.`);
      }
      setIsFormOpen(false);
      await loadData(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to save site setting.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleVisibility(setting: SiteSettingRead) {
    if (!PUBLIC_SETTING_KEYS.has(setting.key)) {
      setErrorMessage(
        `Setting "${setting.key}" is internal and cannot be exposed publicly.`
      );
      return;
    }

    setTogglingKey(setting.key);
    setErrorMessage(null);
    setSuccessMessage(null);

    const newVisibility = !setting.is_public;
    try {
      const payload: SiteSettingVisibilityUpdate = { is_public: newVisibility };
      await adminApi.updateSettingVisibility(setting.key, payload);
      setSuccessMessage(
        `Setting "${setting.key}" visibility set to ${
          newVisibility ? "PUBLIC" : "PRIVATE"
        }.`
      );
      await loadData(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to update setting visibility.");
      }
    } finally {
      setTogglingKey(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <AdminSectionHeader
        badge="Administration CMS"
        title="Site Settings"
        description="Public configuration bundles, page content blocks, contact recipients, and SEO metadata"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              aria-label="Refresh settings list"
            >
              <IconRefresh className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-3.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <IconPlus className="h-3.5 w-3.5" />
              <span>New Setting</span>
            </button>
          </div>
        }
      />

      {/* Security Architecture Reference */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs text-foreground">
        <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Strict Whitelist Public Visibility Policy
          </p>
          <p className="text-muted leading-relaxed">
            Only explicit public bundles (<code className="text-accent">site_general</code>,{" "}
            <code className="text-accent">home_page</code>, <code className="text-accent">about_page</code>,{" "}
            <code className="text-accent">contact_page</code>, and <code className="text-accent">skills_page</code>)
            can be made public. All other setting records remain strictly server-side and are prevented from leaking via public APIs.
          </p>
        </div>
      </div>

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

      {/* Filter and Search Bar */}
      <section className="section-frame rounded-2xl p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Search Input */}
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
            <input
              id={searchInputId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings by key or label..."
              className="w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor={categorySelectId} className="font-mono text-[11px] text-subtle">
              Category:
            </label>
            <select
              id={categorySelectId}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor={visibilitySelectId} className="font-mono text-[11px] text-subtle">
              Visibility:
            </label>
            <select
              id={visibilitySelectId}
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Settings</option>
              <option value="public">Public Only</option>
              <option value="private">Private / Internal Only</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Settings List */}
      <section className="section-frame rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[#233044] pb-4">
          <div className="flex items-center gap-2">
            <IconSettings className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Configured Settings</h2>
            <span className="rounded-full border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[11px] text-muted">
              {totalCount} Total
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="mt-3 text-xs text-muted">Loading site configuration...</p>
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#233044] bg-[#0b0f16]/40 p-12 text-center">
            <IconSettings className="h-8 w-8 text-subtle" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">No Settings Found</h3>
            <p className="mt-1 text-xs text-muted">
              {searchQuery || categoryFilter !== "all" || visibilityFilter !== "all"
                ? "No settings match your active search filters."
                : "No configuration entries found."}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filteredSettings.map((setting) => {
              const isWhitelisted = PUBLIC_SETTING_KEYS.has(setting.key);
              const isToggling = togglingKey === setting.key;

              return (
                <div
                  key={setting.id}
                  className="surface-card flex flex-col justify-between gap-4 rounded-xl border border-[#233044] p-4 transition-colors hover:border-[#2b3a50] sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-accent">
                        {setting.key}
                      </span>
                      <span className="rounded-md border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
                        {setting.category}
                      </span>
                      {setting.is_public ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          PUBLIC
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/40 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          INTERNAL
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-foreground">
                      {setting.label}
                    </h3>

                    {setting.description && (
                      <p className="text-xs text-muted line-clamp-1">
                        {setting.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-subtle font-mono">
                      <span>Updated: {new Date(setting.updated_at).toLocaleString()}</span>
                      {setting.portrait_media && (
                        <span>Portrait: {setting.portrait_media.title}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t border-[#1e293b] pt-3 sm:border-0 sm:pt-0">
                    {/* Visibility Toggle Button */}
                    {isWhitelisted && (
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleVisibility(setting)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                          setting.is_public
                            ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40"
                            : "border-[#2b3a50] bg-[#172130] text-muted hover:text-foreground"
                        }`}
                        title={
                          setting.is_public
                            ? "Click to make this setting private"
                            : "Click to make this setting public"
                        }
                      >
                        {isToggling && (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        )}
                        <span>{setting.is_public ? "Public" : "Make Public"}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDetailSetting(setting)}
                      className="rounded-lg p-1.5 text-muted hover:border-accent hover:bg-accent/10 hover:text-accent"
                      title="Inspect JSON & metadata"
                      aria-label={`View JSON for ${setting.key}`}
                    >
                      <IconEye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(setting)}
                      className="rounded-lg p-1.5 text-muted hover:border-accent hover:bg-accent/10 hover:text-accent"
                      title="Edit setting"
                      aria-label={`Edit ${setting.key}`}
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Details Modal */}
      {detailSetting && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="surface-card w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[#233044] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#233044] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                  Setting Value Inspector
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {detailSetting.label}
                </h3>
                <p className="font-mono text-xs text-muted">{detailSetting.key}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailSetting(null)}
                className="rounded-lg p-1 text-muted hover:text-foreground"
                aria-label="Close dialog"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <span className="font-mono text-[10px] text-subtle">CATEGORY</span>
                  <p className="font-mono text-foreground uppercase">{detailSetting.category}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-subtle">VISIBILITY</span>
                  <p className="font-mono text-foreground">
                    {detailSetting.is_public ? "PUBLIC" : "INTERNAL"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-mono text-[10px] text-subtle">LAST UPDATED</span>
                  <p className="font-mono text-foreground">
                    {new Date(detailSetting.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {detailSetting.description && (
                <div>
                  <span className="font-mono text-[10px] text-subtle">DESCRIPTION</span>
                  <p className="text-foreground">{detailSetting.description}</p>
                </div>
              )}

              {/* Pretty-printed JSON block */}
              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="font-mono text-[10px] text-subtle">STORED JSON VALUE</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        JSON.stringify(detailSetting.value, null, 2)
                      );
                    }}
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="max-h-80 overflow-auto rounded-xl border border-[#233044] bg-[#0b0f16] p-3 font-mono text-[11px] text-emerald-300">
                  {JSON.stringify(detailSetting.value, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailSetting(null)}
                className="rounded-lg border border-[#2b3a50] bg-[#172130] px-4 py-2 text-xs font-medium text-foreground hover:bg-[#1e293b]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="surface-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#233044] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#233044] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                  {formMode === "create" ? "New Site Setting" : "Edit Setting Content"}
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {formMode === "create" ? "Register Site Setting" : label}
                </h3>
                {formMode === "edit" && (
                  <p className="font-mono text-xs text-muted">{key}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1 text-muted hover:text-foreground"
                aria-label="Close dialog"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              {/* Key (Only editable on create) */}
              {formMode === "create" && (
                <div>
                  <label className="block font-medium text-foreground">
                    Setting Key <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value.toLowerCase())}
                    placeholder="e.g. site_general, my_feature_flag"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                  {formErrors.key && (
                    <p className="mt-1 text-[11px] text-red-400">{formErrors.key}</p>
                  )}
                  <p className="mt-1 text-[11px] text-subtle">
                    Lowercase alphanumeric, dash, underscore, and dot only.
                  </p>
                </div>
              )}

              {/* Label & Category */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-medium text-foreground">
                    Display Label <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Global Site Configuration"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                  {formErrors.label && (
                    <p className="mt-1 text-[11px] text-red-400">{formErrors.label}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-foreground">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. general, pages, content"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                  {formErrors.category && (
                    <p className="mt-1 text-[11px] text-red-400">{formErrors.category}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-foreground">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of this setting bundle's purpose..."
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                />
              </div>

              {/* Portrait Media ID */}
              <div>
                <label className="block font-medium text-foreground">
                  Associated Media ID (UUID, optional)
                </label>
                <input
                  type="text"
                  value={portraitMediaId}
                  onChange={(e) => setPortraitMediaId(e.target.value)}
                  placeholder="e.g. 11111111-2222-3333-4444-555555555555"
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                />
                {formErrors.portraitMediaId && (
                  <p className="mt-1 text-[11px] text-red-400">
                    {formErrors.portraitMediaId}
                  </p>
                )}
              </div>

              {/* Value JSON Editor */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-medium text-foreground">
                    Setting Value (JSON Object) <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={formatJsonInput}
                    className="font-mono text-[10px] text-accent hover:underline"
                  >
                    Format JSON
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={valueJson}
                  onChange={(e) => setValueJson(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16] p-3 font-mono text-[11px] text-emerald-300 placeholder:text-subtle focus:border-accent focus:outline-none"
                />
                {formErrors.valueJson && (
                  <p className="mt-1 text-[11px] text-red-400">{formErrors.valueJson}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[#1e293b] pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-[#2b3a50] bg-[#172130] px-4 py-2 text-xs font-medium text-foreground hover:bg-[#1e293b]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/20 px-4 py-2 text-xs font-medium text-accent hover:bg-accent/30 disabled:opacity-50"
                >
                  {isSaving && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  )}
                  <span>{formMode === "create" ? "Create Setting" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
