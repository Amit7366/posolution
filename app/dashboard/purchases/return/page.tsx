"use client";

import AddEditPurchaseReturnModal from "@/app/components/purchase-return/AddEditPurchaseReturnModal";
import DeleteConfirmModal from "@/app/components/purchase-return/DeleteConfirmModal";
import { clampInt, cx, daysAgoISO } from "@/app/lib/cx";
import { apiDocToPurchaseReturn, type ApiPurchaseReturnDoc } from "@/app/lib/purchase-return-api";
import { money } from "@/app/lib/money";
import type { PaymentStatus, PurchaseReturn, ReturnStatus } from "@/app/types/purchase-return";
import { useDeletePurchaseReturnMutation, useGetPurchaseReturnsQuery } from "@/redux/api/baseApi";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Range = "Last7" | "All";

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return String(data.message);
  }
  return null;
}

function StatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold",
        status === "Received"
          ? "border-green-200 bg-green-100 text-green-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "border-blue-200 bg-blue-100 text-blue-700 dark:border-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const classes: Record<PaymentStatus, string> = {
    Paid: "border-green-200 bg-green-100 text-green-700 dark:border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300",
    Unpaid: "border-red-200 bg-red-100 text-red-700 dark:border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-200",
    Overdue: "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-200",
  };
  return (
    <span className={cx("inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold", classes[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function PurchaseReturnPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [debouncedSupplier, setDebouncedSupplier] = useState("");
  const [status, setStatus] = useState<ReturnStatus | "All">("All");
  const [payment, setPayment] = useState<PaymentStatus | "All">("All");
  const [range, setRange] = useState<Range>("All");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<PurchaseReturn | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<PurchaseReturn | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSupplier(supplier.trim()), 350);
    return () => clearTimeout(timer);
  }, [supplier]);

  const returnStatus = status === "All" ? "all" : status === "Received" ? "received" : "pending";
  const paymentStatus =
    payment === "All" ? "all" : payment === "Paid" ? "paid" : payment === "Overdue" ? "overdue" : "unpaid";

  const { data, isLoading, isFetching, error, refetch } = useGetPurchaseReturnsQuery({
    page,
    limit: perPage,
    search: debouncedSearch,
    supplier: debouncedSupplier || undefined,
    returnStatus,
    paymentStatus,
    since: range === "Last7" ? daysAgoISO(7) : undefined,
  });
  const [deleteReturn, { isLoading: deletingApi }] = useDeletePurchaseReturnMutation();

  const rows = useMemo(() => {
    const raw = (data as { data?: ApiPurchaseReturnDoc[] } | undefined)?.data;
    return Array.isArray(raw) ? raw.map(apiDocToPurchaseReturn) : [];
  }, [data]);
  const total = (data as { meta?: { total?: number } } | undefined)?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = clampInt(page, 1, totalPages);
  const pageStart = Math.max(1, Math.min(safePage - 2, totalPages - 4));
  const visiblePages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => pageStart + index);

  useEffect(() => {
    // Keep pagination valid when filtering or deleting reduces the result count.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    const message = errorMessage(error);
    if (message) toast.error(message);
  }, [error]);

  const allChecked = rows.length > 0 && rows.every((row) => selected[row.id]);
  const someChecked = rows.some((row) => selected[row.id]);

  const openAdd = () => {
    setModalMode("add");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: PurchaseReturn) => {
    setModalMode("edit");
    setEditing(row);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteReturn(deleting.id).unwrap();
      toast.success("Purchase return deleted");
      setDeleteOpen(false);
      setDeleting(null);
      void refetch();
    } catch (deleteError) {
      toast.error(errorMessage(deleteError) || "Unable to delete purchase return");
    }
  };

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Purchase returns</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage product returns to suppliers</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Refresh"
            onClick={() => void refetch()}
            className="grid h-10 w-10 place-items-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <RotateCcw size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="ml-2 inline-flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <Plus size={16} />
            Add purchase return
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between dark:border-gray-700">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search returns"
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none focus:border-orange-500 md:max-w-sm dark:border-gray-600 dark:bg-gray-800"
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <input
              value={supplier}
              onChange={(event) => {
                setSupplier(event.target.value);
                setPage(1);
              }}
              placeholder="Filter supplier"
              className="h-10 w-48 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none dark:border-gray-600 dark:bg-gray-800"
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as ReturnStatus | "All");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="All">Return status</option>
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
            </select>
            <select
              value={payment}
              onChange={(event) => {
                setPayment(event.target.value as PaymentStatus | "All");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="All">Payment status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <select
              value={range}
              onChange={(event) => {
                setRange(event.target.value as Range);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="Last7">Last 7 days</option>
              <option value="All">All time</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1150px] w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <th className="w-14 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(element) => {
                      if (element) element.indeterminate = !allChecked && someChecked;
                    }}
                    onChange={() => {
                      const checked = !allChecked;
                      setSelected((current) => {
                        const next = { ...current };
                        rows.forEach((row) => (next[row.id] = checked));
                        return next;
                      });
                    }}
                  />
                </th>
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Reference</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Supplier</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Paid</th>
                <th className="px-4 py-4">Due</th>
                <th className="px-4 py-4">Payment</th>
                <th className="w-28 px-4 py-4" />
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr><td colSpan={11} className="px-4 py-14 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-200 text-sm dark:border-gray-700">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={!!selected[row.id]}
                        onChange={(event) => setSelected((current) => ({ ...current, [row.id]: event.target.checked }))}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                          {row.productImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.productImage} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <span className="font-medium">{row.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                      <div className="font-mono text-xs text-gray-400">{row.returnNo ?? "—"}</div>
                      {row.reference}
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{row.date}</td>
                    <td className="px-4 py-4 font-medium">{row.supplierName}</td>
                    <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                    <td className="px-4 py-4">{money(row.total)}</td>
                    <td className="px-4 py-4">{money(row.paid)}</td>
                    <td className="px-4 py-4">{money(row.due)}</td>
                    <td className="px-4 py-4"><PaymentBadge status={row.paymentStatus} /></td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" title="Edit" onClick={() => openEdit(row)} className="grid h-9 w-9 place-items-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          disabled={deletingApi}
                          onClick={() => {
                            setDeleting(row);
                            setDeleteOpen(true);
                          }}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!isLoading && !isFetching && !rows.length && (
                <tr><td colSpan={11} className="px-4 py-14 text-center text-sm text-gray-500">No purchase returns found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-200 p-4 md:flex-row md:items-center md:justify-between dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows per page</span>
            <select
              value={perPage}
              onChange={(event) => {
                setPerPage(Number(event.target.value));
                setPage(1);
              }}
              className="h-9 rounded-lg border border-gray-300 bg-white px-2 dark:border-gray-600 dark:bg-gray-800"
            >
              {[5, 10, 20, 50].map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
            <span>{total} total</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPage((current) => clampInt(current - 1, 1, totalPages))} className="grid h-9 w-9 place-items-center rounded-lg border border-gray-300 dark:border-gray-600">‹</button>
            {visiblePages.map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                className={cx(
                  "grid h-9 w-9 place-items-center rounded-full text-sm",
                  number === safePage ? "bg-orange-500 text-white" : "border border-gray-300 dark:border-gray-600"
                )}
              >
                {number}
              </button>
            ))}
            <button type="button" onClick={() => setPage((current) => clampInt(current + 1, 1, totalPages))} className="grid h-9 w-9 place-items-center rounded-lg border border-gray-300 dark:border-gray-600">›</button>
          </div>
        </div>
      </div>

      <AddEditPurchaseReturnModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void refetch()}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        title="Delete purchase return?"
        message="This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
