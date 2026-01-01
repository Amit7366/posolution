"use client";

import { AddEditBrandModal } from "@/app/components/dashboard/brands/AddEditBrandModal";
import { BrandTable } from "@/app/components/dashboard/brands/BrandTable";
import { BrandToolbar, SortOrder, StatusFilter } from "@/app/components/dashboard/brands/BrandToolbar";
import { cn } from "@/app/lib/cn";
import { exportBrandsToCSV, exportBrandsToXLS } from "@/app/lib/export";
import { todayYmd } from "@/app/lib/format";
import { Brand } from "@/app/types/brand";
import React, { useMemo, useState } from "react";



function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const seedBrands: Brand[] = [
  { id: "1", name: "Lenovo", createdAt: "2024-12-24", status: "Active", logoUrl: "https://logo.clearbit.com/lenovo.com" },
  { id: "2", name: "Beats", createdAt: "2024-12-10", status: "Active", logoUrl: "https://logo.clearbit.com/beatsbydre.com" },
  { id: "3", name: "Nike", createdAt: "2024-11-27", status: "Active", logoUrl: "https://logo.clearbit.com/nike.com" },
  { id: "4", name: "Apple", createdAt: "2024-11-18", status: "Active", logoUrl: "https://logo.clearbit.com/apple.com" },
  { id: "5", name: "Amazon", createdAt: "2024-11-06", status: "Active", logoUrl: "https://logo.clearbit.com/amazon.com" },
  { id: "6", name: "Woodmart", createdAt: "2024-10-25", status: "Active" },
  { id: "7", name: "Dior", createdAt: "2024-10-14", status: "Active", logoUrl: "https://logo.clearbit.com/dior.com" },
  { id: "8", name: "Lava", createdAt: "2024-10-03", status: "Active" },
  { id: "9", name: "Nilkamal", createdAt: "2024-09-20", status: "Active" },
  { id: "10", name: "The North Face", createdAt: "2024-09-10", status: "Active", logoUrl: "https://logo.clearbit.com/thenorthface.com" },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(seedBrands);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortOrder>("Latest");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Brand | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = brands.filter((b) => (q ? b.name.toLowerCase().includes(q) : true));
    if (statusFilter !== "All") list = list.filter((b) => b.status === statusFilter);

    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sort === "Latest" ? tb - ta : ta - tb;
    });

    return list;
  }, [brands, query, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, rowsPerPage, safePage]);

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const allOnPageSelected = paged.length > 0 && paged.every((b) => selected[b.id]);
  const someOnPageSelected = paged.some((b) => selected[b.id]) && !allOnPageSelected;

  function toggleAllOnPage() {
    const next = { ...selected };
    const target = !allOnPageSelected;
    for (const b of paged) next[b.id] = target;
    setSelected(next);
  }

  function toggleOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function deleteOne(id: string) {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setSelected((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  function bulkDelete() {
    const ids = new Set(Object.entries(selected).filter(([, v]) => v).map(([k]) => k));
    if (ids.size === 0) return;

    // You can replace confirm() with your own nice confirm modal later.
    if (!confirm(`Delete ${ids.size} selected brand(s)?`)) return;

    setBrands((prev) => prev.filter((b) => !ids.has(b.id)));
    setSelected({});
  }

  function openAdd() {
    setModalMode("add");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(brand: Brand) {
    setModalMode("edit");
    setEditing(brand);
    setModalOpen(true);
  }

  function submitModal(payload: { name: string; status: boolean; logoDataUrl?: string }) {
    if (modalMode === "add") {
      const newBrand: Brand = {
        id: uid(),
        name: payload.name,
        createdAt: todayYmd(),
        status: payload.status ? "Active" : "Inactive",
        logoUrl: payload.logoDataUrl,
      };
      setBrands((prev) => [newBrand, ...prev]);
      setModalOpen(false);
      return;
    }

    // edit
    if (!editing) return;

    setBrands((prev) =>
      prev.map((b) =>
        b.id === editing.id
          ? {
              ...b,
              name: payload.name,
              status: payload.status ? "Active" : "Inactive",
              // if user picked a new image it replaces
              logoUrl: payload.logoDataUrl,
            }
          : b
      )
    );
    setModalOpen(false);
  }

  function refresh() {
    // in real app, re-fetch from server (SWR/React Query). For demo:
    setQuery("");
    setStatusFilter("All");
    setSort("Latest");
    setRowsPerPage(10);
    setPage(1);
    setSelected({});
  }

  // export actions
  function exportPDF() {
    // Print-style PDF: open print dialog
    window.print();
  }

  function exportXLS() {
    exportBrandsToXLS(filtered, "brands.xls");
  }

  function exportCSV() {
    exportBrandsToCSV(filtered, "brands.csv");
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Brand</h1>
            <p className="mt-1 text-sm text-slate-400">Manage your brands</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportPDF}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
              title="Export PDF (Print)"
            >
              <PdfIcon />
            </button>
            <button
              onClick={exportXLS}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
              title="Export XLS"
            >
              <XlsIcon />
            </button>
            <button
              onClick={exportCSV}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
              title="Export CSV"
            >
              <CsvIcon />
            </button>

            <button
              onClick={refresh}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
              title="Refresh"
            >
              <RefreshIcon />
            </button>

            <button
              onClick={openAdd}
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] transition hover:bg-orange-400 active:translate-y-[1px]"
            >
              <PlusIcon />
              Add Brand
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          <BrandToolbar
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
            sort={sort}
            onSortChange={(v) => {
              setSort(v);
              setPage(1);
            }}
            onExportPDF={exportPDF}
            onExportXLS={exportXLS}
            onRefresh={refresh}
            onAdd={openAdd}
            selectedCount={selectedCount}
            onBulkDelete={bulkDelete}
          />

          <BrandTable
            brands={paged}
            selected={selected}
            onToggleAll={toggleAllOnPage}
            allSelected={allOnPageSelected}
            someSelected={someOnPageSelected}
            onToggleOne={toggleOne}
            onEdit={openEdit}
            onDelete={deleteOne}
          />

          {/* Footer / pagination */}
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
        </div>
      </div>

      <AddEditBrandModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModal}
      />
    </div>
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

/* icons */
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
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
