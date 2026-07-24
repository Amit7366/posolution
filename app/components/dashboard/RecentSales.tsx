"use client";

import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { money } from "@/app/lib/money";
import { formatDate } from "@/app/lib/format";

export type RecentSaleRow = {
  product: string;
  category: string;
  price: string;
  status: "processing" | "cancelled" | "onhold" | "completed";
  date: string;
  isToday: boolean;
  image: string;
};

type Props = {
  sales: RecentSaleRow[];
  isLoading?: boolean;
};

const statusColor: Record<RecentSaleRow["status"], string> = {
  processing: "bg-purple-100 text-purple-600",
  cancelled: "bg-red-100 text-red-600",
  onhold: "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-600",
};

export default function RecentSales({ sales, isLoading }: Props) {
  const { t } = useTranslation();

  const statusLabel = (s: RecentSaleRow["status"]) => {
    switch (s) {
      case "processing":
        return t("dash.widgets.statusProcessing");
      case "cancelled":
        return t("dash.widgets.statusCancelled");
      case "onhold":
        return t("dash.widgets.statusOnhold");
      case "completed":
        return t("dash.widgets.statusCompleted");
      default:
        return s;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
          🧊 {t("dash.widgets.recentSales")}
        </h2>

        <button
          type="button"
          className="border px-3 py-1 rounded-md text-sm flex items-center gap-1 opacity-70"
        >
          {t("dash.widgets.weekly")} <ChevronDown size={16} />
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm py-8 text-center">…</p>
      ) : sales.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">{t("dash.dashboard.noRecentSales")}</p>
      ) : (
        sales.map((item, i) => (
          <div
            key={`${item.product}-${i}`}
            className="flex justify-between items-center border-b pb-4 last:border-b-0 mb-4"
          >
            <div className="flex gap-3 min-w-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="w-14 h-14 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-md bg-gray-100 dark:bg-gray-800 shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{item.product}</h3>
                <p className="text-gray-500 text-sm truncate">
                  {item.category} • {item.price}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 ml-2">
              <p className="text-gray-500 text-sm">
                {item.isToday ? t("dash.widgets.today") : formatDate(item.date)}
              </p>
              <span className={`px-3 py-1 text-xs rounded-full mt-1 ${statusColor[item.status]}`}>
                {statusLabel(item.status)}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function mapRecentInvoicesToRows(
  items: Array<{
    productLabel: string;
    categoryLabel: string;
    amount: number;
    status: "paid" | "unpaid" | "overdue";
    date: string;
    isToday: boolean;
    imageUrl: string;
  }>
): RecentSaleRow[] {
  return items.map((it) => {
    let status: RecentSaleRow["status"] = "onhold";
    if (it.status === "paid") status = "completed";
    else if (it.status === "overdue") status = "processing";
    else status = "onhold";
    return {
      product: it.productLabel,
      category: it.categoryLabel,
      price: money(it.amount),
      status,
      date: it.date,
      isToday: it.isToday,
      image: it.imageUrl,
    };
  });
}
