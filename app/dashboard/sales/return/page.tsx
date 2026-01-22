"use client";

import AddEditSalesReturnModal from "@/app/components/sales-return/AddEditSalesReturnModal";
import DeleteConfirmModal from "@/app/components/sales-return/DeleteConfirmModal";
import { clampInt, cx, daysAgoISO } from "@/app/lib/cx";
import { customers, seedSalesReturns } from "@/app/lib/sales-return/data";
import { PaymentStatus, ReturnStatus, SalesReturn } from "@/app/types/sales-return";
import { FileText, Pencil, Plus, RotateCcw, Sheet, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";


type SortRange = "Last7" | "All";

function StatusBadge({ status }: { status: ReturnStatus }) {
  const cls =
    status === "Received"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
      : "bg-sky-500/15 text-sky-300 border-sky-500/20";
  return (
    <span className={cx("inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, string> = {
    Paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    Unpaid: "bg-rose-500/15 text-rose-200 border-rose-500/20",
    Overdue: "bg-amber-500/15 text-amber-200 border-amber-500/20",
  };
  return (
    <span className={cx("inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs font-semibold", map[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function SalesReturnPage() {
  const [rows, setRows] = useState<SalesReturn[]>(seedSalesReturns);

  // toolbar states
  const [q, setQ] = useState("");
  const [filterCustomer, setFilterCustomer] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | "All">("All");
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | "All">("All");
  const [sortRange, setSortRange] = useState<SortRange>("All");

  // pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // selection
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<SalesReturn | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<SalesReturn | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const minDate = sortRange === "Last7" ? daysAgoISO(7) : null;

    return rows
      .filter((r) => {
        if (minDate && r.date < minDate) return false;

        if (filterCustomer !== "All" && r.customer.id !== filterCustomer) return false;
        if (filterStatus !== "All" && r.status !== filterStatus) return false;
        if (filterPayment !== "All" && r.paymentStatus !== filterPayment) return false;

        if (!query) return true;
        return (
          r.productName.toLowerCase().includes(query) ||
          r.customer.name.toLowerCase().includes(query) ||
          r.reference.toLowerCase().includes(query)
        );
      });
  }, [rows, q, filterCustomer, filterStatus, filterPayment, sortRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = clampInt(page, 1, totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage, perPage]);

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

  const submitModal = (payload: SalesReturn) => {
    setRows((prev) => {
      if (modalMode === "edit") {
        return prev.map((r) => (r.id === payload.id ? payload : r));
      }
      return [payload, ...prev];
    });
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    setRows((prev) => prev.filter((r) => r.id !== deleting.id));
    setDeleteOpen(false);
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-[#06090d] p-6 text-white">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Sales Return</h1>
          <p className="mt-1 text-sm text-white/50">Manage your returns</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/20 hover:bg-white/5">
            <FileText size={18} className="text-red-400" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/20 hover:bg-white/5">
            <Sheet size={18} className="text-emerald-400" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-black/20 hover:bg-white/5">
            <RotateCcw size={18} className="text-white/70" />
          </button>

          <button
            onClick={openAdd}
            className="ml-2 inline-flex h-10 items-center gap-2 rounded-lg bg-[#ffa24a] px-4 text-sm font-semibold text-white hover:brightness-110"
          >
            <Plus size={16} />
            Add Sales Return
          </button>
        </div>
      </div>

      {/* card */}
      <div className="mt-5 rounded-xl border border-white/10 bg-black/20 shadow-[0_30px_90px_rgba(0,0,0,.55)]">
        {/* toolbar */}
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search"
              className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <select
              value={filterCustomer}
              onChange={(e) => {
                setFilterCustomer(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#0b0f14]" value="All">Customer</option>
              {customers.map((c) => (
                <option className="bg-[#0b0f14]" key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#0b0f14]" value="All">Status</option>
              <option className="bg-[#0b0f14]" value="Received">Received</option>
              <option className="bg-[#0b0f14]" value="Pending">Pending</option>
            </select>

            <select
              value={filterPayment}
              onChange={(e) => {
                setFilterPayment(e.target.value as any);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#0b0f14]" value="All">Payment Status</option>
              <option className="bg-[#0b0f14]" value="Paid">Paid</option>
              <option className="bg-[#0b0f14]" value="Unpaid">Unpaid</option>
              <option className="bg-[#0b0f14]" value="Overdue">Overdue</option>
            </select>

            <select
              value={sortRange}
              onChange={(e) => {
                setSortRange(e.target.value as SortRange);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none"
            >
              <option className="bg-[#0b0f14]" value="Last7">Sort By : Last 7 Days</option>
              <option className="bg-[#0b0f14]" value="All">Sort By : All</option>
            </select>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full">
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
                <th className="px-4 py-4">Product</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Paid</th>
                <th className="px-4 py-4">Due</th>
                <th className="px-4 py-4">Payment Status</th>
                <th className="w-28 px-4 py-4 text-right"></th>
              </tr>
            </thead>

            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="border-b border-white/10 text-sm">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={!!selected[r.id]}
                      onChange={(e) =>
                        setSelected((prev) => ({ ...prev, [r.id]: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-white/20 bg-black/30"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.productImage} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="font-medium">{r.productName}</div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-white/60">{r.date}</td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded bg-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.customer.avatar} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="font-medium">{r.customer.name}</div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="px-4 py-4 text-white/70">${r.total}</td>
                  <td className="px-4 py-4 text-white/70">${r.paid}</td>
                  <td className="px-4 py-4 text-white/70">${r.due}</td>

                  <td className="px-4 py-4">
                    <PaymentBadge status={r.paymentStatus} />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 hover:bg-white/5"
                        title="Edit"
                      >
                        <Pencil size={16} className="text-white/80" />
                      </button>
                      <button
                        onClick={() => openDelete(r)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 hover:bg-white/5"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-white/80" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-14 text-center text-sm text-white/40">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* footer */}
        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Row Per Page</span>
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
            <span>Entries</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setPage((p) => clampInt(p - 1, 1, totalPages))}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 text-white/80 hover:bg-white/5"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const n = i + 1;
              const active = n === safePage;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cx(
                    "grid h-9 w-9 place-items-center rounded-full text-sm",
                    active ? "bg-[#ffa24a] text-white" : "border border-white/10 bg-black/30 text-white/70 hover:bg-white/5"
                  )}
                >
                  {n}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => clampInt(p + 1, 1, totalPages))}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/30 text-white/80 hover:bg-white/5"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* modals */}
      <AddEditSalesReturnModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModal}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
