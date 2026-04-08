"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ChevronDown,
  User,
} from "lucide-react";
import {
  useGetAllPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
} from "@/redux/api/baseApi";

type PaymentStatus = "all" | "pending" | "approved" | "rejected";

const STATUS_BADGE: Record<string, { label: string; icon: React.ElementType; className: string }> =
  {
    pending: {
      label: "Pending",
      icon: Clock,
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle2,
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>("all");
  const [tenantSearch, setTenantSearch] = useState("");
  const [page, setPage] = useState(1);

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState<{
    id: string;
    action: "approve" | "reject";
    tenantId?: string;
  } | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [subscriptionDays, setSubscriptionDays] = useState(30);
  const [reviewError, setReviewError] = useState("");

  const { data: raw, isLoading, refetch } = useGetAllPaymentsQuery({
    page,
    limit: 20,
    status: statusFilter === "all" ? undefined : statusFilter,
    tenantId: tenantSearch.trim() || undefined,
  });

  const payments: any[] = raw?.data ?? [];
  const meta = raw?.meta ?? { total: 0, page: 1, limit: 20 };
  const totalPages = Math.ceil(meta.total / meta.limit);

  const [approvePayment, { isLoading: approving }] = useApprovePaymentMutation();
  const [rejectPayment, { isLoading: rejecting }] = useRejectPaymentMutation();

  const busy = approving || rejecting;

  const openReview = (id: string, action: "approve" | "reject", tenantId?: string) => {
    setReviewTarget({ id, action, tenantId });
    setReviewNote("");
    setSubscriptionDays(30);
    setReviewError("");
  };

  const closeReview = () => {
    setReviewTarget(null);
    setReviewError("");
  };

  const handleReviewSubmit = async () => {
    if (!reviewTarget) return;
    setReviewError("");
    try {
      if (reviewTarget.action === "approve") {
        await approvePayment({
          id: reviewTarget.id,
          note: reviewNote || undefined,
          subscriptionDays,
        }).unwrap();
      } else {
        await rejectPayment({
          id: reviewTarget.id,
          note: reviewNote || undefined,
        }).unwrap();
      }
      closeReview();
      refetch();
    } catch (err: any) {
      setReviewError(err?.data?.message ?? "Action failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Review and approve or reject user payment submissions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={tenantSearch}
            onChange={(e) => {
              setTenantSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by tenant ID..."
            className="rounded-md border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PaymentStatus);
              setPage(1);
            }}
            className="appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <RefreshCw size={14} />
          Refresh
        </button>

        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {meta.total} total
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <User size={40} className="mb-3 opacity-40" />
            <p className="text-sm">No payment requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <tr>
                  {[
                    "User / Tenant",
                    "Medium",
                    "Amount",
                    "Transaction ID",
                    "Sender",
                    "Status",
                    "Submitted",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.map((p: any) => (
                  <tr
                    key={p._id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {p.userId?.email ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400">{p.tenantId}</p>
                    </td>
                    <td className="px-4 py-3 capitalize font-medium text-gray-700 dark:text-gray-300">
                      {p.paymentMedium}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      ৳{p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {p.transactionId}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {p.senderNumber ?? (p.bankAccountNumber ?? "—")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                      {p.note && (
                        <p className="mt-1 text-[11px] italic text-gray-400">{p.note}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openReview(p._id, "approve", p.tenantId)}
                            className="rounded-md bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => openReview(p._id, "reject", p.tenantId)}
                            className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {p.reviewedAt
                            ? `Reviewed ${new Date(p.reviewedAt).toLocaleDateString()}`
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-600 dark:text-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Modal */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              {reviewTarget.action === "approve" ? "Approve Payment" : "Reject Payment"}
            </h3>

            {reviewTarget.action === "approve" && (
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subscription Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={subscriptionDays}
                  onChange={(e) => setSubscriptionDays(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Subscription will be extended by this many days from today (or current end date).
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Note (optional)
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={
                  reviewTarget.action === "approve"
                    ? "Approval note..."
                    : "Reason for rejection..."
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {reviewError && (
              <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {reviewError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeReview}
                disabled={busy}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={busy}
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition ${
                  reviewTarget.action === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {busy
                  ? "Processing..."
                  : reviewTarget.action === "approve"
                  ? "Confirm Approve"
                  : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
