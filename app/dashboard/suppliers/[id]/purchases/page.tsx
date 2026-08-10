"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  RefreshCcw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import PurchaseDetailModal from "@/app/components/purchases/PurchaseDetailModal";
import { apiPurchaseToPurchase, type ApiPurchaseDoc } from "@/app/lib/purchase-api";
import { formatDate } from "@/app/lib/format";
import { money } from "@/app/lib/money";
import type { PurchaseStatus } from "@/app/types/purchase";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  useGetPurchasesQuery,
  useGetSupplierSummaryQuery,
} from "@/redux/api/baseApi";

function unwrapData<T>(payload: unknown): T | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  if ("data" in payload) return (payload as { data?: T }).data;
  return payload as T;
}

export default function SupplierPurchasesPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const supplierBusinessId = String(params?.id ?? "");

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PurchaseStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const {
    data: summaryPayload,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useGetSupplierSummaryQuery(supplierBusinessId, {
    skip: !supplierBusinessId,
  });

  const summary = unwrapData<{
    supplier?: {
      _id?: string;
      supplierId?: string;
      name?: string;
      phone?: string;
      email?: string;
    };
    stats?: {
      purchaseCount?: number;
      totalPurchase?: number;
      totalPaid?: number;
      totalDue?: number;
    };
  }>(summaryPayload);

  const supplier = summary?.supplier;
  const supplierMongoId = String(supplier?._id ?? "");

  const apiStatus = useMemo(() => {
    if (status === "All") return "all" as const;
    if (status === "Paid") return "paid" as const;
    if (status === "Unpaid") return "unpaid" as const;
    return "overdue" as const;
  }, [status]);

  const {
    data: listPayload,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPurchasesQuery(
    {
      page,
      limit,
      search,
      status: apiStatus,
      supplierId: supplierMongoId,
    },
    { skip: !supplierMongoId }
  );

  const rows = useMemo(() => {
    const raw = unwrapData<ApiPurchaseDoc[]>(listPayload);
    if (!Array.isArray(raw)) return [];
    return raw.map((doc) => apiPurchaseToPurchase(doc));
  }, [listPayload]);

  const total =
    (listPayload as { meta?: { total?: number } } | undefined)?.meta?.total ??
    rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (!supplierBusinessId) {
    return <p className="p-6 text-sm text-gray-500">Invalid supplier</p>;
  }

  if (summaryLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  if (summaryError || !supplier) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">Supplier not found</p>
        <Link
          href="/dashboard/suppliers"
          className="mt-2 inline-block text-orange-600 hover:underline"
        >
          Back to suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 text-gray-900 dark:text-gray-200 md:p-6">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link
              href={`/dashboard/suppliers/${encodeURIComponent(supplierBusinessId)}`}
              className="mt-0.5 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Back to supplier"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                <h1 className="text-xl font-semibold">Purchases</h1>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {supplier.name}
                {supplier.supplierId ? ` · ${supplier.supplierId}` : ""}
                {supplier.phone ? ` · ${supplier.phone}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <RefreshCcw size={16} className={isFetching ? "animate-spin" : ""} />
            {t("dash.common.refresh")}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat label="Purchases" value={String(summary?.stats?.purchaseCount ?? 0)} />
          <MiniStat
            label="Total purchase"
            value={money(Number(summary?.stats?.totalPurchase ?? 0))}
          />
          <MiniStat
            label="Total paid"
            value={money(Number(summary?.stats?.totalPaid ?? 0))}
          />
          <MiniStat
            label="Total due"
            value={money(Number(summary?.stats?.totalDue ?? 0))}
            accent
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search purchase no, title…"
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as PurchaseStatus | "All");
              setPage(1);
            }}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="All">All status</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            {[10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            Failed to load purchases
          </div>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Purchase</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-right font-medium">Paid</th>
                  <th className="px-4 py-3 text-right font-medium">Amount due</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="px-4 py-4">
                        <div className="h-8 rounded bg-gray-100 dark:bg-gray-800" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-14 text-center text-gray-400">
                      No purchases for this supplier
                    </td>
                  </tr>
                ) : (
                  rows.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="cursor-pointer transition hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                      onClick={() => setSelectedId(purchase.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {purchase.purchaseNo}
                        </div>
                        <div className="text-xs text-gray-500">{purchase.title}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatDate(purchase.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatDate(purchase.dueDate)}
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceBadge status={purchase.status} t={t} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {money(purchase.totalAmount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {money(purchase.paid)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-orange-600 dark:text-orange-400">
                        {money(purchase.amountDue)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          title="View details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(purchase.id);
                          }}
                          className="inline-flex rounded-lg p-2 text-gray-600 transition hover:bg-orange-100 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-900/30"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-sm dark:border-gray-800">
            <p className="text-gray-500">
              {total} purchase{total === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
              >
                Prev
              </button>
              <span className="text-gray-600 dark:text-gray-300">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <PurchaseDetailModal
        open={!!selectedId}
        purchaseId={selectedId}
        onClose={() => setSelectedId(null)}
        onChanged={() => void refetch()}
      />
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900 ${
        accent
          ? "border-orange-200 dark:border-orange-900/40"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 truncate text-lg font-bold ${
          accent ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
