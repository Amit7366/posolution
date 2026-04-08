"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import EditExpiredModal from "./EditExpiredModal";
import type { ExpiredProductRow } from "./types";
import { useDeleteProductMutation, useGetProductsQuery, useUpdateProductMutation } from "@/redux/api/baseApi";
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

function toInputDate(v: unknown): string {
  if (v == null || v === "") return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(v: unknown): string {
  if (v == null || v === "") return "—";
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function mapToRow(p: Record<string, unknown>): ExpiredProductRow {
  const imgs = p.images;
  const imageUrl =
    Array.isArray(imgs) && typeof imgs[0] === "string" && imgs[0].trim() ? imgs[0] : undefined;
  return {
    id: idOfDoc(p),
    sku: String(p.sku ?? ""),
    name: String(p.name ?? ""),
    manufacturedDate: toInputDate(p.manufacturedDate),
    expiryOn: toInputDate(p.expiryOn),
    imageUrl,
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

export default function ExpiredPage() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [editing, setEditing] = useState<ExpiredProductRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

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
    expiredOnly: true,
    sortBy: "expiryOn",
    sortOrder: "asc",
  });

  const total = (listPayload as { meta?: { total?: number } } | undefined)?.meta?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const rows = useMemo(() => listFromPayload(listPayload).map(mapToRow), [listPayload]);

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleSave = useCallback(
    async (payload: {
      id: string;
      name: string;
      sku: string;
      manufacturedDate: string;
      expiryOn: string;
    }) => {
      const body: Record<string, unknown> = {
        name: payload.name,
        sku: payload.sku,
        expiryOn: payload.expiryOn,
      };
      if (payload.manufacturedDate) body.manufacturedDate = payload.manufacturedDate;
      await updateProduct({ id: payload.id, body }).unwrap();
      toast.success(t("dash.expired.productUpdated"));
      void refetch();
    },
    [updateProduct, refetch, t]
  );

  async function handleDelete(row: ExpiredProductRow) {
    if (!confirm(t("dash.expired.confirmDelete", { name: row.name }))) return;
    try {
      await deleteProduct(row.id).unwrap();
      toast.success(t("dash.expired.productDeleted"));
      void refetch();
    } catch (e) {
      toastMutationError(e, t("dash.common.deleteFailed"));
    }
  }

  const errMsg = isError ? getQueryErrorMessage(error) ?? t("dash.expired.failedLoad") : null;

  const startIdx = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, total);

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-200">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t("dash.expired.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("dash.expired.subtitle")}</p>
      </div>

      {errMsg ? (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {errMsg}
        </div>
      ) : null}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder={t("dash.expired.searchPlaceholder")}
              className="w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              title={t("dash.expired.exportPdfTitle")}
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100 transition dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              type="button"
              title={t("dash.expired.exportSheetTitle")}
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100 transition dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
            </button>
            <button
              type="button"
              title={t("dash.common.refresh")}
              onClick={() => void refetch()}
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100 transition dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <RotateCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {(isLoading || isFetching) && !listPayload ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">{t("dash.common.loading")}</div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">{t("dash.expired.colSku")}</th>
                <th className="px-4 py-3 text-left">{t("dash.expired.colProduct")}</th>
                <th className="px-4 py-3 text-left">{t("dash.expired.colMfg")}</th>
                <th className="px-4 py-3 text-left">{t("dash.expired.colExpired")}</th>
                <th className="px-4 py-3 text-right">{t("dash.common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 shrink-0 rounded bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </div>
                      <span className="font-medium truncate text-gray-900 dark:text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {p.manufacturedDate ? formatDisplayDate(p.manufacturedDate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-amber-600 dark:text-amber-300">{formatDisplayDate(p.expiryOn)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="rounded-md border border-gray-300 bg-white p-2 text-orange-500 hover:bg-orange-50 transition dark:border-gray-600 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-gray-700"
                        title={t("dash.common.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(p)}
                        className="rounded-md border border-gray-300 bg-white p-2 text-red-500 hover:bg-red-50 transition dark:border-gray-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                        title={t("dash.common.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    {t("dash.expired.emptyState")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>{t("dash.common.rowsPerPage")}</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
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
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="h-8 min-w-8 px-2 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-semibold">
              {page}
            </span>
            <button
              type="button"
              title={t("dash.common.next")}
              className="rounded-md border border-gray-300 bg-white p-2 text-gray-600 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {editing ? (
        <EditExpiredModal
          product={editing}
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
