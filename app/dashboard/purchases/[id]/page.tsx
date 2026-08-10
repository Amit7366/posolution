"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Banknote, Printer } from "lucide-react";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import PayDueModal, { type PayDueTarget } from "@/app/components/purchases/PayDueModal";
import { apiPurchaseToPurchase, type ApiPurchaseDoc } from "@/app/lib/purchase-api";
import { formatDate } from "@/app/lib/format";
import { money } from "@/app/lib/money";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useGetPurchaseByIdQuery, useGetPurchasePaymentsQuery } from "@/redux/api/baseApi";

type Payment = { _id: string; amount: number; paymentType?: string; note?: string; paidAt?: string };

export default function PurchaseDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useGetPurchaseByIdQuery(id, { skip: !id });
  const { data: paymentsPayload, isFetching: paymentsLoading, refetch: refetchPayments } = useGetPurchasePaymentsQuery(id, { skip: !id });
  const raw = (data as { data?: ApiPurchaseDoc } | undefined)?.data;
  const purchase = useMemo(() => raw ? apiPurchaseToPurchase(raw) : null, [raw]);
  const payments = useMemo(() => {
    const value = (paymentsPayload as { data?: Payment[] } | undefined)?.data;
    return Array.isArray(value) ? value : [];
  }, [paymentsPayload]);
  const [payTarget, setPayTarget] = useState<PayDueTarget | null>(null);

  if (isLoading) return <div className="grid min-h-screen place-items-center text-gray-500">Loading purchase...</div>;
  if (error || !purchase) return <div className="grid min-h-screen place-items-center"><div className="rounded-xl border p-6 dark:border-gray-700"><p>Purchase not found.</p><Link href="/dashboard/purchases" className="mt-3 inline-block text-orange-500">Back to purchases</Link></div></div>;

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-gray-200">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-2xl font-semibold">Purchase Details</h1><p className="text-sm text-gray-500">{purchase.purchaseNo}</p></div>
          <div className="flex gap-2">
            {purchase.amountDue > 0 && <button type="button" onClick={() => setPayTarget({ id: purchase.id, purchaseNo: purchase.purchaseNo, supplierName: purchase.supplierName, amountDue: purchase.amountDue })} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"><Banknote className="h-4 w-4" /> Pay Due</button>}
            <button type="button" onClick={() => window.print()} className="rounded-lg border border-gray-300 p-2 dark:border-gray-600"><Printer className="h-4 w-4" /></button>
            <Link href="/dashboard/purchases" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"><ArrowLeft className="h-4 w-4" /> Back</Link>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-wrap justify-between gap-6 border-b border-gray-200 p-6 dark:border-gray-700">
            <div><div className="text-xs font-semibold uppercase text-gray-500">Supplier</div><h2 className="mt-2 text-xl font-bold">{purchase.supplierName}</h2><p className="mt-1 text-sm text-gray-500">{purchase.supplierAddress || "—"}</p><p className="mt-2 text-sm">{purchase.supplierEmail || "—"} · {purchase.supplierPhone || "—"}</p></div>
            <div className="text-right"><p className="text-sm">Purchase <strong className="text-orange-500">#{purchase.purchaseNo}</strong></p><p className="mt-2 text-sm text-gray-500">Created {formatDate(purchase.createdAt)}</p><p className="text-sm text-gray-500">Due {formatDate(purchase.dueDate)}</p><div className="mt-3 flex justify-end"><InvoiceBadge status={purchase.status} t={t} /></div></div>
          </div>
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700"><strong>{purchase.title}</strong>{purchase.notes && <p className="mt-2 text-sm text-gray-500">{purchase.notes}</p>}</div>
          <div className="overflow-x-auto p-6">
            <table className="w-full min-w-[760px] text-sm">
              <thead><tr className="bg-gray-50 text-left dark:bg-white/[0.04]"><th className="px-4 py-3">Product</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Unit cost</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{purchase.items.map((item) => <tr key={item.id}><td className="px-4 py-3 font-semibold">{item.description}</td><td className="px-4 py-3">{item.qty}</td><td className="px-4 py-3">{money(item.cost)}</td><td className="px-4 py-3">{money(item.discount)}</td><td className="px-4 py-3 text-right font-semibold">{money(item.total)}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="grid gap-8 border-t border-gray-200 p-6 dark:border-gray-700 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 font-semibold">Payment History</h3>
              {paymentsLoading ? <p className="text-sm text-gray-500">Loading payments...</p> : !payments.length ? <p className="text-sm text-gray-500">No due payments recorded.</p> : <div className="space-y-2">{payments.map((payment) => <div key={payment._id} className="flex justify-between rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"><div><strong>{payment.paymentType || "cash"}</strong><p className="text-xs text-gray-500">{payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "—"}{payment.note ? ` · ${payment.note}` : ""}</p></div><strong>{money(payment.amount)}</strong></div>)}</div>}
            </div>
            <div className="space-y-3">
              <Total label="Subtotal" value={purchase.subTotal} /><Total label="Discount" value={purchase.discountTotal} /><Total label={`VAT (${purchase.vatPercent}%)`} value={purchase.vatAmount} /><Total label="Total" value={purchase.totalAmount} strong /><Total label="Paid" value={purchase.paid} /><Total label="Amount Due" value={purchase.amountDue} accent />
            </div>
          </div>
        </div>
      </div>
      <PayDueModal open={!!payTarget} target={payTarget} onClose={() => setPayTarget(null)} onPaid={() => { void refetch(); void refetchPayments(); }} />
    </div>
  );
}

function Total({ label, value, strong, accent }: { label: string; value: number; strong?: boolean; accent?: boolean }) {
  return <div className={`flex justify-between border-b border-gray-100 pb-3 dark:border-gray-800 ${strong ? "text-lg font-bold" : ""} ${accent ? "font-bold text-orange-500" : ""}`}><span>{label}</span><span>{money(value)}</span></div>;
}
