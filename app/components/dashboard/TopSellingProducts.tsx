"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ChevronDown } from "lucide-react";
import { money } from "@/app/lib/money";

export type TopSellingRow = {
  name: string;
  price: string;
  salesCount: number;
  growth: number;
  image: string;
};

type Props = {
  products: TopSellingRow[];
  isLoading?: boolean;
};

export default function TopSellingProducts({ products, isLoading }: Props) {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
          🧊 {t("dash.widgets.topSelling")}
        </h2>

        <button
          type="button"
          onClick={() => setFilterOpen(!filterOpen)}
          className="border px-3 py-1 rounded-md text-sm flex items-center gap-1 opacity-70"
        >
          {t("dash.widgets.today")} <ChevronDown size={16} />
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm py-8 text-center">…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">{t("dash.dashboard.noProducts")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex justify-between items-center border-b pb-4 last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                {p.image ? (
                  <img
                    src={p.image}
                    className="w-14 h-14 rounded-md object-cover shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-14 h-14 rounded-md bg-gray-100 dark:bg-gray-800 shrink-0" />
                )}

                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {p.name}
                  </h3>
                  <p className="text-gray-500 text-sm truncate">
                    {p.price} • {t("dash.widgets.salesPlus", { n: p.salesCount })}
                  </p>
                </div>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full shrink-0 ml-2 ${
                  p.growth >= 0
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {p.growth >= 0 ? `⬆ ${p.growth}%` : `⬇ ${Math.abs(p.growth)}%`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function mapTopProductsToRows(
  items: Array<{ name: string; price: number; qtySold: number; imageUrl: string }>
): TopSellingRow[] {
  return items.map((it) => ({
    name: it.name,
    price: money(it.price),
    salesCount: it.qtySold,
    growth: 0,
    image: it.imageUrl,
  }));
}
