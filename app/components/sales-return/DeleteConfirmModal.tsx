"use client";

import { Trash2 } from "lucide-react";
import Modal from "../ui/Modal";

export default function DeleteConfirmModal({
  open,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} widthClassName="max-w-xl">
      <div className="py-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-500 dark:bg-red-600/15">
          <Trash2 />
        </div>
        <div className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{title}</div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-gray-300 bg-white px-8 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="h-10 rounded-lg bg-orange-500 px-8 text-sm font-semibold text-white hover:bg-orange-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
