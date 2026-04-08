"use client";

import { useState } from "react";
import {
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  useSubmitPaymentMutation,
  useGetMyPaymentsQuery,
  useGetSubscriptionStatusQuery,
} from "@/redux/api/baseApi";
import { useTranslation } from "@/lib/i18n/useTranslation";

type PaymentMedium = "bkash" | "nagad" | "rocket" | "bank";

const MEDIUMS: { value: PaymentMedium; label: string }[] = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "bank", label: "Bank Transfer" },
];

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const cfg: Record<string, { labelKey: string; icon: React.ElementType; className: string }> = {
    pending: { labelKey: "billingPage.statusBadgePending", icon: Clock, className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    approved: { labelKey: "billingPage.statusBadgeApproved", icon: CheckCircle2, className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    rejected: { labelKey: "billingPage.statusBadgeRejected", icon: XCircle, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const item = cfg[status] ?? cfg.pending;
  const Icon = item.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${item.className}`}>
      <Icon size={12} />
      {t(item.labelKey)}
    </span>
  );
}

export default function BillingPage() {
  const { t } = useTranslation();
  const [medium, setMedium] = useState<PaymentMedium>("bkash");
  const [form, setForm] = useState({
    amount: "",
    transactionId: "",
    senderNumber: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankName: "",
    bankBranchName: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: subRaw, refetch: refetchSub } = useGetSubscriptionStatusQuery();
  const subData = subRaw?.data;

  const { data: paymentsRaw, isLoading: paymentsLoading, refetch: refetchPayments } =
    useGetMyPaymentsQuery();
  const payments: any[] = paymentsRaw?.data ?? [];

  const [submitPayment, { isLoading: submitting }] = useSubmitPaymentMutation();

  const isBank = medium === "bank";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!form.amount || Number(form.amount) <= 0) {
      setErrorMsg(t("billingPage.errAmount"));
      return;
    }
    if (!form.transactionId.trim()) {
      setErrorMsg(t("billingPage.errTxnId"));
      return;
    }
    if (!isBank && !form.senderNumber.trim()) {
      setErrorMsg(t("billingPage.errSenderNumber"));
      return;
    }

    try {
      const payload: any = {
        paymentMedium: medium,
        amount: Number(form.amount),
        transactionId: form.transactionId.trim(),
      };

      if (!isBank) payload.senderNumber = form.senderNumber.trim();
      if (isBank) {
        payload.bankAccountName = form.bankAccountName.trim();
        payload.bankAccountNumber = form.bankAccountNumber.trim();
        payload.bankName = form.bankName.trim();
        payload.bankBranchName = form.bankBranchName.trim();
      }

      await submitPayment(payload).unwrap();
      setSuccessMsg(t("billingPage.successMsg"));
      setForm({
        amount: "",
        transactionId: "",
        senderNumber: "",
        bankAccountName: "",
        bankAccountNumber: "",
        bankName: "",
        bankBranchName: "",
      });
      refetchPayments();
      refetchSub();
    } catch (err: any) {
      setErrorMsg(err?.data?.message ?? t("billingPage.errAmount"));
    }
  };

  const statusLabel = (status: string) => {
    if (status === "active") return t("billingPage.statusActive");
    if (status === "expired") return t("billingPage.statusExpired");
    if (status === "none") return t("billingPage.statusNone");
    return t("billingPage.statusPending");
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("billingPage.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("billingPage.subtitle")}</p>
      </div>

      {/* Subscription status card */}
      {subData && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t("billingPage.subscriptionStatus")}
          </h2>
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("billingPage.statusLabel")}</p>
              <span
                className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                  subData.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : subData.status === "expired"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {statusLabel(subData.status)}
              </span>
            </div>

            {subData.status === "active" && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("billingPage.daysRemaining")}</p>
                <p className="mt-1 text-2xl font-bold text-orange-500">{subData.daysLeft}</p>
              </div>
            )}

            {subData.subscriptionEndDate && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("billingPage.renewalDate")}</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(subData.subscriptionEndDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {subData.hasPendingPayment && (
              <div className="rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                {t("billingPage.pendingReview")}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Payment form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-5 text-base font-semibold text-gray-900 dark:text-white">
            {t("billingPage.submitPayment")}
          </h2>

          {/* Medium selector */}
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {MEDIUMS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMedium(m.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border-2 py-3 text-xs font-semibold transition ${
                  medium === m.value
                    ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                {m.value === "bank" ? <Building2 size={20} /> : <Smartphone size={20} />}
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("billingPage.amountLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                min="1"
                value={form.amount}
                onChange={handleChange}
                placeholder={t("billingPage.amountPlaceholder")}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("billingPage.transactionIdLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="transactionId"
                value={form.transactionId}
                onChange={handleChange}
                placeholder={t("billingPage.transactionIdPlaceholder")}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                required
              />
            </div>

            {!isBank && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("billingPage.senderNumberLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="senderNumber"
                  value={form.senderNumber}
                  onChange={handleChange}
                  placeholder={t("billingPage.senderNumberPlaceholder")}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            )}

            {isBank && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("billingPage.accountHolderLabel")}
                  </label>
                  <input
                    type="text"
                    name="bankAccountName"
                    value={form.bankAccountName}
                    onChange={handleChange}
                    placeholder={t("billingPage.accountHolderPlaceholder")}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("billingPage.accountNumberLabel")}
                  </label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={form.bankAccountNumber}
                    onChange={handleChange}
                    placeholder={t("billingPage.accountNumberPlaceholder")}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("billingPage.bankNameLabel")}
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={form.bankName}
                    onChange={handleChange}
                    placeholder={t("billingPage.bankNamePlaceholder")}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("billingPage.branchNameLabel")}
                  </label>
                  <input
                    type="text"
                    name="bankBranchName"
                    value={form.bankBranchName}
                    onChange={handleChange}
                    placeholder={t("billingPage.branchNamePlaceholder")}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                <XCircle size={16} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {submitting ? t("billingPage.submitting") : t("billingPage.submitBtn")}
            </button>
          </form>
        </div>

        {/* Payment history */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {t("billingPage.paymentHistory")}
            </h2>
            <button
              type="button"
              onClick={() => refetchPayments()}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {paymentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
              <CreditCard size={40} className="mb-3 opacity-40" />
              <p className="text-sm">{t("billingPage.noHistory")}</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
              {payments.map((p: any) => (
                <div
                  key={p._id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                        {p.paymentMedium}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("billingPage.txnPrefix")} {p.transactionId}
                      </p>
                      {p.senderNumber && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("billingPage.fromPrefix")} {p.senderNumber}
                        </p>
                      )}
                      {p.note && (
                        <p className="text-xs italic text-gray-400 dark:text-gray-500">
                          {t("billingPage.notePrefix")} {p.note}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        ৳{p.amount.toLocaleString()}
                      </p>
                      <StatusBadge status={p.status} t={t} />
                      <p className="text-[11px] text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {p.status === "approved" && p.subscriptionEnd && (
                    <p className="mt-2 text-[11px] text-green-600 dark:text-green-400">
                      {t("billingPage.subscriptionExtended").replace(
                        "{date}",
                        new Date(p.subscriptionEnd).toLocaleDateString()
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
