"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  Eye,
  Mail,
  MapPin,
  Phone,
  Receipt,
  RefreshCcw,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import PurchaseDetailModal from "@/app/components/purchases/PurchaseDetailModal";
import { formatDate } from "@/app/lib/format";
import { money } from "@/app/lib/money";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  useGetPurchasesQuery,
  useGetSupplierSummaryQuery,
} from "@/redux/api/baseApi";

type SupplierSummary = {
  supplier?: {
    _id?: string;
    supplierId?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: string;
    balance?: number;
    createdAt?: string;
  };
  stats?: {
    purchaseCount?: number;
    totalPurchase?: number;
    totalPaid?: number;
    totalDue?: number;
    paidCount?: number;
    unpaidCount?: number;
  };
};

type PurchaseRow = {
  _id?: string;
  purchaseId?: string;
  purchaseNo?: string;
  invoiceNo?: string;
  reference?: string;
  totalAmount?: number;
  grandTotal?: number;
  paid?: number;
  paidAmount?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
};

function unwrapData<T>(payload: unknown): T | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  if ("data" in payload) return (payload as { data?: T }).data;
  return payload as T;
}

function dateOrDash(value?: string) {
  return value ? formatDate(value) : "—";
}

function purchaseTotal(purchase: PurchaseRow) {
  return Number(purchase.totalAmount ?? purchase.grandTotal ?? 0);
}

function purchasePaid(purchase: PurchaseRow) {
  return Number(purchase.paid ?? purchase.paidAmount ?? 0);
}

function displayStatus(purchase: PurchaseRow) {
  const raw = String(purchase.paymentStatus ?? purchase.status ?? "unpaid").toLowerCase();
  return raw === "paid" ? "Paid" : raw === "due" ? "Due" : "Unpaid";
}

