"use client";


import { Trash2 } from "lucide-react";
import Modal from "../ui/Modal";

export default function DeleteConfirmModal({
  open,
  title = "Delete Sales Return",
  message = "Are you sure you want to delete sales return?",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} widthClassName="max-w-xl">
      <div className="py-4 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-600/15 text-red-500">
          <Trash2 />
        </div>
        <div className="mt-4 text-xl font-semibold text-white">{title}</div>
        <div className="mt-2 text-sm text-white/60">{message}</div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="h-10 rounded-lg bg-[#0b2a44] px-8 text-sm font-semibold text-white hover:opacity-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-10 rounded-lg bg-[#ffa24a] px-8 text-sm font-semibold text-white hover:brightness-110"
          >
            Yes Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
