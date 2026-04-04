"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Invoice, InvoiceStatus } from "@/app/types/invoice";
import { formatDate } from "@/app/lib/format";
import { money } from "@/app/lib/money";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import { CreateInvoiceModal } from "@/app/components/invoices/CreateInvoiceModal";
import { apiInvoiceToInvoice, type ApiInvoiceDoc } from "@/app/lib/invoice-api";
import { cn } from "@/app/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  useDeleteInvoiceMutation,
  useGetInvoicesQuery,
} from "@/redux/api/baseApi";
import { toast } from "sonner";
import { Plus } from "lucide-react";

function getQueryErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "object" && error !== null && "data" in error) {
    const d = (error as { data?: { message?: string } }).data;
    if (d?.message) return String(d.message);
  }
  if (typeof error === "object" && error !== null && "error" in error) {
    return String((error as { error: string }).error);
  }
  return null;
}

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [debouncedCustomer, setDebouncedCustomer] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "All">("All");
  const [sort, setSort] = useState<"Last7" | "All">("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(q.trim()), 350);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCustomer(customerFilter.trim()), 350);
    return () => clearTimeout(timer);
  }, [customerFilter]);

  const since =
    sort === "Last7"
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          return d.toISOString();
        })()
      : undefined;

  const apiStatus = useMemo(() => {
    if (status === "All") return "all" as const;
    if (status === "Paid") return "paid" as const;
    if (status === "Unpaid") return "unpaid" as const;
    return "overdue" as const;
  }, [status]);

  const {
    data: listPayload,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetInvoicesQuery({
    page,
    limit: rowsPerPage,
    search: debouncedSearch,
    status: apiStatus,
    since,
    customer: debouncedCustomer || undefined,
  });

  const rows: Invoice[] = useMemo(() => {
    const raw = (listPayload as { data?: ApiInvoiceDoc[] } | undefined)?.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((doc) => apiInvoiceToInvoice(doc));
  }, [listPayload]);

  const total = (listPayload as { meta?: { total?: number } } | undefined)?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);

  const [deleteInvoice, { isLoading: deleting }] = useDeleteInvoiceMutation();

  useEffect(() => {
    const msg = getQueryErrorMessage(error);
    if (msg) toast.error(msg);
  }, [error]);

  const onDelete = async (id: string) => {
    if (!window.confirm(t("dash.invoices.deleteConfirm"))) return;
    try {
      await deleteInvoice(id).unwrap();
      toast.success(t("dash.invoices.deletedOk"));
      void refetch();
    } catch (e: unknown) {
      const msg = getQueryErrorMessage(e);
      toast.error(msg || t("dash.invoices.deleteFail"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t("dash.invoices.title")}</h1>
            <p className="mt-1 text-sm text-slate-400">{t("dash.invoices.manage")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-14px_rgba(249,115,22,0.85)] transition hover:bg-orange-400 active:translate-y-[1px]"
            >
              <Plus className="h-4 w-4" />
              {t("dash.invoices.addButton")}
            </button>
            <TopIconButton title={t("dash.common.exportPdf")} onClick={() => window.print()}>
              <PdfIcon />
            </TopIconButton>
            <TopIconButton title={t("dash.common.refresh")} onClick={() => void refetch()}>
              <RefreshIcon />
            </TopIconButton>
            <TopIconButton title={t("dash.invoices.optionalCollapse")} onClick={() => alert(t("dash.invoices.optionalCollapse"))}>
              <ChevronUpIcon />
            </TopIconButton>
          </div>
        </div>

        <CreateInvoiceModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => void refetch()} />

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="relative w-full max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder={t("dash.common.search")}
                className="w-full rounded-xl border border-white/10 bg-[#0b0f14] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                value={customerFilter}
                onChange={(e) => {
                  setCustomerFilter(e.target.value);
                  setPage(1);
                }}
                placeholder={t("dash.invoices.customerFilterPh")}
                className="h-10 w-48 rounded-lg border border-white/10 bg-[#0b0f14] px-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
              />
              <FilterSelect
                value={status}
                onChange={(v) => {
                  setStatus(v as InvoiceStatus | "All");
                  setPage(1);
                }}
                options={[
                  { value: "All", label: t("dash.invoices.statusFilter") },
                  { value: "Paid", label: t("dash.invoices.paid") },
                  { value: "Unpaid", label: t("dash.invoices.unpaid") },
                  { value: "Overdue", label: t("dash.invoices.overdue") },
                ]}
              />
              <FilterSelect
                value={sort}
                onChange={(v) => {
                  setSort(v as "Last7" | "All");
                  setPage(1);
                }}
                options={[
                  { value: "Last7", label: t("dash.invoices.sortLast7") },
                  { value: "All", label: t("dash.invoices.sortAll") },
                ]}
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="text-left text-sm text-slate-300">
                  <th className="w-12 px-5 py-4" />
                  <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.invoices.colInvoiceNo")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.invoices.colCustomer")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.invoices.colDueDate")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.invoices.colAmount")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.invoices.colPaid")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.invoices.colAmountDue")}</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">{t("dash.invoices.colStatus")}</th>
                  <th className="w-40 px-5 py-4 text-right font-semibold text-slate-100" />
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {isLoading || isFetching ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center text-sm text-slate-400">
                      {t("dash.common.loading")}
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <div className="h-5 w-5 rounded-md border border-white/15 bg-black/20" />
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-100">{r.invoiceNo}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.customer.name} />
                          <div className="text-sm font-semibold text-slate-100">{r.customer.name}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{formatDate(r.dueDate)}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{money(r.amount)}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{money(r.paid)}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{money(r.amountDue)}</td>
                      <td className="px-5 py-4">
                        <InvoiceBadge status={r.status} t={t} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/sales/invoices/${r.id}`}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/20 text-white transition hover:bg-white/[0.06] active:translate-y-[1px]"
                            title={t("dash.invoices.view")}
                          >
                            <EyeIcon />
                          </Link>
                          <button
                            type="button"
                            disabled={deleting}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/20 text-white transition hover:bg-white/[0.06] active:translate-y-[1px] disabled:opacity-40"
                            title={t("dash.common.delete")}
                            onClick={() => void onDelete(r.id)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}

                {!isLoading && !isFetching && rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center text-sm text-slate-400">
                      {t("dash.invoices.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{t("dash.common.rowPerPage")}</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                className="rounded-lg border border-white/10 bg-[#0b0f14] px-2 py-1.5 text-slate-200 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span>{t("dash.common.entries")}</span>
              <span className="text-slate-500">{t("dash.common.totalCount", { count: total })}</span>
            </div>

            <div className="flex items-center gap-2">
              <PageNavButton
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                title={t("dash.common.previous")}
              >
                <ChevronLeftIcon />
              </PageNavButton>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(249,115,22,0.9)]">
                {safePage}
              </span>
              <PageNavButton
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                title={t("dash.common.next")}
              >
                <ChevronRightIcon />
              </PageNavButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white/10 text-xs font-bold text-slate-100 ring-1 ring-white/10">
      <span>{initials}</span>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-white/10 bg-[#0b0f14] px-3 pr-9 text-sm font-semibold text-slate-100 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        <ChevronDownIcon />
      </span>
    </div>
  );
}

function TopIconButton({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
    >
      {children}
    </button>
  );
}

function PageNavButton({
  children,
  disabled,
  onClick,
  title,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-white/[0.02] active:translate-y-0"
      )}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6l1 15h8l1-15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
