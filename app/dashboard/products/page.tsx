"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteProductMutation,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useGetProductsQuery,
} from "@/redux/api/baseApi";
import { useTranslation } from "@/lib/i18n/useTranslation";

type ListRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  unit: string;
  qty: number;
  createdBy: string;
  img?: string;
  description?: string;
};

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

function toastMutationError(e: unknown, fallback: string) {
  const data = (e as { data?: { message?: string; errorSources?: { path: string; message: string }[] } })
    ?.data;
  const msg = data?.message;
  const details = data?.errorSources?.length
    ? data.errorSources.map((s) => `${s.path}: ${s.message}`).join(", ")
    : undefined;
  toast.error(details ? `${msg ?? fallback} (${details})` : msg ?? fallback);
}

function popName(ref: unknown): string {
  if (!ref) return "—";
  if (typeof ref === "object" && ref !== null) {
    const o = ref as { name?: string; subCategoryName?: string };
    return String(o.name ?? o.subCategoryName ?? "—");
  }
  return "—";
}

function popWarranty(ref: unknown): string {
  if (!ref) return "—";
  if (typeof ref === "object" && ref !== null) {
    const o = ref as { name?: string; duration?: number; period?: string };
    const name = o.name ?? "—";
    if (typeof o.duration === "number" && o.period) {
      return `${name} (${o.duration} ${o.period})`;
    }
    return String(name);
  }
  return "—";
}

function popUnit(ref: unknown): string {
  if (!ref) return "—";
  if (typeof ref === "object" && ref !== null) {
    const o = ref as { shortName?: string; name?: string };
    return String(o.shortName || o.name || "—");
  }
  return "—";
}

function createdByLabel(ref: unknown): string {
  if (!ref) return "—";
  if (typeof ref === "object" && ref !== null) {
    const u = ref as { username?: string; email?: string };
    return String(u.username || u.email || "—");
  }
  return "—";
}

function formatDetailDate(v: unknown): string {
  if (v == null) return "—";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  if (!s) return "—";
  return s.slice(0, 10);
}

