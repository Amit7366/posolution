"use client";

import {
  TrendingUp,
  TrendingDown,
  Gift,
  Shield,
  RotateCcw,
  DollarSign,
  X,
  Calendar,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import SalesPurchaseCard, { type SalesChartRange } from "../components/dashboard/SalesPurchaseCard";
import OverallInformationCard from "../components/dashboard/OverallInformationCard";
import TopSellingProducts, { mapTopProductsToRows } from "../components/dashboard/TopSellingProducts";
import LowStockProducts from "../components/dashboard/LowStockProducts";
import RecentSales, { mapRecentInvoicesToRows } from "../components/dashboard/RecentSales";
import DashboardWidgetsDemo from "../components/dashboard/DashobardWidgets";
import { useGetDashboardSummaryQuery } from "@/redux/api/baseApi";
import { parseDashboardSummaryPayload } from "@/app/types/dashboard-summary";
import { money } from "@/app/lib/money";

function TrendLine({ value, variant }: { value: number | null; variant: "onDark" | "onLight" }) {
  const { t } = useTranslation();
  if (value === null) {
    return <span className={variant === "onDark" ? "text-white/70" : "text-gray-400"}>—</span>;
  }
  const pos = value >= 0;
  const suffix = ` ${t("dash.dashboard.vsLastMonth")}`;
  if (variant === "onDark") {
    return (
      <span className={pos ? "text-white/95" : "text-red-200"}>
        {pos ? "+" : ""}
        {value}%{suffix}
      </span>
    );
  }
  return (
    <span className={`text-sm mt-3 font-medium inline-flex items-center gap-1 ${pos ? "text-green-500" : "text-red-500"}`}>
      {pos ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      {pos ? "+" : ""}
      {value}%{suffix}
    </span>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [showAlert, setShowAlert] = useState(true);
  const [chartRange, setChartRange] = useState<SalesChartRange>("1W");

  const { data: raw, isLoading, isFetching, error } = useGetDashboardSummaryQuery({ chartRange });

  const summary = useMemo(() => parseDashboardSummaryPayload(raw), [raw]);

  const topSellingRows = useMemo(
    () => (summary ? mapTopProductsToRows(summary.topProducts) : []),
    [summary]
  );
  const recentRows = useMemo(
    () => (summary ? mapRecentInvoicesToRows(summary.recentInvoices) : []),
    [summary]
  );
  const lowStockRows = useMemo(
    () =>
      summary
        ? summary.lowStock.map((p) => ({
            name: p.name,
            id: p.sku || p.id.slice(-6),
            stock: p.quantity,
            image: p.imageUrl,
          }))
        : [],
    [summary]
  );

  const firstLow = summary?.lowStock[0];
  const busy = isLoading || isFetching;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{t("dash.dashboard.welcome")}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            {t("dash.dashboard.ordersToday")}{" "}
            <span className="text-orange-600 font-semibold">
              {busy ? "…" : summary?.counts.invoicesToday ?? 0}
            </span>{" "}
            {t("dash.dashboard.ordersTodaySuffix")}
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 border px-4 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm opacity-80 cursor-default"
        >
          <Calendar size={18} />
          {t("dash.dashboard.dateRangeSample")}
        </button>
      </div>

      {error != null ? (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {String((error as { data?: { message?: string } })?.data?.message || "Failed to load dashboard.")}
        </div>
      ) : null}

      {showAlert && firstLow && !busy && (
        <div className="relative bg-orange-50 border border-orange-200 text-orange-700 px-5 py-3 rounded-md flex items-center">
          <span className="text-sm">
            🔔 {t("dash.dashboard.lowStockBanner")} <strong>{firstLow.name}</strong> {t("dash.dashboard.lowStockMid")}{" "}
            {firstLow.quantity} {t("dash.dashboard.lowStockEnd")}
            <Link href="/dashboard/products/low-stock" className="ml-1 font-semibold text-blue-600 hover:underline">
              {t("dash.dashboard.addStock")}
            </Link>
          </span>
          <button
            type="button"
            onClick={() => setShowAlert(false)}
            className="absolute right-4 text-gray-600 hover:text-gray-900"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="rounded-xl p-5 bg-orange-500 text-white shadow-sm">
          <div className="flex items-center gap-3 text-white/90">
            <DollarSign size={24} />
            <span className="font-medium text-sm">{t("dash.dashboard.totalSales")}</span>
          </div>
          <div className="text-3xl font-bold mt-2">{busy ? "…" : money(summary?.totals.totalSales ?? 0)}</div>
          <p className="text-sm mt-3">
            {busy ? "…" : <TrendLine value={summary?.trends.salesPctVsLastMonth ?? null} variant="onDark" />}
          </p>
        </div>

        <div className="rounded-xl p-5 bg-[#0C274E] text-white shadow-sm">
          <div className="flex items-center gap-3 text-white/90">
            <RotateCcw size={24} />
            <span className="font-medium text-sm">{t("dash.dashboard.totalSalesReturn")}</span>
          </div>
          <div className="text-3xl font-bold mt-2">{busy ? "…" : money(summary?.totals.totalSalesReturn ?? 0)}</div>
          <p className="text-sm mt-3">
            {busy ? "…" : <TrendLine value={summary?.trends.salesReturnPctVsLastMonth ?? null} variant="onDark" />}
          </p>
        </div>

        <div className="rounded-xl p-5 bg-teal-600 text-white shadow-sm">
          <div className="flex items-center gap-3 text-white/90">
            <Gift size={24} />
            <span className="font-medium text-sm">{t("dash.dashboard.totalPurchase")}</span>
          </div>
          <div className="text-3xl font-bold mt-2">{busy ? "…" : money(summary?.totals.totalPurchase ?? 0)}</div>
          <div className="text-white/80 text-xs mt-2">—</div>
        </div>

        <div className="rounded-xl p-5 bg-blue-600 text-white shadow-sm relative">
          <div className="flex items-center gap-3 text-white/90">
            <Shield size={24} />
            <span className="font-medium text-sm">{t("dash.dashboard.totalPurchaseReturn")}</span>
          </div>
          <div className="text-3xl font-bold mt-2">{busy ? "…" : money(summary?.totals.totalPurchaseReturn ?? 0)}</div>
          <div className="bg-white/20 inline-block px-2 py-[2px] rounded text-xs mt-3">—</div>
          <div className="absolute -right-3 -top-3 bg-orange-500 p-2 rounded-full shadow">
            <Settings size={18} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold">{busy ? "…" : money(summary?.totals.profit ?? 0)}</h3>
          <p className="text-gray-600 text-sm mt-1">{t("dash.dashboard.profit")}</p>
          {busy ? <p className="text-sm mt-3">…</p> : <TrendLine value={summary?.trends.profitPctVsLastMonth ?? null} variant="onLight" />}
          <Link href="/dashboard/sales/invoices" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
            {t("dash.dashboard.viewAll")}
          </Link>
        </div>

        <div className="p-5 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold">{busy ? "…" : money(summary?.totals.invoiceDue ?? 0)}</h3>
          <p className="text-gray-600 text-sm mt-1">{t("dash.dashboard.invoiceDue")}</p>
          {busy ? (
            <p className="text-sm mt-3">…</p>
          ) : (
            <TrendLine value={summary?.trends.invoiceDuePctVsLastMonth ?? null} variant="onLight" />
          )}
          <Link href="/dashboard/sales/invoices" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
            {t("dash.dashboard.viewAll")}
          </Link>
        </div>

        <div className="p-5 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold">{busy ? "…" : money(summary?.totals.totalExpenses ?? 0)}</h3>
          <p className="text-gray-600 text-sm mt-1">{t("dash.dashboard.totalExpenses")}</p>
          <p className="text-gray-400 text-sm mt-3">—</p>
          <span className="mt-3 inline-block text-sm font-medium text-gray-400">{t("dash.dashboard.viewAll")}</span>
        </div>

        <div className="p-5 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold">{busy ? "…" : money(summary?.totals.totalPaymentReturns ?? 0)}</h3>
          <p className="text-gray-600 text-sm mt-1">{t("dash.dashboard.totalPaymentReturns")}</p>
          {busy ? (
            <p className="text-sm mt-3">…</p>
          ) : (
            <TrendLine value={summary?.trends.salesReturnPctVsLastMonth ?? null} variant="onLight" />
          )}
          <Link href="/dashboard/sales/return" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
            {t("dash.dashboard.viewAll")}
          </Link>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesPurchaseCard
            chartPoints={summary?.chartPoints ?? []}
            selected={chartRange}
            onSelect={setChartRange}
            isLoading={busy}
          />
        </div>

        <OverallInformationCard
          suppliers={summary?.counts.suppliers ?? 0}
          customers={summary?.counts.customers ?? 0}
          orders={summary?.counts.orders ?? 0}
          firstTimeCustomers={summary?.customersOverview.firstTime ?? 0}
          returningCustomers={summary?.customersOverview.returning ?? 0}
          isLoading={busy}
        />
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopSellingProducts products={topSellingRows} isLoading={busy} />
        <LowStockProducts items={lowStockRows} isLoading={busy} />
        <RecentSales sales={recentRows} isLoading={busy} />
      </div>

      <DashboardWidgetsDemo
        topCustomers={summary?.topCustomers ?? []}
        topCategories={summary?.topCategories ?? []}
        categoryCount={summary?.categoryStats.categoryCount ?? 0}
        productCount={summary?.categoryStats.productCount ?? 0}
        heatmap={summary?.orderHeatmap ?? []}
        isLoading={busy}
      />
    </div>
  );
}
