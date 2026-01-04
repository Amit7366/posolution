"use client";

import { Person, Product, Stock, Store, Warehouse } from "@/app/types/stock";
import React from "react";
import { Checkbox } from "../dashboard/ui/Checkbox";
import { formatDate } from "@/app/lib/format";


function ProductIcon({ name, iconUrl }: { name: string; iconUrl?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white text-xs font-bold text-slate-900 ring-1 ring-white/10">
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconUrl} alt={name} className="h-full w-full object-contain bg-white" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function PersonAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white/10 text-xs font-bold text-slate-100 ring-1 ring-white/10">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export function StockTable({
  rows,
  warehouses,
  stores,
  products,
  people,
  selected,
  allSelected,
  someSelected,
  onToggleAll,
  onToggleOne,
  onEdit,
  onAskDelete,
}: {
  rows: Stock[];
  warehouses: Warehouse[];
  stores: Store[];
  products: Product[];
  people: Person[];
  selected: Record<string, boolean>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onEdit: (row: Stock) => void;
  onAskDelete: (row: Stock) => void;
}) {
  const wMap = new Map(warehouses.map((w) => [w.id, w]));
  const sMap = new Map(stores.map((s) => [s.id, s]));
  const pMap = new Map(products.map((p) => [p.id, p]));
  const peMap = new Map(people.map((p) => [p.id, p]));

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[1300px]">
        <thead>
          <tr className="text-left text-sm text-slate-300">
            <th className="w-12 px-5 py-4">
              <Checkbox checked={allSelected} indeterminate={someSelected} onChange={onToggleAll} ariaLabel="Select all" />
            </th>
            <th className="px-5 py-4 font-semibold text-slate-100">Warehouse</th>
            <th className="px-5 py-4 font-semibold text-slate-100">Store</th>
            <th className="px-5 py-4 font-semibold text-slate-100">Product</th>
            <th className="px-5 py-4 font-semibold text-slate-100">Date</th>
            <th className="px-5 py-4 font-semibold text-slate-100">Person</th>
            <th className="px-5 py-4 font-semibold text-slate-100">Qty</th>
            <th className="w-40 px-5 py-4 text-right font-semibold text-slate-100"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {rows.map((r) => {
            const w = wMap.get(r.warehouseId);
            const s = sMap.get(r.storeId);
            const p = pMap.get(r.productId);
            const pe = peMap.get(r.personId);

            return (
              <tr key={r.id} className="hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <Checkbox checked={!!selected[r.id]} onChange={() => onToggleOne(r.id)} ariaLabel="Select row" />
                </td>

                <td className="px-5 py-4 text-sm text-slate-300">{w?.name ?? "-"}</td>
                <td className="px-5 py-4 text-sm text-slate-400">{s?.name ?? "-"}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ProductIcon name={p?.name ?? "Product"} iconUrl={p?.iconUrl} />
                    <div className="text-sm font-semibold text-slate-100">{p?.name ?? "-"}</div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-300">{formatDate(r.date)}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <PersonAvatar name={pe?.name ?? "Person"} avatarUrl={pe?.avatarUrl} />
                    <div className="text-sm font-semibold text-slate-100">{pe?.name ?? "-"}</div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-400">{r.qty}</td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <ActionButton title="Edit" onClick={() => onEdit(r)}>
                      <EditIcon />
                    </ActionButton>
                    <ActionButton title="Delete" onClick={() => onAskDelete(r)}>
                      <TrashIcon />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-5 py-14 text-center text-sm text-slate-400">
                No stock found.
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
      className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/20 text-white transition hover:bg-white/[0.06] active:translate-y-[1px]"
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
