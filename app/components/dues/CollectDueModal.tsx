"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useCollectInvoiceDueMutation } from "@/redux/api/baseApi";
import { useTranslation } from "@/lib/i18n/useTranslation";

type PaymentType = "cash" | "card" | "bkash" | "nagad" | "other";

export type CollectDueTarget = {
  id: string;
  invoiceNo: string;
  customerName: string;
  amountDue: number;
};

type Props = {
  open: boolean;
  target: CollectDueTarget | null;
  onClose: () => void;
  onCollected?: () => void;
};

export default function CollectDueModal({ open, target, onClose, onCollected }: Props) {
  const { t } = useTranslation();
  const [collectDue, { isLoading }] = useCollectInvoiceDueMutation();
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("cash");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !target) return;
    setAmount(String(target.amountDue));
    setPaymentType("cash");
    setNote("");
  }, [open, target]);

  if (!open || !target) return null;

  const amountDue = target.amountDue;
  const amountNum = Math.round((Number(amount) || 0) * 100) / 100;

  async function submit() {
    if (!target) return;
    if (amountNum <= 0) {
      toast.error(t("dash.dues.errAmount"));
      return;
    }
    if (amountNum > amountDue) {
      toast.error(t("dash.dues.errExceeds", { due: amountDue.toFixed(2) }));
      return;
    }
    try {
      await collectDue({
        id: target.id,
        body: { amount: amountNum, paymentType, note: note.trim() },
      }).unwrap();
      toast.success(t("dash.dues.collectOk"));
      onCollected?.();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message;
      toast.error(msg || t("dash.dues.collectFail"));
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center px-4">
      <button type="button" className="absolute inset-0 bg-black/50 dark:bg-black/70" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("dash.dues.collectTitle")}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {target.invoiceNo} · {target.customerName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300"
            aria-label={t("dash.common.close")}
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm dark:border-orange-500/30 dark:bg-orange-500/10">
          <span className="text-gray-600 dark:text-gray-300">{t("dash.dues.outstanding")}: </span>
          <span className="font-bold text-orange-700 dark:text-orange-300">{amountDue.toFixed(2)}</span>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-400">{t("dash.dues.collectAmount")}</span>
            <input
              type="number"
              min={0.01}
              max={amountDue}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-400">{t("dash.dues.paymentType")}</span>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-600 dark:text-gray-400">{t("dash.dues.note")}</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {t("dash.common.cancel")}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void submit()}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("dash.dues.submitCollect")}
          </button>
        </div>
      </div>
    </div>
  );
}
