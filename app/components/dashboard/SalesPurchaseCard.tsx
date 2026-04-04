"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingBag } from "lucide-react";
import type { DashboardChartPoint } from "@/app/types/dashboard-summary";

const FILTERS = ["1D", "1W", "1M", "3M", "6M", "1Y"] as const;
export type SalesChartRange = (typeof FILTERS)[number];

type Props = {
  chartPoints: DashboardChartPoint[];
  selected: SalesChartRange;
  onSelect: (r: SalesChartRange) => void;
  isLoading?: boolean;
};

export default function SalesPurchaseCard({
  chartPoints,
  selected,
  onSelect,
  isLoading,
}: Props) {
  const { t } = useTranslation();

  const { purchaseSum, salesSum } = useMemo(() => {
    let p = 0;
    let s = 0;
    for (const pt of chartPoints) {
      p += pt.purchase;
      s += pt.sales;
    }
    return { purchaseSum: p, salesSum: s };
  }, [chartPoints]);

  const fmtCompact = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(Math.round(n));
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-full">
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-orange-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-200">
            {t("dash.widgets.salesPurchase")}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onSelect(f)}
              className={`px-3 py-1 text-sm rounded-md border transition ${
                selected === f
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-300 rounded-full" />
            {t("dash.widgets.totalPurchase")}
          </div>
          <p className="text-xl font-bold">{isLoading ? "…" : fmtCompact(purchaseSum)}</p>
        </div>

        <div className="text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            {t("dash.widgets.totalSalesLabel")}
          </div>
          <p className="text-xl font-bold">{isLoading ? "…" : fmtCompact(salesSum)}</p>
        </div>
      </div>

      <div className="w-full h-64 mt-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            …
          </div>
        ) : chartPoints.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            {t("dash.dashboard.noChartData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartPoints}>
              <XAxis dataKey="label" stroke="#aaa" tick={{ fontSize: 10 }} />
              <YAxis stroke="#aaa" tick={{ fontSize: 10 }} />
              <Tooltip cursor={{ fill: "#f2f2f2" }} />
              <Bar dataKey="purchase" stackId="a" fill="#fed7aa" />
              <Bar dataKey="sales" stackId="a" fill="#fb923c" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
