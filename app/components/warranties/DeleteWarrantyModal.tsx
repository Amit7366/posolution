"use client";

import React from "react";
import { Modal } from "../dashboard/ui/Modal";
import { Button } from "../dashboard/ui/Button";

export function DeleteWarrantyModal({
  open,
  onClose,
  onConfirm,
  isDeleting,
  itemName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
  itemName?: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-[780px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void onConfirm()} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Yes, delete"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-300">
          <TrashIcon />
        </div>
        <h3 className="text-2xl font-semibold text-slate-100">Delete warranty</h3>
        <p className="text-sm text-slate-300 max-w-md">
          {itemName
            ? `Are you sure you want to delete “${itemName}”? This cannot be undone.`
            : "Are you sure you want to delete this warranty? This cannot be undone."}
        </p>
      </div>
    </Modal>
  );
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6l1 15h8l1-15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
