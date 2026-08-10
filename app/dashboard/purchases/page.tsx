"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CreatePurchaseModal } from "@/app/components/purchases/CreatePurchaseModal";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import { apiPurchaseToPurchase, type ApiPurchaseDoc } from "@/app/lib/purchase-api";
import { formatDate } from "@/app/lib/format";
import { money } from "@/app/lib/money";
import type { PurchaseStatus } from "@/app/types/purchase";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useDeletePurchaseMutation, useGetPurchasesQuery } from "@/redux/api/baseApi";

export default function PurchasesPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [status, setStatus] = useState<PurchaseStatus | "All">("All");
  const [range, setRange] = useState<"Last7" | "All">("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const timer = setTimeout(() => setSupplierFilter(supplier.trim()), 350);
    return () => clearTimeout(timer);
  }, [supplier]);

  const since = range === "Last7" ? (() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString();
  })() : undefined;
  const apiStatus = status === "All" ? "all" : status.toLowerCase() as "paid" | "unpaid" | "overdue";
  const { data, isLoading, isFetching, refetch } = useGetPurchasesQuery({
    page, limit, search, supplier: supplierFilter || undefined, status: apiStatus, since,
  });
  const rows = useMemo(() => {
    const raw = (data as { data?: ApiPurchaseDoc[] } | undefined)?.data;
    return Array.isArray(raw) ? raw.map(apiPurchaseToPurchase) : [];
  }, [data]);
  const total = (data as { meta?: { total?: number } } | undefined)?.meta?.total ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [deletePurchase, { isLoading: deleting }] = useDeletePurchaseMutation();

  async function remove(id: string) {
    if (!window.confirm("Delete this purchase? Stock and supplier totals may be adjusted.")) return;
    try {
      await deletePurchase(id).unwrap();
      toast.success("Purchase deleted.");
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      void refetch();
    } catch (error: unknown) {
      toast.error((error as { data?: { message?: string } })?.data?.message || "Could not delete purchase.");
    }
  }

  const control = "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-gray-200">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1600px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-semibold">Purchase History</h1><p className="text-sm text-gray-500">Manage supplier purchases and payments.</p></div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"><Plus className="h-4 w-4" /> Create Purchase</button>
            <button type="button" onClick={() => void refetch()} className="rounded-xl border border-gray-300 bg-white p-2.5 dark:border-gray-600 dark:bg-gray-800"><RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /></button>
          </div>
        </div>
        <CreatePurchaseModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => void refetch()} />

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-wrap gap-3 border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search purchases" className={`${control} w-full pl-9`} /></div>
            <input value={supplier} onChange={(e) => { setSupplier(e.target.value); setPage(1); }} placeholder="Filter supplier" className={control} />
            <select value={status} onChange={(e) => { setStatus(e.target.value as PurchaseStatus | "All"); setPage(1); }} className={control}><option>All</option><option>Paid</option><option>Unpaid</option><option>Overdue</option></select>
            <select value={range} onChange={(e) => { setRange(e.target.value as "Last7" | "All"); setPage(1); }} className={control}><option value="All">All time</option><option value="Last7">Last 7 days</option></select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead><tr className="bg-gray-50 text-left dark:bg-white/[0.04]"><th className="px-5 py-4">Purchase No.</th><th className="px-5 py-4">Supplier</th><th className="px-5 py-4">Due date</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Paid</th><th className="px-5 py-4">Due</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading || isFetching ? <tr><td colSpan={8} className="py-14 text-center text-gray-500">Loading purchases...</td></tr> : rows.map((row) => <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-4 font-semibold">{row.purchaseNo}</td><td className="px-5 py-4">{row.supplierName}</td><td className="px-5 py-4">{formatDate(row.dueDate)}</td><td className="px-5 py-4">{money(row.amount)}</td><td className="px-5 py-4">{money(row.paid)}</td><td className="px-5 py-4 font-semibold text-orange-500">{money(row.amountDue)}</td><td className="px-5 py-4"><InvoiceBadge status={row.status} t={t} /></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2"><Link href={`/dashboard/purchases/${row.id}`} className="rounded-lg border border-gray-300 p-2 dark:border-gray-600"><Eye className="h-4 w-4" /></Link><button type="button" disabled={deleting} onClick={() => void remove(row.id)} className="rounded-lg border border-gray-300 p-2 text-red-500 disabled:opacity-40 dark:border-gray-600"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>)}
                {!isLoading && !isFetching && !rows.length && <tr><td colSpan={8} className="py-14 text-center text-gray-500">No purchases found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 p-4 text-sm dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500">Rows <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className={control}>{[5, 10, 20, 50].map((n) => <option key={n}>{n}</option>)}</select> Total {total}</div>
            <div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40 dark:border-gray-600">Previous</button><span>{page} / {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40 dark:border-gray-600">Next</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
