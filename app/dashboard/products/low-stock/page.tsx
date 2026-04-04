"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, AlertTriangle, Search, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { LowStockProduct } from "./types";
import EditLowStockModal from "./EditLowStockModal";
import { ui } from "./styles";
import { useGetProductsQuery, useUpdateProductMutation } from "@/redux/api/baseApi";
import { useTranslation } from "@/lib/i18n/useTranslation";

function getQueryErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "object" && error !== null && "data" in error) {
    const d = (error as { data?: { message?: string } }).data;
    if (d?.message) return String(d.message);
  }
  if (typeof error === "object" && error !== null && "error" in error) {
    return String((error as { error: string }).error);
  }
  return null;
}

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

function mapToRow(doc: Record<string, unknown>, defaultThreshold: number): LowStockProduct {
  const imgs = doc.images;
  const imageUrl =
    Array.isArray(imgs) && typeof imgs[0] === "string" && imgs[0].trim() ? imgs[0] : undefined;
  const rawTh = doc.lowStockThreshold;
  const lowStockThreshold =
    typeof rawTh === "number" && Number.isFinite(rawTh) ? rawTh : null;

  return {
    id: idOfDoc(doc),
    warehouse: popName(doc.warehouseId),
    store: popName(doc.storeId),
    name: String(doc.name ?? ""),
    imageUrl,
    category: popName(doc.categoryId),
    sku: String(doc.sku ?? ""),
    quantity: typeof doc.quantity === "number" ? doc.quantity : Number(doc.quantity) || 0,
    lowStockThreshold,
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

export default function LowStockPage() {
  const { t } = useTranslation();
  const [listThreshold, setListThreshold] = useState(10);
  const [thresholdDraft, setThresholdDraft] = useState("10");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editing, setEditing] = useState<LowStockProduct | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => {
      const n = Number(thresholdDraft);
      if (Number.isFinite(n) && n >= 0) {
        setListThreshold(Math.floor(n));
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [thresholdDraft]);

  const {
    data: listPayload,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetProductsQuery({
    page,
    limit: perPage,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    lowStockOnly: true,
    stockThreshold: listThreshold,
    sortBy: "quantity",
    sortOrder: "asc",
  });

  const total = (listPayload as { meta?: { total?: number } } | undefined)?.meta?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const rows = useMemo(
    () => listFromPayload(listPayload).map((d) => mapToRow(d, listThreshold)),
    [listPayload, listThreshold]
  );

  const [updateProduct] = useUpdateProductMutation();

  const handleSave = useCallback(
    async (payload: { id: string; quantity: number; lowStockThreshold: number }) => {
      await updateProduct({
        id: payload.id,
        body: { quantity: payload.quantity, lowStockThreshold: payload.lowStockThreshold },
      }).unwrap();
      toast.success(t("dash.lowStock.stockUpdated"));
      void refetch();
    },
    [updateProduct, refetch, t]
  );

  const errMsg = isError ? getQueryErrorMessage(error) ?? t("dash.lowStock.failedLoad") : null;

  const startIdx = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, total);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0c0c0c] to-black p-6 text-slate-200">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="text-orange-500" />
          {t("dash.lowStock.title")}
        </h1>
        <p className="text-sm text-slate-400">{t("dash.lowStock.subtitle")}</p>
      </div>

      {errMsg ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errMsg}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">{t("dash.lowStock.thresholdLabel")}</label>
          <input
            type="number"
            min={0}
            value={thresholdDraft}
            onChange={(e) => setThresholdDraft(e.target.value)}
            className="w-28 rounded-md bg-black/60 border border-white/10 px-3 py-2 text-sm"
          />
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder={t("dash.lowStock.searchPlaceholder")}
            className="w-full rounded-md bg-black/60 pl-9 pr-3 py-2 text-sm border border-white/10 focus:border-orange-500/50 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/60 px-3 py-2 text-sm hover:bg-white/10"
        >
          <RotateCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {t("dash.common.refresh")}
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur overflow-x-auto">
        {(isLoading || isFetching) && !listPayload ? (
          <div className="p-8 text-center text-sm text-slate-400">{t("dash.common.loading")}</div>
        ) : null}

        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">{t("dash.stock.colWarehouse")}</th>
              <th className="px-4 py-3 text-left">{t("dash.stock.colStore")}</th>
              <th className="px-4 py-3 text-left">{t("dash.stock.colProduct")}</th>
              <th className="px-4 py-3 text-left">{t("dash.stock.colCategory")}</th>
              <th className="px-4 py-3 text-left">{t("dash.stock.colSku")}</th>
              <th className="px-4 py-3 text-left">{t("dash.common.colQty")}</th>
              <th className="px-4 py-3 text-left">{t("dash.lowStock.colAlert")}</th>
              <th className="px-4 py-3 text-right">{t("dash.stock.colAction")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-4 py-3 text-slate-300">{p.warehouse}</td>
                <td className="px-4 py-3 text-slate-300">{p.store}</td>
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 shrink-0 rounded bg-white/10 overflow-hidden flex items-center justify-center">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-500">—</span>
                      )}
                    </div>
                    <span className="truncate">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{p.category}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3">
                  <span className="text-red-400 font-semibold">{p.quantity}</span>
                </td>
                <td className="px-4 py-3 text-orange-400">
                  {p.lowStockThreshold ?? listThreshold}
                  {p.lowStockThreshold == null ? (
                    <span className="ml-1 text-xs text-slate-500">{t("dash.lowStock.defaultSuffix")}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className={ui.actionBtn}
                    title={t("dash.lowStock.editTitle")}
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  {t("dash.lowStock.emptyState")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-white/10 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span>{t("dash.common.rowsPerPage")}</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md bg-black/60 border border-white/10 px-2 py-1.5 text-slate-200"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>{t("dash.common.rangePage", { start: startIdx, end: endIdx, total })}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title={t("dash.common.previous")}
              className="rounded-md border border-white/10 bg-black/60 p-2 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="h-8 min-w-8 px-2 rounded-full bg-orange-500 text-black flex items-center justify-center text-xs font-semibold">
              {page}
            </span>
            <button
              type="button"
              title={t("dash.common.next")}
              className="rounded-md border border-white/10 bg-black/60 p-2 disabled:opacity-40"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {editing ? (
        <EditLowStockModal
          product={editing}
          defaultThreshold={listThreshold}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            try {
              await handleSave(payload);
            } catch (e) {
              toastMutationError(e, t("dash.common.updateFailed"));
              throw e;
            }
          }}
        />
      ) : null}
    </div>
  );
}
