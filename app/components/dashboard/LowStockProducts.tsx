"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

export type LowStockRow = {
  name: string;
  id: string;
  stock: number;
  image: string;
};

type Props = {
  items: LowStockRow[];
  isLoading?: boolean;
};

export default function LowStockProducts({ items, isLoading }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
          ⚠ {t("dash.widgets.lowStock")}
        </h2>

        <Link href="/dashboard/products/low-stock" className="text-blue-500 text-sm hover:underline">
          {t("dash.dashboard.viewAll")}
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm py-8 text-center">…</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">{t("dash.dashboard.noLowStock")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <div
              key={item.id || i}
              className="flex justify-between items-center border-b pb-4 last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.image ? (
                  <img
                    src={item.image}
                    className="w-14 h-14 rounded-md object-cover shrink-0"
                    alt=""
                  />
                ) : (
                  <div className="w-14 h-14 rounded-md bg-gray-100 dark:bg-gray-800 shrink-0" />
                )}

                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {t("dash.widgets.idLabel")}: {item.id}
                  </p>
                </div>
              </div>

              <p className="text-orange-600 font-semibold shrink-0 ml-2">
                {t("dash.widgets.inStock")}{" "}
                <span className="text-black dark:text-white ml-1">{item.stock}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
