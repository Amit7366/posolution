"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Banknote, Eye, Phone, RefreshCcw, Search } from "lucide-react";
import PayDueModal, { type PayDueTarget } from "@/app/components/purchases/PayDueModal";
import { apiPurchaseToPurchase, type ApiPurchaseDoc } from "@/app/lib/purchase-api";
import { formatDate } from "@/app/lib/format";
import { money } from "@/app/lib/money";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useGetPurchasesQuery } from "@/redux/api/baseApi";

export default function PurchaseDuesPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [payTarget, setPayTarget] = useState<PayDueTarget | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isFetching, refetch } = useGetPurchasesQuery({ page, limit: 20, search, status: "due" });
  const rows = useMemo(() => {
    const raw = (data as { data?: ApiPurchaseDoc[] } | undefined)?.data;
    return Array.isArray(raw) ? raw.map(apiPurchaseToPurchase) : [];
  }, [data]);
  const total = (data as { meta?: { total?: number } } | undefined)?.meta?.total ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-gray-200">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-semibold">Purchase Dues</h1><p className="text-sm text-gray-500">Track and pay outstanding supplier balances.</p></div>
          <button type="button" onClick={() => void refetch()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"><RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh</button>
        </div>
        <div className="relative my-5 max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search purchase or supplier" className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800" /></div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead><tr className="bg-gray-50 text-left dark:bg-gray-800"><th className="px-4 py-3">Purchase</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Due date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? <tr><td colSpan={9} className="py-12 text-center text-gray-500">Loading purchase dues...</td></tr> : rows.map((row) => <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-semibold">{row.purchaseNo}</td><td className="px-4 py-3">{row.supplierName}</td><td className="px-4 py-3">{row.supplierPhone || "—"}</td><td className="px-4 py-3">{money(row.totalAmount)}</td><td className="px-4 py-3">{money(row.paid)}</td><td className="px-4 py-3 font-bold text-orange-500">{money(row.amountDue)}</td><td className="px-4 py-3">{formatDate(row.dueDate)}</td><td className="px-4 py-3"><InvoiceBadge status={row.status} t={t} /></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">{row.supplierPhone && <a href={`tel:${row.supplierPhone}`} className="rounded-md border border-gray-300 p-2 dark:border-gray-600" title="Call supplier"><Phone className="h-4 w-4" /></a>}<button type="button" onClick={() => setPayTarget({ id: row.id, purchaseNo: row.purchaseNo, supplierName: row.supplierName, amountDue: row.amountDue })} className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-white"><Banknote className="h-4 w-4" /> Pay Due</button><Link href={`/dashboard/purchases/${row.id}`} className="rounded-md border border-gray-300 p-2 dark:border-gray-600" title="View purchase"><Eye className="h-4 w-4" /></Link></div></td>
                </tr>)}
                {!isLoading && !rows.length && <tr><td colSpan={9} className="py-12 text-center text-gray-500">No purchase dues found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 p-4 text-sm dark:border-gray-700"><span className="text-gray-500">Total {total}</span><div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40 dark:border-gray-600">Previous</button><span>{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border px-3 py-1.5 disabled:opacity-40 dark:border-gray-600">Next</button></div></div>
        </div>
      </div>
      <PayDueModal open={!!payTarget} target={payTarget} onClose={() => setPayTarget(null)} onPaid={() => void refetch()} />
    </div>
  );
}
