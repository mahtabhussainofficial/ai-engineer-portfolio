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
        <p className="text-xs text-zinc-400 leading-relaxed">{message}</p>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-[#181a20] pt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-lg border border-[#222530] bg-[#101218] px-4 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
              isDestructive
                ? "border border-red-500/40 bg-red-950/40 text-red-200 hover:bg-red-900/50"
                : "border border-[#c4f042]/40 bg-[#c4f042] text-black font-semibold hover:bg-[#d4f55e]"
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
