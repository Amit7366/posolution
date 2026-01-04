"use client";

import { AddEditStockModal } from "@/app/components/stock/AddEditStockModal";
import { DeleteStockModal } from "@/app/components/stock/DeleteStockModal";
import { StockTable } from "@/app/components/stock/StockTable";
import { cn } from "@/app/lib/cn";
import { exportStockToCSV, exportStockToXLS } from "@/app/lib/export-stock";
import { todayYmd } from "@/app/lib/format";
import { Person, Product, Stock, Store, Warehouse } from "@/app/types/stock";
import React, { useMemo, useState } from "react";



function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ---- mock data (replace with API) ---- */
const warehouses: Warehouse[] = [
  { id: "w1", name: "Lavish Warehouse" },
  { id: "w2", name: "Quaint Warehouse" },
  { id: "w3", name: "Traditional Warehouse" },
  { id: "w4", name: "Retail Supply Hub" },
  { id: "w5", name: "EdgeWare Solutions" },
  { id: "w6", name: "North Zone Warehouse" },
  { id: "w7", name: "Fulfillment Hub" },
];

const stores: Store[] = [
  { id: "s1", warehouseId: "w1", name: "Electro Mart" },
  { id: "s2", warehouseId: "w2", name: "Quantum Gadgets" },
  { id: "s3", warehouseId: "w2", name: "Gadget World" },
  { id: "s4", warehouseId: "w3", name: "Volt Vault" },
  { id: "s5", warehouseId: "w4", name: "Prime Mart" },
  { id: "s6", warehouseId: "w5", name: "NeoTech Store" },
  { id: "s7", warehouseId: "w6", name: "Urban Mart" },
  { id: "s8", warehouseId: "w7", name: "Travel Mart" },
  { id: "s9", warehouseId: "w3", name: "Prime Bazaar" },
  { id: "s10", warehouseId: "w4", name: "Elite Retail" },
];

const products: Product[] = [
  { id: "p1", name: "Lenovo IdeaPad 3", sku: "LN-IP3", category: "Lenovo", iconUrl: "https://logo.clearbit.com/lenovo.com" },
  { id: "p2", name: "Beats Pro", sku: "BT-PR", category: "Beats", iconUrl: "https://logo.clearbit.com/beatsbydre.com" },
  { id: "p3", name: "Nike Jordan", sku: "PT002", category: "Nike", iconUrl: "https://logo.clearbit.com/nike.com" },
  { id: "p4", name: "Apple Series 5 Watch", sku: "AP-S5", category: "Apple", iconUrl: "https://logo.clearbit.com/apple.com" },
  { id: "p5", name: "Amazon Echo Dot", sku: "AM-ECHO", category: "Amazon", iconUrl: "https://logo.clearbit.com/amazon.com" },
  { id: "p6", name: "Red Premium Satchel", sku: "BAG-RED", category: "Bags" },
  { id: "p7", name: "Iphone 14 Pro", sku: "IP-14P", category: "Apple", iconUrl: "https://logo.clearbit.com/apple.com" },
  { id: "p8", name: "Gaming Chair", sku: "GC-01", category: "Furniture" },
  { id: "p9", name: "Borealis Backpack", sku: "TNF-BR", category: "The North Face", iconUrl: "https://logo.clearbit.com/thenorthface.com" },
];

const people: Person[] = [
  { id: "u1", name: "James Kirwin", avatarUrl: "https://i.pravatar.cc/80?img=12" },
  { id: "u2", name: "Francis Chang", avatarUrl: "https://i.pravatar.cc/80?img=22" },
  { id: "u3", name: "Steven", avatarUrl: "https://i.pravatar.cc/80?img=33" },
  { id: "u4", name: "Gravely", avatarUrl: "https://i.pravatar.cc/80?img=44" },
  { id: "u5", name: "Kevin", avatarUrl: "https://i.pravatar.cc/80?img=55" },
  { id: "u6", name: "Grillo", avatarUrl: "https://i.pravatar.cc/80?img=66" },
  { id: "u7", name: "Gary Hennessy", avatarUrl: "https://i.pravatar.cc/80?img=77" },
  { id: "u8", name: "Eleanor Panek", avatarUrl: "https://i.pravatar.cc/80?img=18" },
  { id: "u9", name: "William Levy", avatarUrl: "https://i.pravatar.cc/80?img=9" },
  { id: "u10", name: "Charlotte Klotz", avatarUrl: "https://i.pravatar.cc/80?img=28" },
];

