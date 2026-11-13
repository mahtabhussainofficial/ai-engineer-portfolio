"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { adminApi, ApiClientError } from "@/lib/admin/api-client";
import type {
  DeleteResponse,
  MediaAssetCreate,
  MediaAssetRead,
  MediaAssetUpdate,
  StorageProvider,
} from "@/lib/admin/types";
import { AdminSectionHeader } from "../components/admin-section-header";
import {
  IconCheck,
  IconClose,
  IconEdit,
  IconEye,
  IconMedia,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShield,
  IconTrash,
} from "../components/admin-icons";

const STORAGE_PROVIDERS: StorageProvider[] = [
  "external",
  "s3",
  "r2",
  "cloudinary",
  "local_public",
];

const MIME_OPTIONS = [
  { label: "All Formats", value: "all" },
  { label: "WebP Image (image/webp)", value: "image/webp" },
  { label: "JPEG Image (image/jpeg)", value: "image/jpeg" },
  { label: "PNG Image (image/png)", value: "image/png" },
  { label: "SVG Vector (image/svg+xml)", value: "image/svg+xml" },
  { label: "PDF Document (application/pdf)", value: "application/pdf" },
];

function formatBytes(bytes?: number | null): string {
  if (bytes === null || bytes === undefined || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAssetRead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [mimeFilter, setMimeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form fields
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [storageProvider, setStorageProvider] = useState<StorageProvider>("external");
  const [storageKey, setStorageKey] = useState("");
  const [url, setUrl] = useState("");
  const [mimeType, setMimeType] = useState("image/webp");
  const [fileSizeBytes, setFileSizeBytes] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");

  // Details Modal state
  const [detailAsset, setDetailAsset] = useState<MediaAssetRead | null>(null);

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetRead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchInputId = useId();
  const providerSelectId = useId();
  const mimeSelectId = useId();

  const loadData = useCallback(
    async (silent = false) => {
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);
      setErrorMessage(null);

      const prov = providerFilter === "all" ? undefined : (providerFilter as StorageProvider);
      const mime = mimeFilter === "all" ? undefined : mimeFilter;

      try {
        const res = await adminApi.listMedia({
          storage_provider: prov,
          mime_type: mime,
          page,
          page_size: 15,
          sort_by: "created_at",
          sort_order: "desc",
        });
        setAssets(res.items);
        setTotalCount(res.total);
        setTotalPages(res.total_pages || 1);
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Failed to load media assets.");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [providerFilter, mimeFilter, page]
  );

  useEffect(() => {
    let isCancelled = false;
    const prov = providerFilter === "all" ? undefined : (providerFilter as StorageProvider);
    const mime = mimeFilter === "all" ? undefined : mimeFilter;

    adminApi
      .listMedia({
        storage_provider: prov,
        mime_type: mime,
        page,
        page_size: 15,
        sort_by: "created_at",
        sort_order: "desc",
      })
      .then((res) => {
        if (!isCancelled) {
          setAssets(res.items);
          setTotalCount(res.total);
          setTotalPages(res.total_pages || 1);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          if (err instanceof ApiClientError) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("Failed to load media assets.");
          }
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [providerFilter, mimeFilter, page]);

  // Client-side text filter for instant search
  const filteredAssets = assets.filter((asset) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      asset.title.toLowerCase().includes(q) ||
      asset.file_name.toLowerCase().includes(q) ||
      (asset.alt_text && asset.alt_text.toLowerCase().includes(q)) ||
      asset.url.toLowerCase().includes(q)
    );
  });

  function openCreateModal() {
    setFormMode("create");
    setActiveId(null);
    setTitle("");
    setFileName("");
    setStorageProvider("external");
    setStorageKey("");
    setUrl("");
    setMimeType("image/webp");
    setFileSizeBytes("");
    setWidth("");
    setHeight("");
    setAltText("");
    setCaption("");
    setFormErrors({});
    setIsFormOpen(true);
  }

  function openEditModal(asset: MediaAssetRead) {
    setFormMode("edit");
    setActiveId(asset.id);
    setTitle(asset.title);
    setFileName(asset.file_name);
    setStorageProvider(asset.storage_provider || "external");
    setStorageKey(asset.storage_key || "");
    setUrl(asset.url);
    setMimeType(asset.mime_type || "image/webp");
    setFileSizeBytes(asset.file_size_bytes !== null && asset.file_size_bytes !== undefined ? String(asset.file_size_bytes) : "");
    setWidth(asset.width !== null && asset.width !== undefined ? String(asset.width) : "");
    setHeight(asset.height !== null && asset.height !== undefined ? String(asset.height) : "");
    setAltText(asset.alt_text || "");
    setCaption(asset.caption || "");
    setFormErrors({});
    setIsFormOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = "Title is required (1-200 characters).";
    }
    if (!fileName.trim()) {
      errors.fileName = "File name is required (e.g. hero-cover.webp).";
    }
    if (!url.trim()) {
      errors.url = "Asset URL is required.";
    } else if (
      !url.startsWith("/") &&
      !url.startsWith("http://") &&
      !url.startsWith("https://")
    ) {
      errors.url = "URL must start with http(s):// or root-relative '/'.";
    }
    if (!mimeType.trim()) {
      errors.mimeType = "MIME type is required (e.g. image/webp, image/jpeg).";
    }
    if (fileSizeBytes.trim()) {
      const parsed = parseInt(fileSizeBytes, 10);
      if (isNaN(parsed) || parsed < 0) {
        errors.fileSizeBytes = "File size must be an integer >= 0 bytes.";
      }
    }
    if (width.trim()) {
      const parsed = parseInt(width, 10);
      if (isNaN(parsed) || parsed <= 0) {
        errors.width = "Width must be a positive integer.";
      }
    }
    if (height.trim()) {
      const parsed = parseInt(height, 10);
      if (isNaN(parsed) || parsed <= 0) {
        errors.height = "Height must be a positive integer.";
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

    const parsedSize = fileSizeBytes.trim() ? parseInt(fileSizeBytes, 10) : undefined;
    const parsedWidth = width.trim() ? parseInt(width, 10) : undefined;
    const parsedHeight = height.trim() ? parseInt(height, 10) : undefined;

    try {
      if (formMode === "create") {
        const payload: MediaAssetCreate = {
          title: title.trim(),
          file_name: fileName.trim(),
          storage_provider: storageProvider,
          storage_key: storageKey.trim() || undefined,
          url: url.trim(),
          mime_type: mimeType.trim(),
          file_size_bytes: parsedSize,
          width: parsedWidth,
          height: parsedHeight,
          alt_text: altText.trim() || undefined,
          caption: caption.trim() || undefined,
        };
        await adminApi.createMedia(payload);
        setSuccessMessage(`Media asset "${title.trim()}" registered successfully.`);
      } else if (activeId) {
        const payload: MediaAssetUpdate = {
          title: title.trim(),
          file_name: fileName.trim(),
          storage_provider: storageProvider,
          storage_key: storageKey.trim() || null,
          url: url.trim(),
          mime_type: mimeType.trim(),
          file_size_bytes: parsedSize ?? null,
          width: parsedWidth ?? null,
          height: parsedHeight ?? null,
          alt_text: altText.trim() || null,
          caption: caption.trim() || null,
        };
        await adminApi.updateMedia(activeId, payload);
        setSuccessMessage(`Media asset "${title.trim()}" updated successfully.`);
      }
      setIsFormOpen(false);
      await loadData(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to save media asset.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res: DeleteResponse = await adminApi.deleteMedia(deleteTarget.id);
      setSuccessMessage(res.message || `Media asset "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      await loadData(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to delete media asset.");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <AdminSectionHeader
        badge="Administration CMS"
        title="Media Assets"
        description="External CDN assets, cover graphics, project deliverables, and image metadata"
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b3a50] bg-[#172130]/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              aria-label="Refresh media list"
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
              <span>New Asset</span>
            </button>
          </div>
        }
      />

      {/* Backend Capability Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs text-foreground">
        <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            Metadata & External CDN Architecture
          </p>
          <p className="text-muted leading-relaxed">
            The backend manages media reference metadata (S3, Cloudflare R2, Cloudinary, external CDN URLs, and local public paths).
            Direct binary multipart uploads are not processed on this endpoint; register hosted asset URLs and accessibility metadata here.
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
          {/* Search Query */}
          <div className="relative sm:col-span-1">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
            <input
              id={searchInputId}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Provider Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor={providerSelectId} className="font-mono text-[11px] text-subtle">
              Provider:
            </label>
            <select
              id={providerSelectId}
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Providers</option>
              {STORAGE_PROVIDERS.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* MIME Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor={mimeSelectId} className="font-mono text-[11px] text-subtle">
              Format:
            </label>
            <select
              id={mimeSelectId}
              value={mimeFilter}
              onChange={(e) => {
                setMimeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {MIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Asset List */}
      <section className="section-frame rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-[#233044] pb-4">
          <div className="flex items-center gap-2">
            <IconMedia className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Registered Assets</h2>
            <span className="rounded-full border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[11px] text-muted">
              {totalCount} Total
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="mt-3 text-xs text-muted">Loading asset library...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#233044] bg-[#0b0f16]/40 p-12 text-center">
            <IconMedia className="h-8 w-8 text-subtle" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">No Media Assets Found</h3>
            <p className="mt-1 text-xs text-muted">
              {searchQuery || providerFilter !== "all" || mimeFilter !== "all"
                ? "No assets match your active filter criteria."
                : "No media records have been registered yet."}
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-3.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/25"
            >
              <IconPlus className="h-3.5 w-3.5" />
              <span>Register First Asset</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="surface-card flex flex-col justify-between rounded-xl border border-[#233044] p-4 transition-colors hover:border-[#2b3a50]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center rounded-md border border-[#2b3a50] bg-[#172130] px-2 py-0.5 font-mono text-[10px] uppercase text-muted">
                      {asset.storage_provider}
                    </span>
                    <span className="font-mono text-[11px] text-subtle">
                      {asset.width && asset.height
                        ? `${asset.width}×${asset.height}`
                        : asset.mime_type.split("/")[1] || asset.mime_type}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-foreground line-clamp-1">
                    {asset.title}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-muted line-clamp-1">
                    {asset.file_name}
                  </p>

                  {asset.alt_text && (
                    <p className="mt-2 text-xs text-subtle line-clamp-2 italic">
                      &quot;{asset.alt_text}&quot;
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-[#1e293b] pt-2 text-[11px] text-subtle">
                    <span>{formatBytes(asset.file_size_bytes)}</span>
                    <span className="font-mono text-[10px]">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-[#1e293b] pt-3">
                  <button
                    type="button"
                    onClick={() => setDetailAsset(asset)}
                    className="rounded-lg p-1.5 text-muted hover:border-accent hover:bg-accent/10 hover:text-accent"
                    title="View details"
                    aria-label={`View details for ${asset.title}`}
                  >
                    <IconEye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(asset)}
                    className="rounded-lg p-1.5 text-muted hover:border-accent hover:bg-accent/10 hover:text-accent"
                    title="Edit metadata"
                    aria-label={`Edit ${asset.title}`}
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(asset)}
                    className="rounded-lg p-1.5 text-muted hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400"
                    title="Delete record"
                    aria-label={`Delete ${asset.title}`}
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-[#233044] pt-4 text-xs">
            <span className="text-subtle">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#2b3a50] bg-[#172130] px-3 py-1 font-mono text-xs text-foreground disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-[#2b3a50] bg-[#172130] px-3 py-1 font-mono text-xs text-foreground disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Details Inspection Modal */}
      {detailAsset && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="surface-card w-full max-w-xl rounded-2xl border border-[#233044] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#233044] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                  Asset Details
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {detailAsset.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailAsset(null)}
                className="rounded-lg p-1 text-muted hover:text-foreground"
                aria-label="Close dialog"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-mono text-[10px] text-subtle">FILE NAME</span>
                <p className="font-mono text-foreground">{detailAsset.file_name}</p>
              </div>

              <div>
                <span className="font-mono text-[10px] text-subtle">TARGET URL / PATH</span>
                <p className="break-all font-mono text-accent">
                  <a
                    href={detailAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {detailAsset.url}
                  </a>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-mono text-[10px] text-subtle">STORAGE PROVIDER</span>
                  <p className="font-mono text-foreground uppercase">{detailAsset.storage_provider}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-subtle">MIME TYPE</span>
                  <p className="font-mono text-foreground">{detailAsset.mime_type}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-subtle">DIMENSIONS</span>
                  <p className="font-mono text-foreground">
                    {detailAsset.width && detailAsset.height
                      ? `${detailAsset.width} × ${detailAsset.height} px`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-subtle">FILE SIZE</span>
                  <p className="font-mono text-foreground">
                    {formatBytes(detailAsset.file_size_bytes)}
                  </p>
                </div>
              </div>

              {detailAsset.alt_text && (
                <div>
                  <span className="font-mono text-[10px] text-subtle">ACCESSIBILITY ALT TEXT</span>
                  <p className="text-foreground">{detailAsset.alt_text}</p>
                </div>
              )}

              {detailAsset.caption && (
                <div>
                  <span className="font-mono text-[10px] text-subtle">CAPTION</span>
                  <p className="text-foreground">{detailAsset.caption}</p>
                </div>
              )}

              {detailAsset.storage_key && (
                <div>
                  <span className="font-mono text-[10px] text-subtle">STORAGE KEY / BUCKET PATH</span>
                  <p className="font-mono text-subtle break-all">{detailAsset.storage_key}</p>
                </div>
              )}

              <div className="border-t border-[#1e293b] pt-3 font-mono text-[11px] text-subtle">
                <p>Record ID: {detailAsset.id}</p>
                <p>Created: {new Date(detailAsset.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(detailAsset.updated_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailAsset(null)}
                className="rounded-lg border border-[#2b3a50] bg-[#172130] px-4 py-2 text-xs font-medium text-foreground hover:bg-[#1e293b]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="surface-card max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#233044] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#233044] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                  {formMode === "create" ? "New Asset Registration" : "Edit Asset Metadata"}
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {formMode === "create" ? "Register Media Record" : title}
                </h3>
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
              {/* Title */}
              <div>
                <label className="block font-medium text-foreground">
                  Asset Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. LLM Serving Benchmark Architecture"
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                />
                {formErrors.title && (
                  <p className="mt-1 text-[11px] text-red-400">{formErrors.title}</p>
                )}
              </div>

              {/* File Name & Storage Provider */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-medium text-foreground">
                    File Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="e.g. architecture-diagram.webp"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                  {formErrors.fileName && (
                    <p className="mt-1 text-[11px] text-red-400">{formErrors.fileName}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-foreground">
                    Storage Provider <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={storageProvider}
                    onChange={(e) => setStorageProvider(e.target.value as StorageProvider)}
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 text-xs text-foreground focus:border-accent focus:outline-none"
                  >
                    {STORAGE_PROVIDERS.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target URL */}
              <div>
                <label className="block font-medium text-foreground">
                  Target URL / Root Path <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://cdn.example.com/assets/arch.webp or /media/cover.webp"
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                />
                {formErrors.url && (
                  <p className="mt-1 text-[11px] text-red-400">{formErrors.url}</p>
                )}
              </div>

              {/* MIME Type & Storage Key */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-medium text-foreground">
                    MIME Type <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={mimeType}
                    onChange={(e) => setMimeType(e.target.value)}
                    placeholder="e.g. image/webp, image/jpeg"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                  {formErrors.mimeType && (
                    <p className="mt-1 text-[11px] text-red-400">{formErrors.mimeType}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-foreground">Storage Key (Optional)</label>
                  <input
                    type="text"
                    value={storageKey}
                    onChange={(e) => setStorageKey(e.target.value)}
                    placeholder="s3-bucket/path/key"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Dimensions & File Size */}
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-medium text-foreground">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="1920"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                  {formErrors.width && (
                    <p className="mt-1 text-[11px] text-red-400">{formErrors.width}</p>
                  )}
                </div>
                <div>
                  <label className="block font-medium text-foreground">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="1080"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                  {formErrors.height && (
                    <p className="mt-1 text-[11px] text-red-400">{formErrors.height}</p>
                  )}
                </div>
                <div>
                  <label className="block font-medium text-foreground">File Size (Bytes)</label>
                  <input
                    type="number"
                    value={fileSizeBytes}
                    onChange={(e) => setFileSizeBytes(e.target.value)}
                    placeholder="254000"
                    className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 font-mono text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                  />
                  {formErrors.fileSizeBytes && (
                    <p className="mt-1 text-[11px] text-red-400">{formErrors.fileSizeBytes}</p>
                  )}
                </div>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block font-medium text-foreground">
                  Accessibility Alt Text (Max 300 chars)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Descriptive text for screen readers..."
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block font-medium text-foreground">
                  Caption (Max 500 chars)
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Display caption or credit..."
                  className="mt-1 w-full rounded-lg border border-[#233044] bg-[#0b0f16]/60 p-2.5 text-xs text-foreground placeholder:text-subtle focus:border-accent focus:outline-none"
                />
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
                  <span>{formMode === "create" ? "Register Asset" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
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
                <h3 className="text-base font-semibold text-foreground">Delete Media Record</h3>
                <p className="text-xs text-muted">This action permanently deletes the metadata record.</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#233044] bg-[#0b0f16]/60 p-3 text-xs">
              <p className="font-semibold text-foreground">{deleteTarget.title}</p>
              <p className="font-mono text-[11px] text-muted">{deleteTarget.file_name}</p>
            </div>

            <p className="mt-3 text-[11px] text-subtle leading-relaxed">
              Note: If this asset is currently referenced by any project cover, certification badge, testimonial avatar, or site setting, the deletion will be safely rejected by the server.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-[#2b3a50] bg-[#172130] px-4 py-2 text-xs font-medium text-foreground hover:bg-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/50 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-900/60 disabled:opacity-50"
              >
                {isDeleting && (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-300 border-t-transparent" />
                )}
                <span>Delete Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}