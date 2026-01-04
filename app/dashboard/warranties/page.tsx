"use client";

import { AddEditWarrantyModal } from "@/app/components/warranties/AddEditWarrantyModal";
import { DeleteWarrantyModal } from "@/app/components/warranties/DeleteWarrantyModal";
import { WarrantyTable } from "@/app/components/warranties/WarrantyTable";
import { WarrantyStatusFilter, WarrantyToolbar } from "@/app/components/warranties/WarrantyToolbar";
import { cn } from "@/app/lib/cn";
import { exportWarrantiesToCSV, exportWarrantiesToXLS } from "@/app/lib/export-warranties";
import { todayYmd } from "@/app/lib/format";
import { Warranty, WarrantyPeriod } from "@/app/types/warranty";
import React, { useMemo, useState } from "react";


function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const seed: Warranty[] = [
  { id: "1", name: "Replacement Warranty", description: "Covers replacement of faulty items", duration: 2, period: "Year", createdAt: "2024-12-24", status: "Active" },
  { id: "2", name: "On-Site Warranty", description: "Product repairs done at the customer’s location", duration: 1, period: "Year", createdAt: "2024-12-10", status: "Active" },
  { id: "3", name: "Accidental Protection Plan", description: "Coverage for accidental damage", duration: 6, period: "Month", createdAt: "2024-11-27", status: "Active" },
  { id: "4", name: "Labor-Only Warranty", description: "Covers only labor costs, not parts", duration: 6, period: "Month", createdAt: "2024-11-18", status: "Active" },
  { id: "5", name: "No-Cost Repairs", description: "No charge for repairs during warranty period", duration: 3, period: "Month", createdAt: "2024-11-06", status: "Active" },
  { id: "6", name: "Accidental Damage", description: "Coverage for unexpected damage", duration: 6, period: "Month", createdAt: "2024-10-25", status: "Active" },
  { id: "7", name: "Wear & Tear Warranty", description: "Covers specific product aging issues", duration: 1, period: "Year", createdAt: "2024-10-03", status: "Active" },
  { id: "8", name: "Money-Back Guarantee", description: "Refund within a specified period", duration: 3, period: "Month", createdAt: "2024-09-20", status: "Active" },
  { id: "9", name: "Water Damage Warranty", description: "Coverage for water-related issues", duration: 6, period: "Month", createdAt: "2024-09-10", status: "Active" },
  { id: "10", name: "Power Surge Protection", description: "Covers damage from power surges", duration: 6, period: "Month", createdAt: "2024-09-01", status: "Active" },
];

export default function WarrantiesPage() {
  const [rows, setRows] = useState<Warranty[]>(seed);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WarrantyStatusFilter>("All");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Warranty | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Warranty | null>(null);

  const [collapsed, setCollapsed] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        String(r.duration).includes(q) ||
        r.period.toLowerCase().includes(q)
      );
    });
    if (statusFilter !== "All") list = list.filter((r) => r.status === statusFilter);
    return list;
  }, [rows, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, rowsPerPage, safePage]);

  const allOnPageSelected = paged.length > 0 && paged.every((r) => selected[r.id]);
  const someOnPageSelected = paged.some((r) => selected[r.id]) && !allOnPageSelected;

  function toggleAllOnPage() {
    const next = { ...selected };
    const target = !allOnPageSelected;
    for (const r of paged) next[r.id] = target;
    setSelected(next);
  }

  function toggleOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function openAdd() {
    setModalMode("add");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(r: Warranty) {
    setModalMode("edit");
    setEditing(r);
    setModalOpen(true);
  }

  function submitModal(payload: {
    name: string;
    duration: number;
    period: WarrantyPeriod;
    description: string;
    status: boolean;
  }) {
    if (modalMode === "add") {
      const newRow: Warranty = {
        id: uid(),
        name: payload.name,
        duration: payload.duration,
        period: payload.period,
        description: payload.description,
        createdAt: todayYmd(),
        status: payload.status ? "Active" : "Inactive",
      };
      setRows((prev) => [newRow, ...prev]);
      setModalOpen(false);
      return;
    }

    if (!editing) return;

    setRows((prev) =>
      prev.map((x) =>
        x.id === editing.id
          ? {
              ...x,
              name: payload.name,
              duration: payload.duration,
              period: payload.period,
              description: payload.description,
              status: payload.status ? "Active" : "Inactive",
            }
          : x
      )
    );
    setModalOpen(false);
  }

  function askDelete(r: Warranty) {
    setDeleting(r);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (!deleting) return;
    setRows((prev) => prev.filter((x) => x.id !== deleting.id));
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[deleting.id];
      return copy;
    });
    setDeleteOpen(false);
    setDeleting(null);
  }

  function exportPDF() {
    window.print();
  }
  function exportXLS() {
    exportWarrantiesToXLS(filtered, "warranties.xls");
  }
  function exportCSV() {
    exportWarrantiesToCSV(filtered, "warranties.csv");
  }
  function refresh() {
    setQuery("");
    setStatusFilter("All");
    setRowsPerPage(10);
    setPage(1);
    setSelected({});
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Warranties</h1>
            <p className="mt-1 text-sm text-slate-400">Manage your warranties</p>
          </div>

          <div className="flex items-center gap-2">
            <TopIconButton title="Export PDF" onClick={exportPDF}>
              <PdfIcon />
            </TopIconButton>
            <TopIconButton title="Export XLS" onClick={exportXLS}>
              <XlsIcon />
            </TopIconButton>
            <TopIconButton title="Export CSV" onClick={exportCSV}>
              <CsvIcon />
            </TopIconButton>
            <TopIconButton title="Refresh" onClick={refresh}>
              <RefreshIcon />
            </TopIconButton>
            <TopIconButton title="Collapse" onClick={() => setCollapsed((s) => !s)}>
              <ChevronUpIcon />
            </TopIconButton>

            <button
              onClick={openAdd}
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] transition hover:bg-orange-400 active:translate-y-[1px]"
            >
              <PlusIcon />
              Add Warranty
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          <WarrantyToolbar
            query={query}
            onQueryChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          />

          {!collapsed && (
            <>
              <WarrantyTable
                rows={paged}
                selected={selected}
                allSelected={allOnPageSelected}
                someSelected={someOnPageSelected}
                onToggleAll={toggleAllOnPage}
                onToggleOne={toggleOne}
                onEdit={openEdit}
                onAskDelete={askDelete}
              />

              {/* footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Row Per Page</span>
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
                  <span>Entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <PageNavButton disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} title="Previous">
                    <ChevronLeftIcon />
                  </PageNavButton>

                  <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(249,115,22,0.9)]">
                    {safePage}
                  </span>

                  <PageNavButton
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    title="Next"
                  >
                    <ChevronRightIcon />
                  </PageNavButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AddEditWarrantyModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModal}
      />

      <DeleteWarrantyModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleting(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

/* ---------- small UI helpers + icons (same style as your other pages) ---------- */

function TopIconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
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

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 16.8v-4h1.6a1.4 1.4 0 0 1 0 2.8H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16.8v-4h1.4a2 2 0 0 1 0 4H12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 16.8v-4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function XlsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 17l3-4M11 17l-3-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 13h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CsvIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
