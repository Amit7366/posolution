"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Pencil,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import { cn } from "@/app/lib/cn";
import {
  useGetProductsQuery,
  useGetStoresQuery,
  useGetWarehousesQuery,
  useUpdateProductMutation,
} from "@/redux/api/baseApi";
import { StockRow, UpdateStockModal } from "./UpdateStockModal";
import { useTranslation } from "@/lib/i18n/useTranslation";

function listFromPayload(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as { data?: unknown };
  const d = p.data;
  if (Array.isArray(d)) return d as Record<string, unknown>[];
  if (d && typeof d === "object" && "data" in (d as object)) {
    const inner = (d as { data?: unknown }).data;
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
  }
  return [];
}

function idOfDoc(doc: Record<string, unknown>): string {
  const raw = doc._id ?? doc.id;
  if (typeof raw === "object" && raw !== null && "toString" in raw) {
    return String((raw as { toString(): string }).toString());
  }
  return String(raw ?? "");
}

function popName(ref: unknown): string {
  if (!ref) return "—";
  if (typeof ref === "object" && ref !== null) {
    const o = ref as { name?: string; subCategoryName?: string };
    return String(o.name ?? o.subCategoryName ?? "—");
  }
  return "—";
}

function formatUpdatedAt(v: unknown): string {
  if (v == null) return "—";
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapDocToRow(doc: Record<string, unknown>): StockRow {
  const imgs = doc.images;
  const imageUrl =
    Array.isArray(imgs) && typeof imgs[0] === "string" && imgs[0].trim() ? imgs[0] : undefined;
  return {
    id: idOfDoc(doc),
    warehouse: popName(doc.warehouseId),
    store: popName(doc.storeId),
    name: String(doc.name ?? ""),
    sku: String(doc.sku ?? ""),
    category: popName(doc.categoryId),
    quantity: typeof doc.quantity === "number" ? doc.quantity : Number(doc.quantity) || 0,
    imageUrl,
    updatedLabel: formatUpdatedAt(doc.updatedAt),
  };
}

function toastMutationError(e: unknown, fallback: string) {
  const data = (e as { data?: { message?: string; errorSources?: { path: string; message: string }[] } })
    ?.data;
  const msg = data?.message;
  const details = data?.errorSources?.length
    ? data.errorSources.map((s) => `${s.path}: ${s.message}`).join(", ")
    : undefined;
  toast.error(details ? `${msg ?? fallback} (${details})` : msg ?? fallback);
}

function downloadCsv(
  rows: StockRow[],
  filename: string,
  headers: [string, string, string, string, string, string, string]
) {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.warehouse, r.store, r.name, r.sku, r.category, String(r.quantity), r.updatedLabel]
        .map((c) => esc(String(c)))
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([lines], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StockPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [productId, setProductId] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState<StockRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: whPayload } = useGetWarehousesQuery({ page: 1, limit: 200 });
  const warehouses = useMemo(() => {
    const raw = (whPayload as { data?: unknown } | undefined)?.data;
    return Array.isArray(raw) ? (raw as { _id?: string; name?: string }[]) : [];
  }, [whPayload]);

  const { data: stPayload } = useGetStoresQuery({ page: 1, limit: 200 });
  const stores = useMemo(() => {
    const raw = (stPayload as { data?: unknown } | undefined)?.data;
    return Array.isArray(raw)
      ? (raw as { _id?: string; name?: string; warehouseId?: unknown }[])
      : [];
  }, [stPayload]);

  const { data: productPickPayload } = useGetProductsQuery({
    page: 1,
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });
  const productOptions = useMemo(() => listFromPayload(productPickPayload), [productPickPayload]);

  const storeOptions = useMemo(() => {
    if (!warehouseId) return stores;
    return stores.filter((s) => {
      const wid = s.warehouseId;
      const id =
        typeof wid === "object" && wid !== null && "toString" in wid
          ? String((wid as { toString(): string }).toString())
          : String(wid ?? "");
      return id === warehouseId;
    });
  }, [stores, warehouseId]);

  useEffect(() => {
    if (!storeId) return;
    if (!storeOptions.some((s) => String(s._id) === storeId)) setStoreId("");
  }, [storeOptions, storeId]);

  const {
    data: listPayload,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetProductsQuery({
    page,
    limit: rowsPerPage,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(warehouseId ? { warehouseId } : {}),
    ...(storeId ? { storeId } : {}),
    ...(productId ? { productId } : {}),
    sortBy: "name",
    sortOrder: "asc",
  });

  const total = (listPayload as { meta?: { total?: number } } | undefined)?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const rows = useMemo(() => listFromPayload(listPayload).map(mapDocToRow), [listPayload]);

  const [updateProduct] = useUpdateProductMutation();

  const errMsg = isError
    ? (error as { data?: { message?: string } })?.data?.message || t("dash.stock.failedLoad")
    : null;

  const startIdx = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endIdx = Math.min(page * rowsPerPage, total);

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t("dash.stock.title")}</h1>
            <p className="mt-1 text-sm text-slate-400">{t("dash.stock.subtitle")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TopIconButton
              title={t("dash.common.exportCsv")}
              onClick={() =>
                downloadCsv(rows, "stock.csv", [
                  t("dash.stock.colWarehouse"),
                  t("dash.stock.colStore"),
                  t("dash.stock.colProduct"),
                  t("dash.stock.colSku"),
                  t("dash.stock.colCategory"),
                  t("dash.stock.colQty"),
                  t("dash.stock.colUpdated"),
                ])
              }
            >
              <FileSpreadsheet className="h-[18px] w-[18px]" />
            </TopIconButton>
            <TopIconButton title={t("dash.common.print")} onClick={() => window.print()}>
              <FileText className="h-[18px] w-[18px]" />
            </TopIconButton>
            <TopIconButton title={t("dash.common.refresh")} onClick={() => void refetch()}>
              <RotateCcw className={cn("h-[18px] w-[18px]", isFetching && "animate-spin")} />
            </TopIconButton>
            <TopIconButton title={t("dash.common.collapse")} onClick={() => setCollapsed((s) => !s)}>
              <ChevronDown
                className={cn("h-[18px] w-[18px] transition-transform", collapsed && "-rotate-180")}
              />
            </TopIconButton>
            <Link
              href="/dashboard/products/create"
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] transition hover:bg-orange-400"
            >
              <Plus className="h-4 w-4" />
              {t("dash.stock.addProduct")}
            </Link>
          </div>
        </div>

        {errMsg ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errMsg}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
                placeholder={t("dash.stock.searchPlaceholder")}
                className="w-full rounded-xl border border-white/10 bg-[#0b0f14] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                label={t("dash.stock.warehouse")}
                value={warehouseId || "All"}
                onChange={(v) => {
                  setWarehouseId(v === "All" ? "" : v);
                  setStoreId("");
                  setPage(1);
                }}
                options={[
                  { value: "All", label: t("dash.stock.allWarehouses") },
                  ...warehouses.map((w) => ({ value: String(w._id), label: w.name ?? "—" })),
                ]}
              />
              <FilterSelect
                label={t("dash.stock.store")}
                value={storeId || "All"}
                onChange={(v) => {
                  setStoreId(v === "All" ? "" : v);
                  setPage(1);
                }}
                options={[
                  { value: "All", label: t("dash.stock.allStores") },
                  ...storeOptions.map((s) => ({ value: String(s._id), label: s.name ?? "—" })),
                ]}
              />
              <FilterSelect
                label={t("dash.stock.product")}
                value={productId || "All"}
                onChange={(v) => {
                  setProductId(v === "All" ? "" : v);
                  setPage(1);
                }}
                options={[
                  { value: "All", label: t("dash.stock.allProducts") },
                  ...productOptions.map((p) => ({
                    value: idOfDoc(p as Record<string, unknown>),
                    label: String((p as { name?: string }).name ?? "—"),
                  })),
                ]}
              />
            </div>
          </div>

          {(isLoading || isFetching) && !listPayload ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">{t("dash.common.loading")}</div>
          ) : null}

          {!collapsed && (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                    <tr className="text-left text-slate-300 border-b border-white/10">
                      <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.stock.colWarehouse")}</th>
                      <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.stock.colStore")}</th>
                      <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.stock.colProduct")}</th>
                      <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.stock.colSku")}</th>
                      <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.stock.colCategory")}</th>
                      <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.stock.colQty")}</th>
                      <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.stock.colUpdated")}</th>
                      <th className="px-5 py-4 text-right font-semibold text-slate-100">{t("dash.stock.colAction")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-4 text-slate-300">{r.warehouse}</td>
                        <td className="px-5 py-4 text-slate-400">{r.store}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-xs font-bold text-slate-900 ring-1 ring-white/10">
                              {r.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={r.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                r.name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((w) => w[0]?.toUpperCase())
                                  .join("")
                              )}
                            </div>
                            <span className="font-semibold text-slate-100 truncate">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">{r.sku}</td>
                        <td className="px-5 py-4 text-slate-400">{r.category}</td>
                        <td className="px-5 py-4 font-semibold text-orange-300">{r.quantity}</td>
                        <td className="px-5 py-4 text-slate-500 text-xs">{r.updatedLabel}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            title={t("dash.stock.updateQty")}
                            onClick={() => setEditing(r)}
                            className="inline-grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/20 text-white hover:bg-white/[0.06]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && rows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-14 text-center text-slate-400">
                          {t("dash.stock.noMatch")}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{t("dash.common.rowsPerPage")}</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(1);
                    }}
                    className="rounded-lg border border-white/10 bg-[#0b0f14] px-2 py-1.5 text-slate-200 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span>{t("dash.stock.rangeOf", { start: startIdx, end: endIdx, total })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PageNavButton disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </PageNavButton>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                    {page}
                  </span>
                  <PageNavButton
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </PageNavButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <UpdateStockModal
        open={!!editing}
        row={editing}
        onClose={() => setEditing(null)}
        onSave={async ({ id, quantity }) => {
          try {
            await updateProduct({ id, body: { quantity } }).unwrap();
            toast.success(t("dash.stock.stockUpdated"));
            void refetch();
          } catch (e) {
            toastMutationError(e, t("dash.common.updateFailed"));
            throw e;
          }
        }}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-white/10 bg-[#0b0f14] px-3 pr-9 text-sm font-medium text-slate-100 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function TopIconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06]"
    >
      {children}
    </button>
  );
}

function PageNavButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.06]",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      {children}
    </button>
  );
}