function imageUrlList(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function variantAttrName(v: Record<string, unknown>): string {
  const a = v.attributeId;
  if (a && typeof a === "object" && "name" in a) {
    return String((a as { name?: string }).name ?? "—");
  }
  return "—";
}

function mapProductToRow(p: Record<string, unknown>): ListRow {
  const rawId = p._id ?? p.id;
  const id =
    typeof rawId === "object" && rawId !== null && "toString" in rawId
      ? String((rawId as { toString(): string }).toString())
      : String(rawId ?? "");

  const imgs = p.images;
  const img =
    Array.isArray(imgs) && typeof imgs[0] === "string" ? imgs[0] : undefined;

  return {
    id,
    sku: String(p.sku ?? ""),
    name: String(p.name ?? ""),
    category: popName(p.categoryId),
    brand: popName(p.brandId),
    price: typeof p.price === "number" ? p.price : Number(p.price) || 0,
    unit: popUnit(p.unitId),
    qty: typeof p.quantity === "number" ? p.quantity : Number(p.quantity) || 0,
    createdBy: createdByLabel(p.createdBy),
    img,
    description: typeof p.description === "string" ? p.description : undefined,
  };
}

const currency = (n: number) => `$${n.toLocaleString()}`;

export default function ProductListPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: catPayload } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const { data: brandPayload } = useGetBrandsQuery({
    page: 1,
    limit: 200,
    search: "",
    status: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const categories = useMemo(() => {
    const raw = catPayload?.data;
    return Array.isArray(raw) ? raw : [];
  }, [catPayload]);

  const brands = useMemo(() => {
    const raw = brandPayload?.data;
    return Array.isArray(raw) ? raw : [];
  }, [brandPayload]);

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
    search: debouncedQuery,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brandId ? { brandId } : {}),
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const total = listPayload?.meta?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const products = useMemo(() => {
    const raw = listPayload?.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((r) => mapProductToRow(r as Record<string, unknown>));
  }, [listPayload]);

  const {
    data: detailPayload,
    isFetching: detailFetching,
    isError: detailError,
    error: detailErr,
  } = useGetProductByIdQuery(viewingId!, {
    skip: !viewingId,
  });

  /** Only use detail when a row is open — RTK keeps cached `data` after close, which kept the modal stuck open */
  const viewing =
    viewingId && detailPayload
      ? ((detailPayload as { data?: Record<string, unknown> }).data as Record<string, unknown> | undefined)
      : undefined;

  const [deleteProduct] = useDeleteProductMutation();

  function toggleSelectAll(checked: boolean) {
    const newSel: Record<string, boolean> = {};
    if (checked) {
      products.forEach((p) => {
        newSel[p.id] = true;
      });
    }
    setSelectedIds(newSel);
  }

  function toggleRow(id: string) {
    setSelectedIds((s) => ({ ...s, [id]: !s[id] }));
  }

  async function handleDelete(id: string) {
    if (!confirm(t("productsList.confirmDeleteOne"))) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success(t("productsList.toastProductDeleted"));
      setViewingId(null);
      refetch();
    } catch (e) {
      toastMutationError(e, t("productsList.toastDeleteFailed"));
    }
  }

  async function handleBulkDelete() {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) {
      toast.error(t("productsList.toastNoRowsSelected"));
      return;
    }
    if (!confirm(t("productsList.confirmBulkDelete", { count: ids.length }))) return;
    try {
      await Promise.all(ids.map((id) => deleteProduct(id).unwrap()));
      toast.success(t("productsList.toastProductsDeleted"));
      setSelectedIds({});
      refetch();
    } catch (e) {
      toastMutationError(e, t("productsList.toastBulkDeleteFailed"));
    }
  }

  function handleExportCSV() {
    const header = ["sku", "name", "category", "brand", "price", "unit", "qty", "createdBy"].join(",");
    const rows = products.map((p) =>
      [p.sku, p.name, p.category, p.brand, p.price, p.unit, p.qty, p.createdBy].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.info(t("productsList.toastImportNotWired", { name: file.name }));
    e.currentTarget.value = "";
  }

  const gotoPage = (p: number) => setPage(Math.min(Math.max(1, p), pages));

  const errMsg = isError
    ? (getQueryErrorMessage(error) ?? t("productsList.errFailedLoadProducts"))
    : null;
  const startIdx = total === 0 ? 0 : (page - 1) * perPage + 1;
  const endIdx = Math.min(page * perPage, total);

  return (
    <div className="relative p-6">
      {(isLoading || isFetching) && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/40 dark:bg-slate-900/40" />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t("productsList.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">{t("productsList.subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded text-sm shadow-sm hover:shadow focus:outline-none dark:bg-slate-700 dark:border-slate-600"
          >
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8 17l-4-4h3V7h2v6h3l-4 4z" />
            </svg>
            <span className="hidden sm:inline">{t("productsList.export")}</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded text-sm shadow-sm cursor-pointer hover:shadow dark:bg-slate-700 dark:border-slate-600">
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2v10l3-3 5 5V2z" />
            </svg>
            <input type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />
            <span className="hidden sm:inline">{t("productsList.importProduct")}</span>
          </label>

          <Link
            href="/dashboard/products/create"
            className="px-4 py-2 bg-orange-500 text-white rounded text-sm shadow-sm hover:bg-orange-600"
          >
            {t("productsList.addProduct")}
          </Link>
        </div>
      </div>

      {errMsg ? (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errMsg}
        </div>
      ) : null}

      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 border rounded p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 w-full md:w-1/2">
            <div className="relative w-full">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t("productsList.searchPlaceholder")}
                className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
              <svg
                className="w-4 h-4 absolute right-3 top-2.5 text-slate-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 21l-4.35-4.35" />
                <path d="M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="border px-3 py-2 rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="">{t("productsList.allCategories")}</option>
              {categories.map((c: { _id?: string; name?: string }) => (
                <option key={String(c._id)} value={String(c._id)}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={brandId}
              onChange={(e) => {
                setBrandId(e.target.value);
                setPage(1);
              }}
              className="border px-3 py-2 rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="">{t("productsList.allBrands")}</option>
              {brands.map((b: { _id?: string; name?: string }) => (
                <option key={String(b._id)} value={String(b._id)}>
                  {b.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | "active" | "inactive");
                setPage(1);
              }}
              className="border px-3 py-2 rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="all">{t("productsList.allStatus")}</option>
              <option value="active">{t("productsList.statusActive")}</option>
              <option value="inactive">{t("productsList.statusInactive")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-auto border-collapse">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-300">
                <th className="p-3 pr-6 w-12">
                  <input
                    type="checkbox"
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    checked={
                      products.length > 0 && products.every((p) => selectedIds[p.id])
                    }
                  />
                </th>
                <th className="p-3">{t("productsList.colSku")}</th>
                <th className="p-3">{t("productsList.colProductName")}</th>
                <th className="p-3">{t("productsList.colCategory")}</th>
                <th className="p-3">{t("productsList.colBrand")}</th>
                <th className="p-3">{t("productsList.colPrice")}</th>
                <th className="p-3">{t("productsList.colUnit")}</th>
                <th className="p-3">{t("productsList.colQty")}</th>
                <th className="p-3">{t("productsList.colCreatedBy")}</th>
                <th className="p-3 w-40 text-right">{t("productsList.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-500 dark:text-slate-300">
                    {t("productsList.noProductsFound")}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="p-3 pr-6">
                      <input
                        type="checkbox"
                        checked={!!selectedIds[p.id]}
                        onChange={() => toggleRow(p.id)}
                      />
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-100">{p.sku}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs text-slate-700 dark:text-slate-100">
                          {p.img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.img} alt="" className="h-full w-full object-cover" />
                          ) : (
                            p.name
                              .split(" ")
                              .slice(0, 2)
                              .map((s) => s[0])
                              .join("")
                          )}
                        </div>
                        <div className="text-slate-700 dark:text-slate-100">{p.name}</div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{p.brand}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-100">{currency(p.price)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{p.unit}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-100">{p.qty}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-100">{p.createdBy}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingId(p.id)}
                          className="p-2 rounded border bg-white dark:bg-slate-700 dark:border-slate-600"
                          title={t("productsList.actionView")}
                        >
                          <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7z" />
                            <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                          </svg>
                        </button>
                        <Link
                          href={`/dashboard/products/create?id=${p.id}`}
                          className="p-2 rounded border bg-white dark:bg-slate-700 dark:border-slate-600 inline-block"
                          title={t("productsList.actionEdit")}
                        >
                          <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded border bg-white dark:bg-slate-700 dark:border-slate-600"
                          title={t("productsList.actionDelete")}
                        >
                          <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">{t("productsList.rowPerPage")}</div>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border px-2 py-1 rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <div className="text-sm text-slate-600 dark:text-slate-300">{t("productsList.entries")}</div>

            <div className="ml-4">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1 border rounded text-sm bg-white dark:bg-slate-700"
              >
                {t("productsList.deleteSelected")}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">
              {t("productsList.paginationRange", { start: startIdx, end: endIdx, total })}
            </div>

            <nav className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => gotoPage(page - 1)}
                className="p-2 rounded border bg-white dark:bg-slate-700"
                disabled={page === 1}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const start = Math.max(1, Math.min(pages - 4, page - 2));
                return start + i;
              }).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => gotoPage(pNum)}
                  className={`px-3 py-1 rounded ${
                    pNum === page ? "bg-orange-500 text-white" : "bg-white dark:bg-slate-700 border"
                  }`}
                >
                  {pNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => gotoPage(page + 1)}
                className="p-2 rounded border bg-white dark:bg-slate-700"
                disabled={page === pages}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {viewingId ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-view-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label={t("productsList.closeDialog")}
            onClick={() => setViewingId(null)}
          />
          <div
            className="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b dark:border-slate-700 flex items-start justify-between gap-3 sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div className="min-w-0">
                <h3
                  id="product-view-title"
                  className="text-lg font-medium text-slate-900 dark:text-slate-100 truncate"
                >
                  {viewing ? String(viewing.name ?? "") : t("productsList.productFallback")}
                </h3>
                {viewing ? (
                  <div className="text-sm text-slate-500 dark:text-slate-300">
                    {t("productsList.labelSku")}: {String(viewing.sku ?? "")} · {t("productsList.labelSlug")}:{" "}
                    {String(viewing.slug ?? "—")}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setViewingId(null)}
                className="shrink-0 px-3 py-2 rounded-md border bg-white dark:bg-slate-700 dark:border-slate-600 text-sm hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                {t("productsList.close")}
              </button>
            </div>

            <div className="p-4">
              {detailFetching && !viewing ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                  {t("productsList.loading")}
                </p>
              ) : detailError ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    {getQueryErrorMessage(detailErr) ?? t("productsList.errFailedLoadProducts")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewingId(null)}
                    className="px-3 py-2 border rounded text-sm"
                  >
                    {t("productsList.close")}
                  </button>
                </div>
              ) : viewing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="md:col-span-1 space-y-2">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {t("productsList.sectionImages")}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {imageUrlList(viewing.images).length ? (
                          imageUrlList(viewing.images).map((src, i) => (
                            <div
                              key={`${src}-${i}`}
                              className="w-24 h-24 rounded border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-700"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="" className="h-full w-full object-cover" />
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">{t("productsList.noImages")}</span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-3 text-sm">
                      <div className="flex flex-wrap gap-4 justify-between">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">{t("productsList.labelPrice")}</span>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {currency(
                              typeof viewing.price === "number" ? viewing.price : Number(viewing.price) || 0
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">{t("productsList.labelStock")}</span>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {String(viewing.quantity ?? 0)} {popUnit(viewing.unitId)}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400">{t("productsList.labelStatus")}</span>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {String(viewing.status ?? "—")}
                          </div>
                        </div>
                      </div>

                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelSellingType")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{String(viewing.sellingType ?? "—")}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelTaxType")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">
                            {typeof viewing.taxType === "string" && viewing.taxType ? viewing.taxType : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelCategory")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{popName(viewing.categoryId)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelSubcategory")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{popName(viewing.subCategoryId)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelBrand")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{popName(viewing.brandId)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelStore")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{popName(viewing.storeId)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelWarehouse")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{popName(viewing.warehouseId)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelBarcode")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">
                            {String(viewing.itemBarcode ?? "—")} ({String(viewing.barcodeSymbology ?? "—")})
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelWarranty")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{popWarranty(viewing.warrantyId)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelManufacturer")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">
                            {typeof viewing.manufacturer === "string" && viewing.manufacturer
                              ? viewing.manufacturer
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelManufactured")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">
                            {formatDetailDate(viewing.manufacturedDate)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelExpiry")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{formatDetailDate(viewing.expiryOn)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 dark:text-slate-400">{t("productsList.labelCreatedBy")}</dt>
                          <dd className="text-slate-800 dark:text-slate-200">{createdByLabel(viewing.createdBy)}</dd>
                        </div>
                      </dl>

                      {Array.isArray(viewing.variants) && viewing.variants.length > 0 ? (
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                            {t("productsList.sectionVariants")}
                          </div>
                          <ul className="space-y-1">
                            {(viewing.variants as Record<string, unknown>[]).map((v, i) => {
                              const vals = Array.isArray(v.values) ? v.values.map(String).join(", ") : "—";
                              return (
                                <li key={i} className="text-slate-800 dark:text-slate-200">
                                  <span className="font-medium">{variantAttrName(v)}</span>: {vals}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}

                      <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                          {t("productsList.sectionDescription")}
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                          {typeof viewing.description === "string" && viewing.description
                            ? viewing.description
                            : t("productsList.noDescription")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t dark:border-slate-700">
                    <Link
                      href={`/dashboard/products/create?id=${String(viewing._id ?? viewingId)}`}
                      className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm"
                    >
                      {t("productsList.actionEdit")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(String(viewing._id ?? viewingId));
                      }}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
                    >
                      {t("productsList.actionDelete")}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">{t("productsList.noProductData")}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
