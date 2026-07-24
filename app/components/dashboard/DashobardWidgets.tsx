"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import { money } from "@/app/lib/money";

const classNames = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export type TopCustomerRow = { name: string; orders: number; revenue: number };
export type TopCategoryRow = { name: string; revenue: number };

type TopCustomersProps = { customers: TopCustomerRow[]; isLoading?: boolean };

export const TopCustomers: React.FC<TopCustomersProps> = ({ customers, isLoading }) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-900/20">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1 1 0 011 1v1h-2V4a1 1 0 011-1zM5 6h10v8H5V6z" />
            </svg>
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 font-medium">{t("dash.widgets.topCustomers")}</h3>
        </div>
        <Link className="text-sm text-slate-500 hover:underline dark:text-slate-300" href="/dashboard/sales/invoices">
          {t("dash.dashboard.viewAll")}
        </Link>
      </div>

      {isLoading ? (
        <p className="text-slate-400 text-sm py-6 text-center">…</p>
      ) : customers.length === 0 ? (
        <p className="text-slate-400 text-sm py-6 text-center">{t("dash.dashboard.noRecentSales")}</p>
      ) : (
        <ul className="space-y-4">
          {customers.map((c) => (
            <li
              key={c.name}
              className="flex items-center justify-between py-2 border-t last:border-b-0 border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-semibold shrink-0">
                  {initials(c.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {c.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-300">
                    {t("dash.widgets.ordersCount", { n: c.orders })}
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 shrink-0 ml-2">
                {money(c.revenue)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const COLORS = ["#F59E0B", "#EF4444", "#0F172A", "#10b981", "#6366f1"];

type TopCategoriesProps = {
  categories: TopCategoryRow[];
  categoryCount: number;
  productCount: number;
  isLoading?: boolean;
};

export const TopCategories: React.FC<TopCategoriesProps> = ({
  categories,
  categoryCount,
  productCount,
  isLoading,
}) => {
  const { t } = useTranslation();

  const pieData = useMemo(() => {
    if (categories.length === 0) return [{ name: "—", value: 1 }];
    return categories.map((c) => ({ name: c.name, value: Math.max(0, c.revenue) }));
  }, [categories]);

  const stats = useMemo(
    () => [
      { label: t("dash.widgets.totalCategories"), value: categoryCount },
      { label: t("dash.widgets.totalProductsCount"), value: productCount },
    ],
    [t, categoryCount, productCount]
  );

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-900/20">
            <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 font-medium">{t("dash.widgets.topCategories")}</h3>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-400 text-sm py-6 text-center">…</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-1/2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={4}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full md:w-1/2">
            <div className="space-y-4">
              {categories.length === 0 ? (
                <p className="text-slate-400 text-sm">{t("dash.dashboard.noProducts")}</p>
              ) : (
                categories.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div style={{ background: COLORS[i % COLORS.length] }} className="w-3 h-3 rounded-full shrink-0" />
                      <div className="text-sm text-slate-600 dark:text-slate-300 truncate">{p.name}</div>
                    </div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 shrink-0 ml-2">
                      {money(p.revenue)}
                    </div>
                  </div>
                ))
              )}

              <div className="mt-2 rounded-md border border-slate-100 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/20">
                {stats.map((s, idx) => (
                  <div
                    key={s.label}
                    className={classNames(
                      "flex items-center justify-between py-2",
                      idx === 0 ? "border-b border-slate-100 dark:border-slate-700" : ""
                    )}
                  >
                    <div className="text-sm text-slate-600 dark:text-slate-300">{s.label}</div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type OrderStatisticsProps = { heatmap: number[][]; isLoading?: boolean };

export const OrderStatistics: React.FC<OrderStatisticsProps> = ({ heatmap, isLoading }) => {
  const { t } = useTranslation();
  const days = useMemo(
    () => [
      t("dash.widgets.mon"),
      t("dash.widgets.tue"),
      t("dash.widgets.wed"),
      t("dash.widgets.thu"),
      t("dash.widgets.fri"),
      t("dash.widgets.sat"),
      t("dash.widgets.sun"),
    ],
    [t]
  );
  const hours = ["2 Am", "4 Am", "6 Am", "8 Am", "10 Am", "12 Pm", "14 Pm", "16 Pm", "18 Pm"];

  const grid = useMemo(() => {
    const rows = 9;
    const cols = 7;
    const out: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(heatmap[r]?.[c] ?? 0);
      }
      out.push(row);
    }
    return out;
  }, [heatmap]);

  const intensityToBg = (v: number) => {
    if (v >= 8) return "bg-orange-600";
    if (v >= 5) return "bg-orange-400";
    if (v >= 3) return "bg-orange-200";
    if (v >= 1) return "bg-orange-100";
    return "bg-transparent";
  };

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-900/20">
            <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16v16H4z" />
            </svg>
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 font-medium">{t("dash.widgets.orderStatistics")}</h3>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-400 text-sm py-6 text-center">…</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-2 items-center">
            <div className="col-span-1" />
            {days.map((d) => (
              <div key={d} className="text-xs text-slate-500 dark:text-slate-300 text-center">
                {d}
              </div>
            ))}

            {hours.map((hour, r) => (
              <React.Fragment key={hour}>
                <div className="text-xs text-slate-500 dark:text-slate-300">{hour}</div>
                {grid[r]?.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={classNames(
                      "w-12 h-8 rounded-sm border border-transparent flex items-center justify-center",
                      intensityToBg(cell),
                      "dark:opacity-90"
                    )}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

type DemoProps = {
  topCustomers: TopCustomerRow[];
  topCategories: TopCategoryRow[];
  categoryCount: number;
  productCount: number;
  heatmap: number[][];
  isLoading?: boolean;
};

export default function DashboardWidgetsDemo({
  topCustomers,
  topCategories,
  categoryCount,
  productCount,
  heatmap,
  isLoading,
}: DemoProps) {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <TopCustomers customers={topCustomers} isLoading={isLoading} />
      </div>
      <div className="md:col-span-1">
        <TopCategories
          categories={topCategories}
          categoryCount={categoryCount}
          productCount={productCount}
          isLoading={isLoading}
        />
      </div>
      <div className="md:col-span-1">
        <OrderStatistics heatmap={heatmap} isLoading={isLoading} />
      </div>
    </div>
  );
}
