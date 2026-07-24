"use client";

import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";

const COLORS = ["#16a34a", "#f97316"];

type Props = {
  firstTime: number;
  returning: number;
  isLoading?: boolean;
};

export default function CustomersOverviewCard({ firstTime, returning, isLoading }: Props) {
  const { t } = useTranslation();

  const chartData = useMemo(
    () => [
      { name: t("dash.widgets.returnCustomer"), value: Math.max(0, returning) },
      { name: t("dash.widgets.firstTime"), value: Math.max(0, firstTime) },
    ],
    [t, firstTime, returning]
  );

  const total = firstTime + returning;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-full mt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-gray-200">
          {t("dash.widgets.customersOverview")}
        </h2>

        <button
          type="button"
          className="border px-3 py-1 rounded-md text-sm flex items-center gap-1 opacity-60 cursor-default"
          aria-hidden
        >
          {t("dash.widgets.today")} <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between mt-4">
        <div className="w-40 h-40">
          {isLoading || total === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">—</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-row gap-6">
          <div>
            <h3 className="text-2xl font-bold">{isLoading ? "…" : firstTime.toLocaleString()}</h3>
            <p className="text-sm text-gray-500">{t("dash.widgets.firstTime")}</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold">{isLoading ? "…" : returning.toLocaleString()}</h3>
            <p className="text-sm text-gray-500">{t("dash.widgets.returnCustomer")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
