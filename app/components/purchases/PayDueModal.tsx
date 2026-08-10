"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/app/components/dashboard/ui/Modal";
import { money } from "@/app/lib/money";
import { usePayPurchaseDueMutation } from "@/redux/api/baseApi";

type PaymentType = "cash" | "card" | "bkash" | "nagad" | "other";

export type PayDueTarget = {
  id: string;
  purchaseNo: string;
  supplierName: string;
  amountDue: number;
};

type Props = {
  open: boolean;
  target: PayDueTarget | null;
  onClose: () => void;
  onPaid?: () => void;
};

export default function PayDueModal({ open, target, onClose, onPaid }: Props) {
  const [payDue, { isLoading }] = usePayPurchaseDueMutation();
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [note, setNote] = useState("");

  function closeModal() {
    setAmount("");
    setPaymentType("cash");
    setNote("");
    onClose();
  }

  if (!target) return null;
  const amountNum = Math.round((Number(amount) || 0) * 100) / 100;

  async function submit() {
    if (amountNum <= 0) return toast.error("Enter a valid payment amount.");
    if (amountNum > target!.amountDue) return toast.error(`Payment cannot exceed ${money(target!.amountDue)}.`);
    try {
      await payDue({
        id: target!.id,
        body: { amount: amountNum, paymentType, note: note.trim() },
      }).unwrap();
      toast.success("Purchase due paid successfully.");
      onPaid?.();
      closeModal();
    } catch (error: unknown) {
      toast.error((error as { data?: { message?: string } })?.data?.message || "Could not pay purchase due.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title="Pay Purchase Due"
      className="max-w-md"
      footer={
        <>
          <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600">
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Pay Due
          </button>
        </>
      }
    >
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {target.purchaseNo} · {target.supplierName}
      </p>
      <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm dark:border-orange-500/30 dark:bg-orange-500/10">
        Outstanding: <strong className="text-orange-700 dark:text-orange-300">{money(target.amountDue)}</strong>
      </div>
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600 dark:text-gray-400">Amount</span>
          <input data-initial-focus type="number" min="0.01" max={target.amountDue} step="0.01" value={amount || String(target.amountDue)} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600 dark:text-gray-400">Payment type</span>
          <select value={paymentType} onChange={(e) => setPaymentType(e.target.value as PaymentType)} className={inputClass}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-600 dark:text-gray-400">Note</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </label>
      </div>
    </Modal>
  );
}
