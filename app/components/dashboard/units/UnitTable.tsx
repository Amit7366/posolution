"use client";

import { Unit } from "@/app/types/unit";
import React from "react";
import { Checkbox } from "../ui/Checkbox";
import { formatDate } from "@/app/lib/format";
import { cn } from "@/app/lib/cn";

export function UnitTable({
  units,
  selected,
  allSelected,
  someSelected,
  onToggleAll,
  onToggleOne,
  onEdit,
  onAskDelete,
  onOpenSettings,
}: {
  units: Unit[];
  selected: Record<string, boolean>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onEdit: (u: Unit) => void;
  onAskDelete: (u: Unit) => void;
  onOpenSettings: () => void; // gear button
}) {
  return (
    <div className="relative">
      {/* floating gear (like screenshot) */}
      <button
        type="button"
        onClick={onOpenSettings}
        title="Settings"
        className="absolute right-3 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-orange-500 text-white shadow-[0_18px_40px_-22px_rgba(249,115,22,0.95)] transition hover:bg-orange-400 active:translate-y-[1px]"
      >
        <GearIcon />
      </button>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="text-left text-sm text-slate-300">
              <th className="w-12 px-5 py-4">
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onToggleAll} ariaLabel="Select all" />
              </th>
              <th className="px-5 py-4 font-semibold text-slate-100">Unit</th>
              <th className="px-5 py-4 font-semibold text-slate-100">Short name</th>
              <th className="px-5 py-4 font-semibold text-slate-100">No of Products</th>
              <th className="px-5 py-4 font-semibold text-slate-100">Created Date</th>
              <th className="px-5 py-4 font-semibold text-slate-100">Status</th>
              <th className="w-40 px-5 py-4 text-right font-semibold text-slate-100"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {units.map((u) => (
              <tr key={u.id} className="group hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <Checkbox checked={!!selected[u.id]} onChange={() => onToggleOne(u.id)} ariaLabel={`Select ${u.unit}`} />
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-100">{u.unit}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{u.shortName}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{u.productsCount}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-4">
                  <StatusPill status={u.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <ActionButton title="Edit" onClick={() => onEdit(u)}>
                      <EditIcon />
                    </ActionButton>
                    <ActionButton title="Delete" onClick={() => onAskDelete(u)}>
                      <TrashIcon />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}

            {units.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center text-sm text-slate-400">
                  No units found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg bg-[#133b68] text-white transition hover:brightness-110 active:translate-y-[1px]"
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: "Active" | "Inactive" }) {
  const isActive = status === "Active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
        isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-emerald-400" : "bg-slate-400")} />
      {status}
    </span>
  );
}

/* icons */
function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6l1 15h8l1-15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a7.8 7.8 0 0 0 .1-1l2-1.2-2-3.4-2.3.6a8.2 8.2 0 0 0-1.7-1L15 6.2h-6L8.5 9a8.2 8.2 0 0 0-1.7 1L4.5 9.4l-2 3.4L4.5 14a7.8 7.8 0 0 0 0 2l-2 1.2 2 3.4 2.3-.6a8.2 8.2 0 0 0 1.7 1l.5 2.8h6l.5-2.8a8.2 8.2 0 0 0 1.7-1l2.3.6 2-3.4-2-1.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
