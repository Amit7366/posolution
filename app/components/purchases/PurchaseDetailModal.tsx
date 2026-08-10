"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Loader2, Undo2 } from "lucide-react";
import { Modal } from "@/app/components/dashboard/ui/Modal";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import PayDueModal, { type PayDueTarget } from "@/app/components/purchases/PayDueModal";
import AddEditPurchaseReturnModal from "@/app/components/purchase-return/AddEditPurchaseReturnModal";
import { apiPurchaseToPurchase, type ApiPurchaseDoc } from "@/app/lib/purchase-api";
import { formatDate } from "@/app/lib/format";
import { money } from "@/app/lib/money";
import type { PurchaseReturn } from "@/app/types/purchase-return";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  useGetPurchaseByIdQuery,
  useGetPurchasePaymentsQuery,
} from "@/redux/api/baseApi";

type Payment = {
  _id: string;
  amount: number;
  paymentType?: string;
  note?: string;
  paidAt?: string;
};

type Props = {
  open: boolean;
  purchaseId: string | null;
  onClose: () => void;
  onChanged?: () => void;
};

export default function PurchaseDetailModal({
  open,
  purchaseId,
  onClose,
  onChanged,
}: Props) {
  const { t } = useTranslation();
  const id = purchaseId ?? "";
  const { data, isLoading, isFetching, error, refetch } = useGetPurchaseByIdQuery(id, {
    skip: !open || !id,
  });
  const {
    data: paymentsPayload,
    isFetching: paymentsLoading,
    refetch: refetchPayments,
  } = useGetPurchasePaymentsQuery(id, { skip: !open || !id });

  const raw = (data as { data?: ApiPurchaseDoc } | undefined)?.data;
  const purchase = useMemo(() => (raw ? apiPurchaseToPurchase(raw) : null), [raw]);
  const payments = useMemo(() => {
    const value = (paymentsPayload as { data?: Payment[] } | undefined)?.data;
    return Array.isArray(value) ? value : [];
  }, [paymentsPayload]);

  const [payTarget, setPayTarget] = useState<PayDueTarget | null>(null);
  const [returnOpen, setReturnOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setPayTarget(null);
      setReturnOpen(false);
    }
  }, [open]);

  const returnPrefill = useMemo((): Partial<PurchaseReturn> | null => {
    if (!purchase) return null;
    return {
      supplierName: purchase.supplierName,
      reference: purchase.purchaseNo,
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
      paymentStatus: "Unpaid",
      paid: 0,
      orderTax: 0,
      discount: 0,
      shipping: 0,
      lines: purchase.items.map((item, index) => {
        const productId =
          raw?.items?.[index]?.productId != null
            ? String(raw.items[index].productId)
            : item.id.split("-")[0];
        return {
          id: `prefill-${index}`,
          productId,
          name: item.description,
          price: item.cost,
          stock: 0,
          qty: item.qty,
          discount: item.discount,
          taxPct: 0,
          subtotal: item.total,
        };
      }),
    };
  }, [purchase, raw]);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={purchase ? `Purchase ${purchase.purchaseNo}` : "Purchase details"}
        className="max-w-4xl"
        footer={
          purchase ? (
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600"
              >
                Close
              </button>
              <div className="flex flex-wrap gap-2">
                {purchase.amountDue > 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPayTarget({
                        id: purchase.id,
                        purchaseNo: purchase.purchaseNo,
                        supplierName: purchase.supplierName,
                        amountDue: purchase.amountDue,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
                  >
                    <Banknote className="h-4 w-4" />
                    Pay Due
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setReturnOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-300"
                >
                  <Undo2 className="h-4 w-4" />
                  Create Return
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600"
            >
              Close
            </button>
          )
        }
      >
        <div className="max-h-[min(72vh,680px)] space-y-5 overflow-y-auto pr-1">
          {isLoading || (isFetching && !purchase) ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading purchase…
            </div>
          ) : error || !purchase ? (
            <div className="py-16 text-center text-sm text-gray-500">Purchase not found.</div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.03]">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Supplier
                  </div>
                  <div className="mt-1 text-lg font-bold">{purchase.supplierName}</div>
                  <p className="mt-1 text-sm text-gray-500">
                    {purchase.supplierPhone || "—"}
                    {purchase.supplierEmail ? ` · ${purchase.supplierEmail}` : ""}
                  </p>
                  <p className="text-sm text-gray-500">{purchase.supplierAddress || "—"}</p>
                </div>
                <div className="text-right">
                  <InvoiceBadge status={purchase.status} t={t} />
                  <p className="mt-2 text-sm text-gray-500">
                    Created {formatDate(purchase.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">Due {formatDate(purchase.dueDate)}</p>
                </div>
              </div>

              {purchase.title ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Title
                  </div>
                  <p className="mt-1 font-medium">{purchase.title}</p>
                  {purchase.notes ? (
                    <p className="mt-1 text-sm text-gray-500">{purchase.notes}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-white/[0.04]">
                      <th className="px-3 py-3">Product</th>
                      <th className="px-3 py-3">Qty</th>
                      <th className="px-3 py-3">Unit cost</th>
                      <th className="px-3 py-3">Discount</th>
                      <th className="px-3 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {purchase.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2.5 font-medium">{item.description}</td>
                        <td className="px-3 py-2.5">{item.qty}</td>
                        <td className="px-3 py-2.5">{money(item.cost)}</td>
                        <td className="px-3 py-2.5">{money(item.discount)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold">
                          {money(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Payment history</h3>
                  {paymentsLoading ? (
                    <p className="text-sm text-gray-500">Loading…</p>
                  ) : !payments.length ? (
                    <p className="text-sm text-gray-500">No payments recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div
                          key={payment._id}
                          className="flex justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
                        >
                          <div>
                            <strong>{payment.paymentType || "cash"}</strong>
                            <p className="text-xs text-gray-500">
                              {payment.paidAt
                                ? new Date(payment.paidAt).toLocaleString()
                                : "—"}
                              {payment.note ? ` · ${payment.note}` : ""}
                            </p>
                          </div>
                          <strong>{money(payment.amount)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-black/20">
                  <Row label="Subtotal" value={purchase.subTotal} />
                  <Row label="Discount" value={purchase.discountTotal} />
                  <Row label={`VAT (${purchase.vatPercent}%)`} value={purchase.vatAmount} />
                  <Row label="Total" value={purchase.totalAmount} strong />
                  <Row label="Paid" value={purchase.paid} />
                  <Row label="Amount due" value={purchase.amountDue} accent />
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <PayDueModal
        open={!!payTarget}
        target={payTarget}
        onClose={() => setPayTarget(null)}
        onPaid={() => {
          void refetch();
          void refetchPayments();
          onChanged?.();
        }}
      />

      <AddEditPurchaseReturnModal
        open={returnOpen}
        mode="add"
        prefill={returnPrefill}
        onClose={() => setReturnOpen(false)}
        onSuccess={() => {
          setReturnOpen(false);
          onChanged?.();
        }}
      />
    </>
  );
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: number;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex justify-between border-b border-gray-200/70 pb-2 dark:border-gray-700 ${
        strong ? "text-base font-bold" : ""
      } ${accent ? "font-bold text-orange-500" : ""}`}
    >
      <span>{label}</span>
      <span>{money(value)}</span>
    </div>
  );
}
