"use client";

import {
  TrendingUp,
  TrendingDown,
  Gift,
  Shield,
  RotateCcw,
  X,
  Calendar,
  Phone,
  Banknote,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import SalesPurchaseCard, { type SalesChartRange } from "../components/dashboard/SalesPurchaseCard";
import OverallInformationCard from "../components/dashboard/OverallInformationCard";
import TopSellingProducts, { mapTopProductsToRows } from "../components/dashboard/TopSellingProducts";
import LowStockProducts from "../components/dashboard/LowStockProducts";
import RecentSales, { mapRecentInvoicesToRows } from "../components/dashboard/RecentSales";
import DashboardWidgetsDemo from "../components/dashboard/DashobardWidgets";
import CollectDueModal, { type CollectDueTarget } from "@/app/components/dues/CollectDueModal";
import ProfitLossCard from "../components/dashboard/ProfitLossCard";
import { useGetDashboardSummaryQuery } from "@/redux/api/baseApi";
import { parseDashboardSummaryPayload } from "@/app/types/dashboard-summary";
import { money } from "@/app/lib/money";

function useNowClock(locale: string) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    const date = now.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = now.toLocaleTimeString(locale === "bn" ? "bn-BD" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return `${date} · ${time}`;
  }, [now, locale]);
}

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
  const { t, language } = useTranslation();
  const nowLabel = useNowClock(language);
  const [showAlert, setShowAlert] = useState(true);
  const [chartRange, setChartRange] = useState<SalesChartRange>("1W");
  const [collectTarget, setCollectTarget] = useState<CollectDueTarget | null>(null);

  const { data: raw, isLoading, isFetching, error, refetch } = useGetDashboardSummaryQuery({ chartRange });

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

        <div className="flex items-center gap-2 border px-4 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm">
          <Calendar size={18} />
          <span className="text-sm tabular-nums">{nowLabel}</span>
        </div>
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
            <Banknote size={24} />
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
          <Link href="/dashboard/purchases" className="mt-3 inline-block text-xs font-medium text-white/90 underline-offset-2 hover:underline">
            {t("dash.dashboard.viewAll")}
          </Link>
        </div>

        <div className="rounded-xl p-5 bg-blue-600 text-white shadow-sm">
          <div className="flex items-center gap-3 text-white/90">
            <Shield size={24} />
            <span className="font-medium text-sm">{t("dash.dashboard.totalPurchaseReturn")}</span>
          </div>
          <div className="text-3xl font-bold mt-2">{busy ? "…" : money(summary?.totals.totalPurchaseReturn ?? 0)}</div>
          <Link href="/dashboard/purchases/return" className="mt-3 inline-block text-xs font-medium text-white/90 underline-offset-2 hover:underline">
            {t("dash.dashboard.viewAll")}
          </Link>
        </div>
      </div>

      <ProfitLossCard />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {t("dash.dashboard.dueReceivables")}
          </h2>
          <Link
            href="/dashboard/sales/dues"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {t("dash.dashboard.viewAll")}
          </Link>
        </div>
        {busy ? (
          <div className="px-5 py-8 text-sm text-gray-500">{t("dash.common.loading")}</div>
        ) : !summary?.dueInvoices?.length ? (
          <div className="px-5 py-8 text-sm text-gray-500">{t("dash.dashboard.noDues")}</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {summary.dueInvoices.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{d.invoiceNo}</span>
                    {d.overdue ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-500/20 dark:text-red-300">
                        {t("dash.dues.overdue")}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-gray-500">
                    {d.customerName || "—"}
                    {d.customerPhone ? ` · ${d.customerPhone}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {money(d.amountDue)}
                  </span>
                  {d.customerPhone ? (
                    <a
                      href={`tel:${d.customerPhone}`}
                      className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                      <Phone size={14} />
                      {t("dash.dashboard.call")}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      setCollectTarget({
                        id: d.id,
                        invoiceNo: d.invoiceNo,
                        customerName: d.customerName,
                        amountDue: d.amountDue,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
                  >
                    <Banknote size={14} />
                    {t("dash.dashboard.collect")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Purchase dues
          </h2>
          <Link
            href="/dashboard/purchases/dues"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {t("dash.dashboard.viewAll")}
          </Link>
        </div>
        {busy ? (
          <div className="px-5 py-8 text-sm text-gray-500">{t("dash.common.loading")}</div>
        ) : !summary?.duePurchases?.length ? (
          <div className="px-5 py-8 text-sm text-gray-500">No purchase dues</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {summary.duePurchases.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/purchases/${d.id}`}
                      className="font-medium text-gray-900 hover:underline dark:text-gray-100"
                    >
                      {d.purchaseNo}
                    </Link>
                    {d.overdue ? (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-500/20 dark:text-red-300">
                        {t("dash.dues.overdue")}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-gray-500">
                    {d.supplierName || "—"}
                    {d.supplierPhone ? ` · ${d.supplierPhone}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    {money(d.amountDue)}
                  </span>
                  <Link
                    href="/dashboard/purchases/dues"
                    className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                  >
                    <Banknote size={14} />
                    Pay
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
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
          <h3 className="text-xl font-semibold">{busy ? "…" : money(summary?.totals.collectedIncome ?? 0)}</h3>
          <p className="text-gray-600 text-sm mt-1">{t("dash.dashboard.collectedIncome")}</p>
          {busy ? (
            <p className="text-sm mt-3">…</p>
          ) : (
            <TrendLine value={summary?.trends.collectedIncomePctVsLastMonth ?? null} variant="onLight" />
          )}
          <Link href="/dashboard/sales/dues" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
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
          <Link href="/dashboard/sales/dues" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
            {t("dash.dashboard.viewAll")}
          </Link>
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

      <CollectDueModal
        open={!!collectTarget}
        target={collectTarget}
        onClose={() => setCollectTarget(null)}
        onCollected={() => void refetch()}
      />
    </div>
  );
}