export default function SupplierDetailPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const supplierId = String(params?.id ?? "");
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  const {
    data: summaryPayload,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
    isError: summaryError,
    refetch: refetchSummary,
  } = useGetSupplierSummaryQuery(supplierId, { skip: !supplierId });

  const summary = unwrapData<SupplierSummary>(summaryPayload);
  const supplier = summary?.supplier;
  const stats = summary?.stats;
  const supplierMongoId = String(supplier?._id ?? "");

  const {
    data: purchasesPayload,
    isLoading: purchasesLoading,
    isFetching: purchasesFetching,
    refetch: refetchPurchases,
  } = useGetPurchasesQuery(
    { supplierId: supplierMongoId, limit: 20 },
    { skip: !supplierMongoId }
  );

  const purchases = useMemo(() => {
    const data = unwrapData<PurchaseRow[]>(purchasesPayload);
    return Array.isArray(data) ? data : [];
  }, [purchasesPayload]);

  if (!supplierId) {
    return <p className="p-6 text-sm text-gray-500">Invalid supplier</p>;
  }

  if (summaryLoading) {
    return (
      <div className="space-y-5 p-4 md:p-6">
        <div className="h-9 w-56 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (summaryError || !supplier) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Supplier not found</p>
        <Link
          href="/dashboard/suppliers"
          className="mt-2 inline-block text-orange-600 hover:underline dark:text-orange-400"
        >
          Back to suppliers
        </Link>
      </div>
    );
  }

  const isActive = String(supplier.status).toLowerCase() === "active";

  return (
    <div className="min-h-screen p-4 text-gray-900 dark:text-gray-200 md:p-6">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-[1600px] space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link
              href="/dashboard/suppliers"
              className="mt-0.5 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Back to suppliers"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {supplier.name}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {supplier.supplierId || supplierId} · Supplier details and purchases
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void refetchSummary();
                if (supplierMongoId) void refetchPurchases();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <RefreshCcw
                size={16}
                className={summaryFetching || purchasesFetching ? "animate-spin" : ""}
              />
              {t("dash.common.refresh")}
            </button>
            <Link
              href={`/dashboard/suppliers/${encodeURIComponent(supplierId)}/purchases`}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              <ShoppingBag size={16} />
              View all purchases
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={<Receipt size={18} className="text-blue-500" />}
            label="Purchases"
            value={String(stats?.purchaseCount ?? 0)}
          />
          <StatCard
            icon={<ShoppingBag size={18} className="text-orange-500" />}
            label="Total Purchase"
            value={money(Number(stats?.totalPurchase ?? 0))}
          />
          <StatCard
            icon={<Wallet size={18} className="text-emerald-500" />}
            label="Total Paid"
            value={money(Number(stats?.totalPaid ?? 0))}
          />
          <StatCard
            icon={<Banknote size={18} className="text-red-500" />}
            label="Total Due"
            value={money(Number(stats?.totalDue ?? 0))}
            highlight={Number(stats?.totalDue ?? 0) > 0}
          />
          <StatCard
            icon={<CheckCircle2 size={18} className="text-emerald-500" />}
            label="Paid"
            value={String(stats?.paidCount ?? 0)}
          />
          <StatCard
            icon={<Calendar size={18} className="text-amber-500" />}
            label="Unpaid"
            value={String(stats?.unpaidCount ?? 0)}
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Supplier information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info icon={<Phone size={16} />} label="Phone" value={supplier.phone || "—"} />
            <Info icon={<Mail size={16} />} label="Email" value={supplier.email || "—"} />
            <Info
              icon={<MapPin size={16} />}
              label="Address"
              value={supplier.address || "—"}
            />
            <Info
              icon={<Calendar size={16} />}
              label="Added"
              value={dateOrDash(supplier.createdAt)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent purchases</h2>
              <p className="mt-0.5 text-xs text-gray-500">Latest 20 purchases from this supplier</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/suppliers/${encodeURIComponent(supplierId)}/purchases`}
                className="text-sm font-medium text-orange-600 hover:underline dark:text-orange-400"
              >
                View all
              </Link>
              <button
                type="button"
                onClick={() => void refetchPurchases()}
                disabled={!supplierMongoId}
                className="text-sm font-medium text-gray-600 hover:underline disabled:opacity-50 dark:text-gray-300"
              >
                {purchasesFetching ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Purchase</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-right font-medium">Paid</th>
                  <th className="px-4 py-3 text-right font-medium">Due</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {purchasesLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="h-8 rounded bg-gray-100 dark:bg-gray-800" />
                      </td>
                    </tr>
                  ))
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No purchases found for this supplier
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => {
                    const total = purchaseTotal(purchase);
                    const paid = purchasePaid(purchase);
                    const due = Math.max(0, total - paid);
                    const status = displayStatus(purchase);
                    const label =
                      purchase.purchaseId ??
                      purchase.purchaseNo ??
                      purchase.invoiceNo ??
                      purchase.reference ??
                      purchase._id ??
                      "Purchase";

                    return (
                      <tr
                        key={purchase._id ?? label}
                        className="cursor-pointer transition hover:bg-orange-50/40 dark:hover:bg-orange-950/20"
                        onClick={() => {
                          if (purchase._id) setSelectedPurchaseId(String(purchase._id));
                        }}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {label}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-300">
                          {dateOrDash(purchase.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              status === "Paid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">{money(total)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">{money(paid)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                          {money(due)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {purchase._id ? (
                            <button
                              type="button"
                              title="View purchase"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPurchaseId(String(purchase._id));
                              }}
                              className="inline-flex rounded-lg p-2 text-gray-600 transition hover:bg-orange-100 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-orange-900/30"
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PurchaseDetailModal
        open={!!selectedPurchaseId}
        purchaseId={selectedPurchaseId}
        onClose={() => setSelectedPurchaseId(null)}
        onChanged={() => {
          void refetchSummary();
          void refetchPurchases();
        }}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900 ${
        highlight
          ? "border-red-200 dark:border-red-900/50"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="truncate text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-gray-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="break-words font-medium text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}
