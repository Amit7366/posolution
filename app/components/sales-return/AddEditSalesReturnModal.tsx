"use client";

import React, { useEffect, useMemo, useState } from "react";


import { Search, Plus, Trash2 } from "lucide-react";
import { PaymentStatus, ReturnStatus, SalesReturn, SalesReturnLine } from "@/app/types/sales-return";
import { customers, products } from "@/app/lib/sales-return/data";
import Modal from "../ui/Modal";
import { formatMoney } from "@/app/lib/cx";

type Mode = "add" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial?: SalesReturn | null;
  onClose: () => void;
  onSubmit: (payload: SalesReturn) => void;
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function computeLineSubtotal(line: Omit<SalesReturnLine, "subtotal">) {
  const base = line.price * line.qty;
  const afterDiscount = Math.max(0, base - line.discount);
  const tax = (afterDiscount * line.taxPct) / 100;
  return Math.max(0, afterDiscount + tax);
}

export default function AddEditSalesReturnModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = mode === "edit";

  // form
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [status, setStatus] = useState<ReturnStatus>("Pending");

  const [productQuery, setProductQuery] = useState("");
  const [lines, setLines] = useState<SalesReturnLine[]>([]);

  const [orderTax, setOrderTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);

  // load initial
  useEffect(() => {
    if (!open) return;

    if (isEdit && initial) {
      setCustomerId(initial.customer.id);
      setDate(initial.date);
      setReference(initial.reference);
      setStatus(initial.status);

      setLines(
        initial.lines.map((l) => ({
          ...l,
          subtotal: computeLineSubtotal(l),
        }))
      );

      setOrderTax(initial.orderTax ?? 0);
      setDiscount(initial.discount ?? 0);
      setShipping(initial.shipping ?? 0);
      setProductQuery("");
      return;
    }

    // add defaults
    setCustomerId(customers[0]?.id ?? "");
    setDate(new Date().toISOString().slice(0, 10));
    setReference(`${Math.floor(100000 + Math.random() * 900000)}`);
    setStatus("Pending");
    setLines([]);
    setOrderTax(0);
    setDiscount(0);
    setShipping(0);
    setProductQuery("");
  }, [open, isEdit, initial]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [productQuery]);

  const addProduct = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;

    setLines((prev) => {
      // if already exists -> increase qty
      const idx = prev.findIndex((l) => l.productId === p.id);
      if (idx >= 0) {
        const clone = [...prev];
        const cur = clone[idx];
        const next = {
          ...cur,
          qty: cur.qty + 1,
        };
        next.subtotal = computeLineSubtotal(next);
        clone[idx] = next;
        return clone;
      }

      const line: SalesReturnLine = {
        id: uid("line"),
        productId: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        qty: 1,
        discount: 0,
        taxPct: 0,
        subtotal: p.price,
      };
      return [line, ...prev];
    });

    setProductQuery("");
  };

  const updateLine = (id: string, patch: Partial<SalesReturnLine>) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        next.subtotal = computeLineSubtotal(next);
        return next;
      })
    );
  };

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));

  const subTotal = useMemo(
    () => lines.reduce((sum, l) => sum + (Number.isFinite(l.subtotal) ? l.subtotal : 0), 0),
    [lines]
  );

  const grandTotal = useMemo(() => {
    const base = subTotal;
    const t = Math.max(0, orderTax);
    const d = Math.max(0, discount);
    const s = Math.max(0, shipping);
    return Math.max(0, base + t - d + s);
  }, [subTotal, orderTax, discount, shipping]);

  const customer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? customers[0],
    [customerId]
  );

  const paymentStatus: PaymentStatus = useMemo(() => {
    // simple rule (you can replace with your real logic)
    if (grandTotal <= 0) return "Paid";
    if (status === "Pending") return "Unpaid";
    return "Paid";
  }, [grandTotal, status]);

  const handleSubmit = () => {
    if (!customer) return;

    const payload: SalesReturn = {
      id: isEdit && initial ? initial.id : uid("sr"),
      productName: lines[0]?.name ?? "—",
      productImage:
        products.find((p) => p.id === lines[0]?.productId)?.image ?? undefined,
      date,
      customer,
      status,
      total: grandTotal,
      paid: paymentStatus === "Paid" ? grandTotal : 0,
      due: paymentStatus === "Paid" ? 0 : grandTotal,
      paymentStatus,
      reference,
      lines,
      orderTax,
      discount,
      shipping,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Sales Return" : "Add Sales Return"}
      widthClassName="max-w-6xl"
    >
      {/* top row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Customer */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Customer Name <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center gap-2">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0b0f14]">
                  {c.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/30 text-white hover:bg-white/5"
              title="Add customer (demo)"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        {/* Reference */}
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Reference <span className="text-red-500">*</span>
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Reference"
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
          />
        </div>
      </div>

      {/* Product search */}
      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-white">
          Product <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder="Please type product code and select"
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
          />

          {!!filteredProducts.length && (
            <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-[#0b0f14] shadow-[0_20px_60px_rgba(0,0,0,.65)]">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p.id)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded bg-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{p.name}</div>
                      <div className="text-xs text-white/50">
                        SKU: {p.sku} • Code: {p.code} • Stock: {p.stock}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-white/70">{formatMoney(p.price)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lines table */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/25">
        <div className="grid grid-cols-7 gap-0 border-b border-white/10 bg-[#1b222c] px-4 py-3 text-sm text-white/80">
          <div className="col-span-2">Product Name</div>
          <div>Net Unit Price($)</div>
          <div>Stock</div>
          <div>QTY</div>
          <div>Discount($)</div>
          <div className="text-right">Subtotal ($)</div>
        </div>

        <div className="max-h-[300px] overflow-auto">
          {lines.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-white/40">
              No products selected yet.
            </div>
          ) : (
            lines.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-7 items-center gap-0 border-b border-white/10 px-4 py-3 text-sm"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={products.find((p) => p.id === l.productId)?.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{l.name}</div>
                    <div className="text-xs text-white/40">
                      Tax %:
                      <input
                        type="number"
                        min={0}
                        value={l.taxPct}
                        onChange={(e) => updateLine(l.id, { taxPct: Number(e.target.value) })}
                        className="ml-2 h-7 w-16 rounded border border-white/10 bg-black/30 px-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-white/80">{l.price}</div>
                <div className="text-white/50">{l.stock}</div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateLine(l.id, { qty: Math.max(1, l.qty - 1) })}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/30 text-white hover:bg-white/5"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) => updateLine(l.id, { qty: Math.max(1, Number(e.target.value || 1)) })}
                    className="h-8 w-16 rounded-lg border border-white/10 bg-black/30 px-2 text-center text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateLine(l.id, { qty: l.qty + 1 })}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/30 text-white hover:bg-white/5"
                  >
                    +
                  </button>
                </div>

                <div>
                  <input
                    type="number"
                    min={0}
                    value={l.discount}
                    onChange={(e) => updateLine(l.id, { discount: Math.max(0, Number(e.target.value || 0)) })}
                    className="h-8 w-28 rounded-lg border border-white/10 bg-black/30 px-2 text-sm text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <div className="text-right text-white/80">{l.subtotal.toFixed(2)}</div>
                  <button
                    type="button"
                    onClick={() => removeLine(l.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-black/30 text-red-400 hover:bg-white/5"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* floating totals panel (like screenshot) */}
        <div className="relative">
          <div className="pointer-events-none absolute right-4 top-[-160px] hidden w-[520px] rounded-lg border border-white/10 bg-black/40 lg:block">
            <div className="grid grid-cols-2 divide-x divide-white/10">
              <div className="divide-y divide-white/10 text-sm text-white/50">
                <div className="px-4 py-3">Order Tax</div>
                <div className="px-4 py-3">Discount</div>
                <div className="px-4 py-3">Shipping</div>
                <div className="px-4 py-3">Grand Total</div>
              </div>
              <div className="divide-y divide-white/10 text-right text-sm text-white/80">
                <div className="px-4 py-3">{formatMoney(orderTax)}</div>
                <div className="px-4 py-3">{formatMoney(discount)}</div>
                <div className="px-4 py-3">{formatMoney(shipping)}</div>
                <div className="px-4 py-3">{formatMoney(grandTotal)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* bottom row inputs */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Order Tax <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={orderTax}
            onChange={(e) => setOrderTax(Number(e.target.value || 0))}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Discount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value || 0))}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Shipping <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={shipping}
            onChange={(e) => setShipping(Number(e.target.value || 0))}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReturnStatus)}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option className="bg-[#0b0f14]" value="Pending">
              Pending
            </option>
            <option className="bg-[#0b0f14]" value="Received">
              Received
            </option>
          </select>
        </div>
      </div>

      {/* actions */}
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
        <button
          onClick={onClose}
          className="h-10 rounded-lg bg-[#0b2a44] px-6 text-sm font-semibold text-white hover:opacity-95"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="h-10 rounded-lg bg-[#ffa24a] px-6 text-sm font-semibold text-white hover:brightness-110"
        >
          {isEdit ? "Save Changes" : "Submit"}
        </button>
      </div>
    </Modal>
  );
}
