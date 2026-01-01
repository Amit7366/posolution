"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export function DeleteUnitModal({
  open,
  unitName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  unitName?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-[760px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Yes Delete
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-300">
          <TrashIcon />
        </div>
        <h3 className="text-2xl font-semibold text-slate-100">Delete Unit</h3>
        <p className="text-sm text-slate-300">
          Are you sure you want to delete unit{unitName ? ` “${unitName}”` : ""}?
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
