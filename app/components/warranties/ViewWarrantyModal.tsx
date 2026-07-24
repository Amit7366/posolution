"use client";

import type { Warranty } from "@/app/types/warranty";
import { warrantyLabel } from "@/app/lib/warranty-api";
import React from "react";
import { Button } from "../dashboard/ui/Button";
import { Modal } from "../dashboard/ui/Modal";
import { cn } from "@/app/lib/cn";

export function ViewWarrantyModal({
  open,
  row,
  onClose,
  onEdit,
}: {
  open: boolean;
  row: Warranty | null;
  onClose: () => void;
  onEdit: (row: Warranty) => void;
}) {
  if (!open || !row) return null;

  return (
    <Modal
      open={open}
      title="Warranty details"
      onClose={onClose}
      className="max-w-[640px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onEdit(row);
              onClose();
            }}
          >
            Edit
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Name</div>
          <div className="mt-1 text-base font-semibold text-slate-100">{row.name}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</div>
          <p className="mt-1 whitespace-pre-wrap text-slate-200">{row.description || "—"}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Duration</div>
            <div className="mt-1 text-slate-100">{warrantyLabel(row)}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</div>
            <div className="mt-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                  row.status === "Active"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-slate-500/15 text-slate-300"
                )}
              >
                {row.status}
              </span>
            </div>
          </div>
        </div>
        {row.createdAt ? (
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Created</div>
            <div className="mt-1 text-slate-200">{row.createdAt}</div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