const seed: Stock[] = [
  { id: "st1", warehouseId: "w1", storeId: "s1", productId: "p1", personId: "u1", date: "2024-12-24", qty: 100 },
  { id: "st2", warehouseId: "w2", storeId: "s2", productId: "p2", personId: "u2", date: "2024-12-10", qty: 140 },
  { id: "st3", warehouseId: "w3", storeId: "s9", productId: "p3", personId: "u3", date: "2023-07-25", qty: 120 },
  { id: "st4", warehouseId: "w2", storeId: "s3", productId: "p4", personId: "u4", date: "2023-07-28", qty: 130 },
  { id: "st5", warehouseId: "w3", storeId: "s4", productId: "p5", personId: "u5", date: "2023-07-24", qty: 140 },
  { id: "st6", warehouseId: "w4", storeId: "s10", productId: "p6", personId: "u6", date: "2023-07-15", qty: 150 },
  { id: "st7", warehouseId: "w4", storeId: "s5", productId: "p6", personId: "u7", date: "2024-10-14", qty: 700 },
  { id: "st8", warehouseId: "w5", storeId: "s6", productId: "p7", personId: "u8", date: "2024-10-03", qty: 630 },
  { id: "st9", warehouseId: "w6", storeId: "s7", productId: "p8", personId: "u9", date: "2024-09-20", qty: 410 },
  { id: "st10", warehouseId: "w7", storeId: "s8", productId: "p9", personId: "u10", date: "2024-09-10", qty: 550 },
];

export default function StockPage() {
  const [rows, setRows] = useState<Stock[]>(seed);

  const [query, setQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("All");
  const [storeFilter, setStoreFilter] = useState<string>("All");
  const [productFilter, setProductFilter] = useState<string>("All");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [collapsed, setCollapsed] = useState(false);

  // modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editing, setEditing] = useState<Stock | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Stock | null>(null);

  const storeOptions = useMemo(() => {
    if (warehouseFilter === "All") return stores;
    return stores.filter((s) => s.warehouseId === warehouseFilter);
  }, [warehouseFilter]);

  // keep store filter valid when warehouse filter changes
  useMemo(() => {
    if (storeFilter === "All") return;
    if (!storeOptions.some((s) => s.id === storeFilter)) setStoreFilter("All");
  }, [storeOptions, storeFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const wMap = new Map(warehouses.map((w) => [w.id, w.name]));
    const sMap = new Map(stores.map((s) => [s.id, s.name]));
    const pMap = new Map(products.map((p) => [p.id, p.name]));
    const peMap = new Map(people.map((p) => [p.id, p.name]));

    return rows.filter((r) => {
      if (warehouseFilter !== "All" && r.warehouseId !== warehouseFilter) return false;
      if (storeFilter !== "All" && r.storeId !== storeFilter) return false;
      if (productFilter !== "All" && r.productId !== productFilter) return false;

      if (!q) return true;

      const blob = [
        wMap.get(r.warehouseId),
        sMap.get(r.storeId),
        pMap.get(r.productId),
        peMap.get(r.personId),
        r.date,
        String(r.qty),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return blob.includes(q);
    });
  }, [rows, query, warehouseFilter, storeFilter, productFilter]);

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

  function openEdit(r: Stock) {
    setModalMode("edit");
    setEditing(r);
    setModalOpen(true);
  }

  function submitModal(payload: {
    warehouseId: string;
    storeId: string;
    personId: string;
    productId: string;
    qty: number;
  }) {
    if (modalMode === "add") {
      const newRow: Stock = {
        id: uid(),
        warehouseId: payload.warehouseId,
        storeId: payload.storeId,
        personId: payload.personId,
        productId: payload.productId,
        qty: payload.qty,
        date: todayYmd(),
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
              warehouseId: payload.warehouseId,
              storeId: payload.storeId,
              personId: payload.personId,
              productId: payload.productId,
              qty: payload.qty,
            }
          : x
      )
    );
    setModalOpen(false);
  }

  function askDelete(r: Stock) {
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
    exportStockToXLS({ rows: filtered, warehouses, stores, products, people, filename: "stock.xls" });
  }
  function exportCSV() {
    exportStockToCSV({ rows: filtered, warehouses, stores, products, people, filename: "stock.csv" });
  }
  function refresh() {
    setQuery("");
    setWarehouseFilter("All");
    setStoreFilter("All");
    setProductFilter("All");
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
            <h1 className="text-xl font-semibold tracking-tight">Manage Stock</h1>
            <p className="mt-1 text-sm text-slate-400">Manage your stock</p>
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
              Add Stock
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          {/* Toolbar row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="relative w-full max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                className="w-full rounded-xl border border-white/10 bg-[#0b0f14] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                label="Warehouse"
                value={warehouseFilter}
                onChange={(v) => {
                  setWarehouseFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: "All", label: "Warehouse" },
                  ...warehouses.map((w) => ({ value: w.id, label: w.name })),
                ]}
              />
              <FilterSelect
                label="Store"
                value={storeFilter}
                onChange={(v) => {
                  setStoreFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: "All", label: "Store" },
                  ...storeOptions.map((s) => ({ value: s.id, label: s.name })),
                ]}
              />
              <FilterSelect
                label="Product"
                value={productFilter}
                onChange={(v) => {
                  setProductFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: "All", label: "Product" },
                  ...products.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
          </div>

          {!collapsed && (
            <>
              <StockTable
                rows={paged}
                warehouses={warehouses}
                stores={stores}
                products={products}
                people={people}
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

      <AddEditStockModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        warehouses={warehouses}
        stores={stores}
        products={products}
        people={people}
        onClose={() => setModalOpen(false)}
        onSubmit={submitModal}
      />

      <DeleteStockModal
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

/* ---------- UI helpers ---------- */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
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
        aria-label={label}
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

/* icons */
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
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
