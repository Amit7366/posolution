"use client";

import { UsersRound, ShoppingCart, Truck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import CustomersOverviewCard from "./CustomersOverviewCard";

type Props = {
  suppliers: number;
  customers: number;
  orders: number;
  firstTimeCustomers: number;
  returningCustomers: number;
  isLoading?: boolean;
};

export default function OverallInformationCard({
  suppliers,
  customers,
  orders,
  firstTimeCustomers,
  returningCustomers,
  isLoading,
}: Props) {
  const { t } = useTranslation();
  const n = (v: number) => (isLoading ? "…" : v.toLocaleString());

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-full">
      <h2 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-200">
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">i</span>
        {t("dash.widgets.overallInfo")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="border p-4 rounded-xl text-center">
          <Truck className="mx-auto text-blue-500" />
          <p>{t("dash.widgets.suppliers")}</p>
          <h3 className="font-bold text-xl">{n(suppliers)}</h3>
        </div>
        <div className="border p-4 rounded-xl text-center">
          <UsersRound className="mx-auto text-orange-500" />
          <p>{t("dash.widgets.customer")}</p>
          <h3 className="font-bold text-xl">{n(customers)}</h3>
        </div>
        <div className="border p-4 rounded-xl text-center">
          <ShoppingCart className="mx-auto text-green-600" />
          <p>{t("dash.widgets.orders")}</p>
          <h3 className="font-bold text-xl">{n(orders)}</h3>
        </div>
      </div>
      <CustomersOverviewCard
        firstTime={firstTimeCustomers}
        returning={returningCustomers}
        isLoading={isLoading}
      />
    </div>
  );
}
