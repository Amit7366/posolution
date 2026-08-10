"use client";

import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp, LineChart } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useGetProfitLossQuery } from "@/redux/api/baseApi";
import { money } from "@/app/lib/money";
import {
  parseProfitLossPayload,
  type ProfitLossPreset,
} from "@/app/types/profit-loss";

const PRESETS: { key: ProfitLossPreset; labelKey: string }[] = [
  { key: "1D", labelKey: "dash.dashboard.plToday" },
  { key: "3D", labelKey: "dash.dashboard.pl3Days" },
  { key: "7D", labelKey: "dash.dashboard.pl7Days" },
  { key: "1M", labelKey: "dash.dashboard.plMonthly" },
  { key: "1Y", labelKey: "dash.dashboard.plYearly" },
  { key: "custom", labelKey: "dash.dashboard.plCustom" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function ProfitLossCard() {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<ProfitLossPreset>("1D");
  const [fromDraft, setFromDraft] = useState(daysAgoIso(6));
  const [toDraft, setToDraft] = useState(todayIso());
  const [appliedFrom, setAppliedFrom] = useState(daysAgoIso(6));
  const [appliedTo, setAppliedTo] = useState(todayIso());

  const queryArgs = useMemo(
    () =>
      preset === "custom"
        ? { preset, from: appliedFrom, to: appliedTo }
        : { preset },
    [preset, appliedFrom, appliedTo]
  );

  const skipCustom = preset === "custom" && (!appliedFrom || !appliedTo);
  const { data: raw, isLoading, isFetching, error } = useGetProfitLossQuery(queryArgs, {
    skip: skipCustom,
  });

  const report = useMemo(() => parseProfitLossPayload(raw), [raw]);
  const busy = isLoading || isFetching;
  const profit = report?.totals.grossProfit ?? 0;
  const isProfit = profit >= 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <LineChart size={20} className="text-orange-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {t("dash.dashboard.profitLoss")}
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("dash.dashboard.profitLossSubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                preset === p.key
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-300 bg-gray-100 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {preset === "custom" ? (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">
            <span className="mb-1 block">{t("dash.dashboard.plFrom")}</span>
            <input
              type="date"
              value={fromDraft}
              onChange={(e) => setFromDraft(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <label className="text-sm text-gray-600 dark:text-gray-300">
            <span className="mb-1 block">{t("dash.dashboard.plTo")}</span>
            <input
              type="date"
              value={toDraft}
              onChange={(e) => setToDraft(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setAppliedFrom(fromDraft);
              setAppliedTo(toDraft);
            }}
            className="rounded-md bg-orange-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            {t("dash.dashboard.plApply")}
          </button>
        </div>
      ) : null}

      {error != null ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {String(
            (error as { data?: { message?: string } })?.data?.message ||
              "Failed to load profit & loss."
          )}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label={t("dash.dashboard.plNetSales")}
          value={busy ? "…" : money(report?.totals.netSales ?? 0)}
          hint={
            busy
              ? undefined
              : `${t("dash.dashboard.plSalesReturn")}: ${money(report?.totals.totalSalesReturn ?? 0)}`
          }
        />
        <Metric
          label={t("dash.dashboard.plNetPurchase")}
          value={busy ? "…" : money(report?.totals.netPurchase ?? 0)}
          hint={
            busy
              ? undefined
              : `${t("dash.dashboard.plPurchaseReturn")}: ${money(report?.totals.totalPurchaseReturn ?? 0)}`
          }
        />
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isProfit ? t("dash.dashboard.plGrossProfit") : t("dash.dashboard.plGrossLoss")}
          </p>
          <div
            className={`mt-1 flex items-center gap-2 text-2xl font-bold ${
              isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {busy ? (
              "…"
            ) : (
              <>
                {isProfit ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                {money(Math.abs(profit))}
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {t("dash.dashboard.plMargin")}:{" "}
            {busy || report?.totals.profitMargin == null
              ? "—"
              : `${report.totals.profitMargin}%`}
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("dash.dashboard.plPeriod")}</p>
          <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
            {busy ? "…" : report?.label ?? "—"}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {busy
              ? "…"
              : `${report?.counts.salesOrders ?? 0} ${t("dash.dashboard.plSalesOrders")} · ${
                  report?.counts.purchaseOrders ?? 0
                } ${t("dash.dashboard.plPurchaseOrders")}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
