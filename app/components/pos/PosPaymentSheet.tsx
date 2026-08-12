"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useCreateInvoiceMutation } from "@/redux/api/baseApi";
import { usePosCart, isCustomerSelected } from "./PosCartContext";
import { formatTaka, todayDueDate } from "./formatTaka";
import { enqueueOutbox } from "./offline/posOutbox";
import { applyLocalStockForQueuedSale, isNetworkError, isOnline } from "./offline/posSync";
import { upsertInvoice } from "./offline/posCache";
import { usePosOffline } from "./offline/PosOfflineProvider";

type PaymentType = "cash" | "card" | "bkash" | "nagad" | "other";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PosPaymentSheet({ open, onClose }: Props) {
  const {
    items,
    customer,
    grandTotal,
    productCount,
    cartDiscount,
    vatPercent,
    clearCart,
  } = usePosCart();
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
  const { refreshPending, syncNow } = usePosOffline();

  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [savingOffline, setSavingOffline] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPaymentType("cash");
    setAmountReceived(String(grandTotal));
    setCashAmount(String(grandTotal));
    setNotes("");
    setCustomerNote("");
  }, [open, grandTotal]);

  const receivedNum = Math.min(
    grandTotal,
    Math.max(0, Math.round((Number(amountReceived) || 0) * 100) / 100)
  );
  const amountDue = useMemo(
    () => Math.round((grandTotal - receivedNum) * 100) / 100,
    [grandTotal, receivedNum]
  );
  const cashNum = Number(cashAmount) || 0;
  const changeAmount = useMemo(
    () => Math.max(0, Math.round((cashNum - receivedNum) * 100) / 100),
    [cashNum, receivedNum]
  );

  if (!open) return null;

  function buildBody(opts: { hold: boolean; paid: number; status: "paid" | "unpaid" }) {
    const lineItems = items.map((i, idx) => ({
      productId: i.productId,
      qty: i.qty,
      unitPrice: i.price,
      discount: idx === 0 ? cartDiscount : 0,
    }));

    const tempCustomer =
      customer.id && String(customer.id).startsWith("temp_")
        ? String(customer.id)
        : undefined;
    const realCustomerId =
      customer.id && !String(customer.id).startsWith("temp_") && !String(customer.id).startsWith("__")
        ? customer.id
        : undefined;

    return {
      ...(realCustomerId ? { customerId: realCustomerId } : {}),
      customerName: customer.name || "Walking Customer",
      customerPhone: customer.phone ?? "",
      customerEmail: customer.email ?? "",
      customerAddress: customer.address ?? "",
      title: "POS Sale",
      items: lineItems,
      vatPercent,
      paid: opts.paid,
      status: opts.status,
      hold: opts.hold,
      dueDate: todayDueDate(),
      notes,
      customerNote,
      paymentType,
      cashAmount: opts.hold ? 0 : paymentType === "cash" ? cashNum : opts.paid,
      changeAmount: opts.hold ? 0 : paymentType === "cash" ? changeAmount : 0,
      __tempCustomerId: tempCustomer,
    };
  }

  async function queueOfflineSale(opts: {
    hold: boolean;
    paid: number;
    status: "paid" | "unpaid";
    successMsg: string;
  }) {
    const clientSaleId = crypto.randomUUID();
    const localInvoiceId = `local_${clientSaleId}`;
    const raw = buildBody(opts);
    const tempCustomerId = raw.__tempCustomerId as string | undefined;
    const { __tempCustomerId: _, ...body } = raw;

    await enqueueOutbox({
      id: `inv_${clientSaleId}`,
      type: "createInvoice",
      payload: {
        clientSaleId,
        localInvoiceId,
        tempCustomerId,
        body: { ...body, clientSaleId },
        preview: {
          customerName: customer.name || "Walking Customer",
          totalAmount: grandTotal,
          productCount,
          hold: opts.hold,
          status: opts.status,
          createdAt: new Date().toISOString(),
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            qty: i.qty,
            unitPrice: i.price,
            lineTotal: i.price * i.qty,
          })),
        },
      },
    });

    await applyLocalStockForQueuedSale(
      items.map((i) => ({ productId: i.productId, qty: i.qty })),
      opts.hold
    );

    await upsertInvoice({
      id: localInvoiceId,
      invoiceNo: `OFFLINE-${clientSaleId.slice(0, 8)}`,
      customerName: customer.name || "Walking Customer",
      customerPhone: customer.phone,
      createdAt: new Date().toISOString(),
      status: opts.status,
      totalAmount: grandTotal,
      hold: opts.hold,
      pendingSync: true,
      clientSaleId,
      detail: {
        invoiceNo: `OFFLINE-${clientSaleId.slice(0, 8)}`,
        customerName: customer.name || "Walking Customer",
        customerPhone: customer.phone,
        items: items.map((i) => ({
          productName: i.name,
          qty: i.qty,
          unitPrice: i.price,
          lineTotal: i.price * i.qty,
        })),
        totalAmount: grandTotal,
        status: opts.status,
        hold: opts.hold,
        createdAt: new Date().toISOString(),
        pendingSync: true,
      },
    });

    await refreshPending();
    toast.success(opts.successMsg);
    clearCart();
    onClose();
  }

  async function submitConfirm() {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!isCustomerSelected(customer)) {
      toast.error("Please select a customer");
      return;
    }
    if (receivedNum < 0 || receivedNum > grandTotal) {
      toast.error("Received amount must be between 0 and order total");
      return;
    }
    if (paymentType === "cash" && cashNum < receivedNum) {
      toast.error("Cash amount is less than amount received");
      return;
    }

    const status = receivedNum >= grandTotal ? "paid" : "unpaid";
    const successMsg =
      status === "paid"
        ? "Order confirmed (paid)"
        : receivedNum > 0
          ? `Order confirmed — due ${formatTaka(amountDue)}`
          : "Order confirmed as due";

    if (!isOnline()) {
      setSavingOffline(true);
      try {
        await queueOfflineSale({
          hold: false,
          paid: receivedNum,
          status,
          successMsg: "Saved offline — will sync when online",
        });
      } catch {
        toast.error("Failed to save offline sale");
      } finally {
        setSavingOffline(false);
      }
      return;
    }

    const raw = buildBody({ hold: false, paid: receivedNum, status });
    const { __tempCustomerId: tempCustomerId, ...bodyBase } = raw;
    const clientSaleId = crypto.randomUUID();

    try {
      // If cart still has temp customer, queue instead of posting invalid id
      if (tempCustomerId) {
        setSavingOffline(true);
        await queueOfflineSale({
          hold: false,
          paid: receivedNum,
          status,
          successMsg: "Saved offline — customer will sync first",
        });
        setSavingOffline(false);
        void syncNow();
        return;
      }

      await createInvoice({
        ...bodyBase,
        clientSaleId,
      }).unwrap();

      toast.success(successMsg);
      clearCart();
      onClose();
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        setSavingOffline(true);
        try {
          await queueOfflineSale({
            hold: false,
            paid: receivedNum,
            status,
            successMsg: "Saved offline — will sync when online",
          });
        } catch {
          toast.error("Failed to save offline sale");
        } finally {
          setSavingOffline(false);
        }
        return;
      }
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to place order";
      toast.error(msg);
    }
  }

  async function submitHold() {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!isCustomerSelected(customer)) {
      toast.error("Please select a customer");
      return;
    }

    if (!isOnline()) {
      setSavingOffline(true);
      try {
        await queueOfflineSale({
          hold: true,
          paid: 0,
          status: "unpaid",
          successMsg: "Held offline — will sync when online",
        });
      } catch {
        toast.error("Failed to save offline hold");
      } finally {
        setSavingOffline(false);
      }
      return;
    }

    const raw = buildBody({ hold: true, paid: 0, status: "unpaid" });
    const { __tempCustomerId: tempCustomerId, ...bodyBase } = raw;
    const clientSaleId = crypto.randomUUID();

    try {
      if (tempCustomerId) {
        setSavingOffline(true);
        await queueOfflineSale({
          hold: true,
          paid: 0,
          status: "unpaid",
          successMsg: "Held offline — customer will sync first",
        });
        setSavingOffline(false);
        void syncNow();
        return;
      }

      await createInvoice({
        ...bodyBase,
        clientSaleId,
      }).unwrap();

      toast.success("Order held (no stock deducted)");
      clearCart();
      onClose();
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        setSavingOffline(true);
        try {
          await queueOfflineSale({
            hold: true,
            paid: 0,
            status: "unpaid",
            successMsg: "Held offline — will sync when online",
          });
        } catch {
          toast.error("Failed to save offline hold");
        } finally {
          setSavingOffline(false);
        }
        return;
      }
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to hold order";
      toast.error(msg);
    }
  }

  const busy = isLoading || savingOffline;
  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-fadeIn dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order Payment</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft size={16} /> Close
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order Amount</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatTaka(grandTotal)}</p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{productCount} Products</p>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Payment Type</span>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className={inputClass}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Amount Received</span>
            <input
              type="number"
              min={0}
              max={grandTotal}
              step="0.01"
              value={amountReceived}
              onChange={(e) => {
                setAmountReceived(e.target.value);
                if (paymentType === "cash") setCashAmount(e.target.value);
              }}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter 0 for full due, or less than total for partial pay
            </p>
          </label>

          <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm dark:border-orange-500/30 dark:bg-orange-500/10">
            <div className="flex justify-between text-gray-700 dark:text-gray-200">
              <span>Due</span>
              <span className="font-semibold text-orange-700 dark:text-orange-400">{formatTaka(amountDue)}</span>
            </div>
          </div>

          {paymentType === "cash" && (
            <>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">Cash Tendered</span>
                <input
                  type="number"
                  min={0}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600 dark:text-gray-300">Change</span>
                <input
                  readOnly
                  value={formatTaka(changeAmount)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                />
              </label>
            </>
          )}

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Additional Note</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-300">Note to Customer</span>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Write a note for customer.."
              rows={3}
              className={`${inputClass} resize-none dark:placeholder:text-gray-500`}
            />
          </label>
        </div>

        <div className="space-y-2 border-t border-gray-100 p-4 dark:border-gray-700">
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitConfirm()}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {busy
              ? "Processing…"
              : amountDue > 0
                ? `Confirm${receivedNum > 0 ? " (Partial)" : " (Due)"}`
                : "Confirm (Paid)"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitHold()}
            className="w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Hold (no stock)
          </button>
        </div>
      </aside>
    </div>
  );
}
