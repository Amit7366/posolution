"use client";

import { Brand } from "@/app/types/brand";
import React from "react";
import { Checkbox } from "../ui/Checkbox";
import { formatDate } from "@/app/lib/format";
import { cn } from "@/app/lib/cn";

export function BrandTable({
  brands,
  selected,
  onToggleAll,
  allSelected,
  someSelected,
  onToggleOne,
  onEdit,
  onDelete,
}: {
  brands: Brand[];
  selected: Record<string, boolean>;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  onToggleOne: (id: string) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[980px]">
        <thead>
          <tr className="text-left text-sm text-slate-400">
            <th className="w-12 px-5 py-4">
              <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onToggleAll} ariaLabel="Select all" />
            </th>
            <th className="px-5 py-4 font-medium">Brand</th>
            <th className="px-5 py-4 font-medium">Created Date</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="w-40 px-5 py-4 text-right font-medium"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {brands.map((b) => (
            <tr key={b.id} className="group hover:bg-white/[0.03]">
              <td className="px-5 py-4">
                <Checkbox checked={!!selected[b.id]} onChange={() => onToggleOne(b.id)} ariaLabel={`Select ${b.name}`} />
              </td>

              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <LogoChip name={b.name} logoUrl={b.logoUrl} />
                  <span className="text-sm font-semibold text-slate-100">{b.name}</span>
                </div>
              </td>

              <td className="px-5 py-4 text-sm text-slate-300">{formatDate(b.createdAt)}</td>

              <td className="px-5 py-4">
                <StatusPill status={b.status} />
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <ActionButton title="Edit" onClick={() => onEdit(b)}>
                    <EditIcon />
                  </ActionButton>
                  <ActionButton title="Delete" onClick={() => onDelete(b.id)}>
                    <TrashIcon />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}

          {brands.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-14 text-center text-sm text-slate-400">
                No brands found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

function LogoChip({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-white text-xs font-bold text-slate-900 ring-1 ring-white/10">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="h-full w-full object-contain bg-white" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
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
