"use client";

import { useRef } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(containerRef, open, onCancel);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-xl outline-none"
      >
        <div className="px-5 pt-5">
          <h2 id="confirm-title" className="text-sm font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">{message}</p>
        </div>
        <div className="flex gap-2 px-5 py-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-border/40"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}