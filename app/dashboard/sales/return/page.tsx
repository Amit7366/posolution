"use client";

import AddEditSalesReturnModal from "@/app/components/sales-return/AddEditSalesReturnModal";
import DeleteConfirmModal from "@/app/components/sales-return/DeleteConfirmModal";
import { clampInt, cx, daysAgoISO } from "@/app/lib/cx";
import { apiDocToSalesReturn, type ApiSalesReturnDoc } from "@/app/lib/sales-return-api";
import { money } from "@/app/lib/money";
import type { PaymentStatus, ReturnStatus, SalesReturn } from "@/app/types/sales-return";
import {
  useDeleteSalesReturnMutation,
  useGetSalesReturnsQuery,
} from "@/redux/api/baseApi";
import { FileText, Pencil, Plus, RotateCcw, Sheet, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toast } from "sonner";

type SortRange = "Last7" | "All";

function getQueryErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "object" && error !== null && "data" in error) {
    const d = (error as { data?: { message?: string } }).data;
    if (d?.message) return String(d.message);
  }
  return null;
}

function StatusBadge({ status, label }: { status: ReturnStatus; label: string }) {
  const cls =
    status === "Received"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
      : "bg-sky-500/15 text-sky-300 border-sky-500/20";
  return (
    <span className={cx("inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function PaymentBadge({ status, label }: { status: PaymentStatus; label: string }) {
  const map: Record<PaymentStatus, string> = {
    Paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    Unpaid: "bg-rose-500/15 text-rose-200 border-rose-500/20",
    Overdue: "bg-amber-500/15 text-amber-200 border-amber-500/20",
  };
  return (
    <span className={cx("inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold", map[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function Avatar({ name, url }: { name: string; url?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div className="h-10 w-10 overflow-hidden rounded bg-white/10">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-xs font-bold text-white/80">{initials}</div>
      )}
    </div>
  );
}

export default function SalesReturnPage() {
  const { t } = useTranslation();

  const [q, setQ] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [debouncedCustomer, setDebouncedCustomer] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | "All">("All");
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | "All">("All");
  const [sortRange, setSortRange] = useState<SortRange>("All");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<SalesReturn | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<SalesReturn | null>(null);

  useEffect(() => {
    const tmr = setTimeout(() => setDebouncedSearch(q.trim()), 350);
    return () => clearTimeout(tmr);
  }, [q]);

  const [customerInput, setCustomerInput] = useState("");
  useEffect(() => {
    const tmr = setTimeout(() => setDebouncedCustomer(customerInput.trim()), 350);
    return () => clearTimeout(tmr);
  }, [customerInput]);

  const since = sortRange === "Last7" ? daysAgoISO(7) : undefined;

  const apiReturnStatus = useMemo(() => {
    if (filterStatus === "All") return "all" as const;
    if (filterStatus === "Pending") return "pending" as const;
    return "received" as const;
  }, [filterStatus]);

  const apiPaymentStatus = useMemo(() => {
    if (filterPayment === "All") return "all" as const;
    if (filterPayment === "Paid") return "paid" as const;
    if (filterPayment === "Unpaid") return "unpaid" as const;
    return "overdue" as const;
  }, [filterPayment]);

  const {
    data: listPayload,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetSalesReturnsQuery({
    page,
    limit: perPage,
    search: debouncedSearch,
    returnStatus: apiReturnStatus,
    paymentStatus: apiPaymentStatus,
    since,
    customer: debouncedCustomer || undefined,
  });

  const rows: SalesReturn[] = useMemo(() => {
    const raw = (listPayload as { data?: ApiSalesReturnDoc[] } | undefined)?.data;
    if (!Array.isArray(raw)) return [];
    return raw.map((doc) => apiDocToSalesReturn(doc));
  }, [listPayload]);

  const total = (listPayload as { meta?: { total?: number } } | undefined)?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const safePage = clampInt(page, 1, totalPages);

  const [deleteReturn, { isLoading: deletingApi }] = useDeleteSalesReturnMutation();

  useEffect(() => {
    const msg = getQueryErrorMessage(error);
    if (msg) toast.error(msg);
  }, [error]);

  const pageRows = rows;

  const allChecked = pageRows.length > 0 && pageRows.every((r) => selected[r.id]);
  const someChecked = pageRows.some((r) => selected[r.id]);

  const toggleAll = () => {
    setSelected((prev) => {
      const next = { ...prev };
      const target = !allChecked;
      pageRows.forEach((r) => (next[r.id] = target));
      return next;
    });
  };

  const openAdd = () => {
    setModalMode("add");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: SalesReturn) => {
    setModalMode("edit");
    setEditing(row);
    setModalOpen(true);
  };

  const openDelete = (row: SalesReturn) => {
    setDeleting(row);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteReturn(deleting.id).unwrap();
      toast.success(t("dash.salesReturn.deleteOk"));
      setDeleteOpen(false);
      setDeleting(null);
      void refetch();
    } catch (e: unknown) {
      toast.error(getQueryErrorMessage(e) || t("dash.salesReturn.deleteFail"));
    }
  };

  return (
    <div className="min-h-screen bg-[#06090d] p-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{t("dash.salesReturn.title")}</h1>
          <p className="mt-1 text-sm text-white/50">{t("dash.salesReturn.manage")}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title={t("dash.common.refresh")}
            onClick={() => void refetch()}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/20 hover:bg-white/5"
          >
            <RotateCcw size={18} className="text-white/70" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/20 hover:bg-white/5">
            <FileText size={18} className="text-red-400" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/20 hover:bg-white/5">
            <Sheet size={18} className="text-emerald-400" />
          </button>

          <button
            onClick={openAdd}
            className="ml-2 inline-flex h-10 items-center gap-2 rounded-lg bg-[#ffa24a] px-4 text-sm font-semibold text-white hover:brightness-110"
          >
            <Plus size={16} />
            {t("dash.salesReturn.add")}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 shadow-[0_30px_90px_rgba(0,0,0,.55)]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder={t("dash.common.search")}
              className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <input
              value={customerInput}
              onChange={(e) => {
                setCustomerInput(e.target.value);
                setPage(1);
              }}
              placeholder={t("dash.salesReturn.customerFilterPh")}
              className="h-10 w-48 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none"
            />

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as ReturnStatus | "All");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#0b0f14]" value="All">
                {t("dash.common.status")}
              </option>
              <option className="bg-[#0b0f14]" value="Received">
                {t("dash.salesReturn.received")}
              </option>
              <option className="bg-[#0b0f14]" value="Pending">
                {t("dash.salesReturn.pending")}
              </option>
            </select>

            <select
              value={filterPayment}
              onChange={(e) => {
                setFilterPayment(e.target.value as PaymentStatus | "All");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#0b0f14]" value="All">
                {t("dash.salesReturn.paymentStatus")}
              </option>
              <option className="bg-[#0b0f14]" value="Paid">
                {t("dash.invoices.paid")}
              </option>
              <option className="bg-[#0b0f14]" value="Unpaid">
                {t("dash.invoices.unpaid")}
              </option>
              <option className="bg-[#0b0f14]" value="Overdue">
                {t("dash.invoices.overdue")}
              </option>
            </select>

            <select
              value={sortRange}
              onChange={(e) => {
                setSortRange(e.target.value as SortRange);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#0b0f14]" value="Last7">
                {t("dash.salesReturn.sortLast7")}
              </option>
              <option className="bg-[#0b0f14]" value="All">
                {t("dash.salesReturn.sortAll")}
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full">
            <thead>
              <tr className="bg-[#1b222c] text-left text-sm text-white/80">
                <th className="w-14 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = !allChecked && someChecked;
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-white/20 bg-black/30"
                  />
                </th>
                <th className="px-4 py-4">{t("dash.salesReturn.colProduct")}</th>
                <th className="px-4 py-4">{t("dash.salesReturn.colRef")}</th>
                <th className="px-4 py-4">{t("dash.salesReturn.colDate")}</th>
                <th className="px-4 py-4">{t("dash.salesReturn.colCustomer")}</th>
                <th className="px-4 py-4">{t("dash.salesReturn.colStatus")}</th>
                <th className="px-4 py-4">{t("dash.salesReturn.colTotal")}</th>
                <th className="px-4 py-4">{t("dash.salesReturn.colPaid")}</th>
                <th className="px-4 py-4">{t("dash.salesReturn.colDue")}</th>
                <th className="px-4 py-4">{t("dash.salesReturn.paymentStatus")}</th>
                <th className="w-28 px-4 py-4 text-right" />
              </tr>
            </thead>

            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={11} className="px-4 py-14 text-center text-sm text-white/40">
                    {t("dash.common.loading")}
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.id} className="border-b border-white/10 text-sm">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={!!selected[r.id]}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [r.id]: e.target.checked }))}
                        className="h-4 w-4 rounded border-white/20 bg-black/30"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded bg-white/10">
                          {r.productImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.productImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-white/5" />
                          )}
                        </div>
                        <div className="font-medium">{r.productName}</div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-white/70">
                      <div className="font-mono text-xs text-white/40">{r.returnNo ?? "—"}</div>
                      <div>{r.reference}</div>
                    </td>

                    <td className="px-4 py-4 text-white/60">{r.date}</td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.customer.name} url={r.customer.avatar} />
                        <div className="font-medium">{r.customer.name}</div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        status={r.status}
                        label={r.status === "Received" ? t("dash.salesReturn.received") : t("dash.salesReturn.pending")}
                      />
                    </td>

                    <td className="px-4 py-4 text-white/70">{money(r.total)}</td>
                    <td className="px-4 py-4 text-white/70">{money(r.paid)}</td>
                    <td className="px-4 py-4 text-white/70">{money(r.due)}</td>

                    <td className="px-4 py-4">
                      <PaymentBadge
                        status={r.paymentStatus}
                        label={
                          r.paymentStatus === "Paid"
                            ? t("dash.invoices.paid")
                            : r.paymentStatus === "Unpaid"
                              ? t("dash.invoices.unpaid")
                              : t("dash.invoices.overdue")
                        }
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 hover:bg-white/5"
                          title={t("dash.common.edit")}
                        >
                          <Pencil size={16} className="text-white/80" />
                        </button>
                        <button
                          onClick={() => openDelete(r)}
                          disabled={deletingApi}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 hover:bg-white/5 disabled:opacity-40"
                          title={t("dash.common.delete")}
                        >
                          <Trash2 size={16} className="text-white/80" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && !isFetching && pageRows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-14 text-center text-sm text-white/40">
                    {t("dash.salesReturn.noResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>{t("dash.common.rowPerPage")}</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-white outline-none"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n} className="bg-[#0b0f14]">
                  {n}
                </option>
              ))}
            </select>
            <span>{t("dash.common.entries")}</span>
            <span className="text-white/40">{t("dash.common.totalCount", { count: total })}</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              title={t("dash.common.previous")}
              onClick={() => setPage((p) => clampInt(p - 1, 1, totalPages))}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 text-white/80 hover:bg-white/5"
            >
              ‹
            </button>

            {Array.from({ length: totalPages })
              .slice(0, 5)
              .map((_, i) => {
                const n = i + 1;
                const active = n === safePage;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={cx(
                      "grid h-9 w-9 place-items-center rounded-full text-sm",
                      active
                        ? "bg-[#ffa24a] text-white"
                        : "border border-white/10 bg-black/30 text-white/70 hover:bg-white/5"
                    )}
                  >
                    {n}
                  </button>
                );
              })}

            <button
              type="button"
              title={t("dash.common.next")}
              onClick={() => setPage((p) => clampInt(p + 1, 1, totalPages))}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 text-white/80 hover:bg-white/5"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <AddEditSalesReturnModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void refetch()}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        title={t("dash.salesReturn.deleteTitle")}
        message={t("dash.salesReturn.deleteMessage")}
        cancelLabel={t("dash.common.cancel")}
        confirmLabel={t("dash.salesReturn.deleteConfirmBtn")}
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
