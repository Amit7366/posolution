"use client";

import { VariantAttribute } from "@/app/types/variant-attribute";
import React from "react";
import { Checkbox } from "../dashboard/ui/Checkbox";
import { formatDate } from "@/app/lib/format";
import { cn } from "@/app/lib/cn";

type TFn = (key: string, vars?: Record<string, string | number>) => string;

export function VariantTable({
  rows,
  selected,
  allSelected,
  someSelected,
  onToggleAll,
  onToggleOne,
  onEdit,
  onAskDelete,
  t,
}: {
  rows: VariantAttribute[];
  selected: Record<string, boolean>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onEdit: (row: VariantAttribute) => void;
  onAskDelete: (row: VariantAttribute) => void;
  t: TFn;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1100px]">
        <thead>
          <tr className="text-left text-sm text-slate-300">
            <th className="w-12 px-5 py-4">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleAll}
                ariaLabel={t("dash.common.selectAll")}
              />
            </th>
            <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.variants.colVariant")}</th>
            <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.common.values")}</th>
            <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.common.createdDate")}</th>
            <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.common.status")}</th>
            <th className="w-40 px-5 py-4 text-right font-semibold text-slate-100"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {rows.map((r) => (
            <tr key={r.id} className="group hover:bg-white/[0.03]">
              <td className="px-5 py-4">
                <Checkbox
                  checked={!!selected[r.id]}
                  onChange={() => onToggleOne(r.id)}
                  ariaLabel={`${t("dash.common.selectRow")} ${r.name}`}
                />
              </td>

              <td className="px-5 py-4 text-sm font-semibold text-slate-100">{r.name}</td>

              <td className="px-5 py-4 text-sm text-slate-400">
                {r.values.join(", ")}
              </td>

              <td className="px-5 py-4 text-sm text-slate-300">{formatDate(r.createdAt)}</td>

              <td className="px-5 py-4">
                <StatusPill status={r.status} t={t} />
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <ActionButton title={t("dash.common.edit")} onClick={() => onEdit(r)}>
                    <EditIcon />
                  </ActionButton>
                  <ActionButton title={t("dash.common.delete")} onClick={() => onAskDelete(r)}>
                    <TrashIcon />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-400">
                {t("dash.variants.noVariantsFound")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status, t }: { status: "Active" | "Inactive"; t: TFn }) {
  const isActive = status === "Active";
  const label = isActive ? t("dash.common.active") : t("dash.common.inactive");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
        isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-300"
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-emerald-400" : "bg-slate-400")} />
      {label}
    </span>
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
