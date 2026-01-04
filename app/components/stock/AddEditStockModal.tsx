"use client";

import { Person, Product, Stock, Store, Warehouse } from "@/app/types/stock";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../dashboard/ui/Modal";
import { Button } from "../dashboard/ui/Button";
import { cn } from "@/app/lib/cn";


type Mode = "add" | "edit";

export function AddEditStockModal({
  open,
  mode,
  initial,
  warehouses,
  stores,
  products,
  people,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: Mode;
  initial?: Stock | null;
  warehouses: Warehouse[];
  stores: Store[];
  products: Product[];
  people: Person[];
  onClose: () => void;
  onSubmit: (payload: {
    warehouseId: string;
    storeId: string;
    personId: string;
    productId: string;
    qty: number;
  }) => void;
}) {
  const [warehouseId, setWarehouseId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [personId, setPersonId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "add" ? "Add Stock" : "Edit Stock";
  const submitLabel = mode === "add" ? "Add Stock" : "Save Changes";

  const storeOptions = useMemo(() => stores.filter((s) => s.warehouseId === warehouseId), [stores, warehouseId]);
  const product = useMemo(() => products.find((p) => p.id === productId) ?? null, [products, productId]);

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (mode === "edit" && initial) {
      setWarehouseId(initial.warehouseId);
      setStoreId(initial.storeId);
      setPersonId(initial.personId);
      setProductId(initial.productId);
      setQty(Math.max(1, initial.qty));
    } else {
      setWarehouseId("");
      setStoreId("");
      setPersonId("");
      setProductId("");
      setQty(1);
    }
  }, [open, mode, initial]);

  // keep store valid when warehouse changes
  useEffect(() => {
    if (!storeId) return;
    if (!storeOptions.some((s) => s.id === storeId)) setStoreId("");
  }, [storeOptions, storeId]);

  const canSubmit =
    warehouseId && storeId && personId && productId && qty > 0;

  function submit() {
    if (!warehouseId) return setError("Warehouse is required.");
    if (!storeId) return setError("Store is required.");
    if (!personId) return setError("Responsible Person is required.");
    if (!productId) return setError("Product is required.");
    if (!qty || qty < 1) return setError("Qty must be at least 1.");

    setError(null);
    onSubmit({ warehouseId, storeId, personId, productId, qty });
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      className="max-w-[760px]"
      initialFocusSelector='select[name="warehouse"]'
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Warehouse" required>
          <select
            name="warehouse"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            className={selectClass}
          >
            <option value="">Select</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Store" required>
          <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className={selectClass}>
            <option value="">Select</option>
            {storeOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Responsible Person" required>
          <select value={personId} onChange={(e) => setPersonId(e.target.value)} className={selectClass}>
            <option value="">Select</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Product" required>
          <ProductPicker
            products={products}
            value={productId}
            onChange={setProductId}
            placeholder="Select Product"
          />
        </Field>

        {/* Selected product summary like screenshot (shows in edit; we show whenever product selected) */}
        {product && (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <div className="grid grid-cols-[1.7fr_0.8fr_0.9fr_0.6fr] gap-3 rounded-xl bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200">
                  <div>Product</div>
                  <div>SKU</div>
                  <div>Category</div>
                  <div className="text-right">Qty</div>
                </div>

                <div className="grid grid-cols-[1.7fr_0.8fr_0.9fr_0.6fr] items-center gap-3 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ProductIcon name={product.name} iconUrl={product.iconUrl} />
                    <div className="text-sm font-semibold text-slate-100">{product.name}</div>
                  </div>
                  <div className="text-sm text-slate-400">{product.sku}</div>
                  <div className="text-sm text-slate-400">{product.category}</div>
                  <div className="flex justify-end">
                    <QtyStepper value={qty} onChange={setQty} />
                  </div>
                </div>

                {/* orange progress line like screenshot */}
                <div className="h-[3px] w-full bg-orange-500/80" />
              </div>
            </div>
          </div>
        )}

        {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      </div>
    </Modal>
  );
}

/* -------- small UI parts -------- */

const selectClass =
  "w-full appearance-none rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function QtyStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-black/20 px-3 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-slate-200 hover:bg-white/10"
        title="Decrease"
      >
        <MinusIcon />
      </button>
      <div className="min-w-6 text-center text-sm font-semibold text-slate-100">{value}</div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-slate-200 hover:bg-white/10"
        title="Increase"
      >
        <PlusIconSmall />
      </button>
    </div>
  );
}

function ProductIcon({ name, iconUrl }: { name: string; iconUrl?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white text-xs font-bold text-slate-900 ring-1 ring-white/10">
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconUrl} alt={name} className="h-full w-full object-contain bg-white" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

/** Searchable product picker like your modal input */
function ProductPicker({
  products,
  value,
  onChange,
  placeholder,
}: {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => products.find((p) => p.id === value) ?? null, [products, value]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products.slice(0, 8);
    return products
      .filter((p) => (p.name + " " + p.sku + " " + p.category).toLowerCase().includes(s))
      .slice(0, 10);
  }, [products, q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>

        <input
          value={open ? q : selected?.name ?? ""}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQ("");
          }}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-white/10 bg-[#070a0f] py-3 pl-10 pr-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition",
            "focus:border-orange-500/30 focus:ring-4"
          )}
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b0f14] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)]">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">No products</div>
          ) : (
            <div className="max-h-64 overflow-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.06]"
                >
                  <ProductIcon name={p.name} iconUrl={p.iconUrl} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">{p.name}</div>
                    <div className="text-xs text-slate-400">
                      {p.sku} • {p.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* icons */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6 12h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
function PlusIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
