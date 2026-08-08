"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Phone, Banknote, Eye, History, Search, RefreshCcw } from "lucide-react";
import {
  useGetInvoicesQuery,
  useGetInvoiceCollectionsQuery,
} from "@/redux/api/baseApi";
import { useTranslation } from "@/lib/i18n/useTranslation";
import CollectDueModal, { type CollectDueTarget } from "@/app/components/dues/CollectDueModal";

type InvoiceRow = {
  _id: string;
  invoiceNo: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  paid: number;
  dueDate: string;
  status: string;
  hold?: boolean;
};

function money(n: number) {
  return `৳${Number(n || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function amountDueOf(inv: InvoiceRow) {
  return Math.round((Number(inv.totalAmount) - Number(inv.paid)) * 100) / 100;
}

function isOverdue(inv: InvoiceRow) {
  const due = new Date(inv.dueDate);
  const sod = new Date();
  sod.setHours(0, 0, 0, 0);
  return inv.status === "unpaid" && !inv.hold && due.getTime() < sod.getTime() && amountDueOf(inv) > 0;
}

export default function DuesPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [collectTarget, setCollectTarget] = useState<CollectDueTarget | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  useEffect(() => {
    const tmr = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(tmr);
  }, [searchInput]);

  const { data, isLoading, isFetching, refetch } = useGetInvoicesQuery({
    page,
    limit: 20,
    search,
    status: overdueOnly ? "overdue" : "due",
  });

  const rows: InvoiceRow[] = useMemo(() => {
    const raw = (data as { data?: InvoiceRow[] })?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const meta = (data as { meta?: { page: number; limit: number; total: number } } | undefined)?.meta;
  const total = meta?.total ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / (meta?.limit || 20)));

  const { data: historyPayload, isFetching: historyLoading } = useGetInvoiceCollectionsQuery(
    historyId ?? "",
    { skip: !historyId }
  );
  const historyRows = useMemo(() => {
    const raw = (historyPayload as { data?: unknown })?.data;
    return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  }, [historyPayload]);

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-gray-200">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t("dash.dues.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("dash.dues.manage")}</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {t("dash.common.refresh")}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder={t("dash.dues.searchPh")}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
        <select
          value={overdueOnly ? "overdue" : "all"}
          onChange={(e) => {
            setOverdueOnly(e.target.value === "overdue");
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="all">{t("dash.dues.filterAll")}</option>
          <option value="overdue">{t("dash.dues.filterOverdue")}</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-500">{t("dash.common.loading")}</div>
        ) : (
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <th className="px-4 py-3">{t("dash.dues.colInvoice")}</th>
                <th className="px-4 py-3">{t("dash.dues.colCustomer")}</th>
                <th className="px-4 py-3">{t("dash.dues.colPhone")}</th>
                <th className="px-4 py-3">{t("dash.dues.colTotal")}</th>
                <th className="px-4 py-3">{t("dash.dues.colPaid")}</th>
                <th className="px-4 py-3">{t("dash.dues.colDue")}</th>
                <th className="px-4 py-3">{t("dash.dues.colDueDate")}</th>
                <th className="px-4 py-3">{t("dash.dues.colStatus")}</th>
                <th className="px-4 py-3 text-right">{t("dash.common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    {t("dash.dues.empty")}
                  </td>
                </tr>
              ) : (
                rows.map((inv) => {
                  const due = amountDueOf(inv);
                  const overdue = isOverdue(inv);
                  const partial = Number(inv.paid) > 0 && due > 0;
                  const phone = (inv.customerPhone || "").trim();
                  return (
                    <tr
                      key={inv._id}
                      className="border-t border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 font-medium">{inv.invoiceNo}</td>
                      <td className="px-4 py-3">{inv.customerName || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{phone || "—"}</td>
                      <td className="px-4 py-3">{money(inv.totalAmount)}</td>
                      <td className="px-4 py-3">{money(inv.paid)}</td>
                      <td className="px-4 py-3 font-semibold text-orange-600 dark:text-orange-400">
                        {money(due)}
                      </td>
                      <td className="px-4 py-3">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${
                            overdue
                              ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                              : partial
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
                          }`}
                        >
                          {overdue
                            ? t("dash.dues.overdue")
                            : partial
                              ? t("dash.dues.partial")
                              : t("dash.dues.due")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1">
                          {phone ? (
                            <a
                              href={`tel:${phone}`}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
                              title={t("dash.dues.call")}
                            >
                              <Phone size={14} />
                              {t("dash.dues.call")}
                            </a>
                          ) : (
                            <span className="px-2 py-1.5 text-xs text-gray-400">{t("dash.dues.noPhone")}</span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setCollectTarget({
                                id: inv._id,
                                invoiceNo: inv.invoiceNo,
                                customerName: inv.customerName || "",
                                amountDue: due,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
                          >
                            <Banknote size={14} />
                            {t("dash.dues.collect")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryId(inv._id)}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
                          >
                            <History size={14} />
                            {t("dash.dues.history")}
                          </button>
                          <Link
                            href={`/dashboard/sales/invoices/${inv._id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
                          >
                            <Eye size={14} />
                            {t("dash.dues.view")}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-sm dark:border-gray-700">
          <span className="text-gray-500">
            {t("dash.common.totalCount", { count: String(total) })}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-600"
            >
              {t("dash.common.previous")}
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40 dark:border-gray-600"
            >
              {t("dash.common.next")}
            </button>
          </div>
        </div>
      </div>

      {historyId ? (
        <div className="fixed inset-0 z-[70] grid place-items-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setHistoryId(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 text-lg font-semibold">{t("dash.dues.history")}</h3>
            {historyLoading ? (
              <p className="text-sm text-gray-500">{t("dash.common.loading")}</p>
            ) : historyRows.length === 0 ? (
              <p className="text-sm text-gray-500">{t("dash.dues.noHistory")}</p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
                {historyRows.map((h) => (
                  <li
                    key={String(h._id)}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-700"
                  >
                    <div>
                      <div className="font-medium">{money(Number(h.amount))}</div>
                      <div className="text-xs text-gray-500">
                        {String(h.paymentType || "cash")} ·{" "}
                        {h.collectedAt ? new Date(String(h.collectedAt)).toLocaleString() : "—"}
                      </div>
                      {h.note ? <div className="text-xs text-gray-400">{String(h.note)}</div> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
              >
                {t("dash.common.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <CollectDueModal
        open={!!collectTarget}
        target={collectTarget}
        onClose={() => setCollectTarget(null)}
        onCollected={() => void refetch()}
      />
    </div>
  );
}
