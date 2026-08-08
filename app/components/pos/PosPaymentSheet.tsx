"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useCreateInvoiceMutation } from "@/redux/api/baseApi";
import { usePosCart } from "./PosCartContext";
import { formatTaka, todayDueDate } from "./formatTaka";

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

  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setPaymentType("cash");
    setCashAmount(String(grandTotal));
    setNotes("");
    setCustomerNote("");
  }, [open, grandTotal]);

  const cashNum = Number(cashAmount) || 0;
  const changeAmount = useMemo(
    () => Math.max(0, Math.round((cashNum - grandTotal) * 100) / 100),
    [cashNum, grandTotal]
  );

  if (!open) return null;

  async function submit(status: "paid" | "unpaid") {
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (status === "paid" && paymentType === "cash" && cashNum < grandTotal) {
      toast.error("Cash amount is less than order total");
      return;
    }

    const lineItems = items.map((i, idx) => ({
      productId: i.productId,
      qty: i.qty,
      unitPrice: i.price,
      discount: idx === 0 ? cartDiscount : 0,
    }));

    try {
      await createInvoice({
        customerName: customer.name || "Walking Customer",
        customerPhone: customer.phone ?? "",
        customerEmail: customer.email ?? "",
        customerAddress: customer.address ?? "",
        title: "POS Sale",
        items: lineItems,
        vatPercent,
        paid: status === "paid" ? grandTotal : 0,
        status,
        dueDate: todayDueDate(),
        notes,
        customerNote,
        paymentType,
        cashAmount: status === "paid" ? cashNum : 0,
        changeAmount: status === "paid" && paymentType === "cash" ? changeAmount : 0,
      }).unwrap();

      toast.success(status === "paid" ? "Order confirmed" : "Order held (unpaid)");
      clearCart();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to place order";
      toast.error(msg);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <h2 className="text-lg font-bold text-gray-900">Order Payment</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft size={16} /> Close
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500">Order Amount</p>
              <p className="text-3xl font-bold text-gray-900">{formatTaka(grandTotal)}</p>
            </div>
            <p className="text-sm text-gray-500">{productCount} Products</p>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Payment Type</span>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="other">Other</option>
            </select>
          </label>

          {paymentType === "cash" && (
            <>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Cash Amount*</span>
                <input
                  type="number"
                  min={0}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-gray-600">Change Amount*</span>
                <input
                  readOnly
                  value={formatTaka(changeAmount)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-gray-700"
                />
              </label>
            </>
          )}

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Additional Note</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600">Note to Customer</span>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="Write a note for customer.."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500"
            />
          </label>
        </div>

        <div className="space-y-2 border-t border-gray-100 p-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void submit("paid")}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {isLoading ? "Processing…" : "Confirm"}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void submit("unpaid")}
            className="w-full rounded-lg border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Hold / Unpaid
          </button>
        </div>
      </aside>
    </div>
  );
}
