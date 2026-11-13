"use client";

import { AdminModal } from "./admin-modal";
import { IconTrash } from "./admin-icons";

interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  isDestructive = true,
  isLoading = false,
}: AdminConfirmDialogProps) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-muted leading-relaxed">{message}</p>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-[#1e293b] pt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-lg border border-[#2b3a50] bg-[#172130]/60 px-4 py-2 text-xs font-medium text-muted transition-colors hover:border-[#3b4c65] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
              isDestructive
                ? "border border-red-500/40 bg-red-950/40 text-red-200 hover:bg-red-900/50 focus-visible:outline-red-500"
                : "border border-accent/40 bg-accent/20 text-accent hover:bg-accent/30 focus-visible:outline-accent"
            }`}
          >
            {isDestructive && <IconTrash className="h-3.5 w-3.5" />}
            <span>{isLoading ? "Processing..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
