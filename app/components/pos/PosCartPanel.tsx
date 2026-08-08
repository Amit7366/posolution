"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronUp,
  Minus,
  Plus,
  Tag,
  Trash2,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useGetCustomersQuery } from "@/redux/api/baseApi";
import { usePosCart, WALKING_CUSTOMER } from "./PosCartContext";
import { formatTaka } from "./formatTaka";
import PosQuickCustomerModal from "./PosQuickCustomerModal";

type Props = {
  onPlaceOrder: () => void;
  compact?: boolean;
};

export default function PosCartPanel({ onPlaceOrder, compact }: Props) {
  const {
    items,
    customer,
    setCustomer,
    setQty,
    removeItem,
    clearCart,
    productCount,
    subTotal,
    discountTotal,
    vatAmount,
    grandTotal,
    cartDiscount,
    setCartDiscount,
    vatPercent,
    setVatPercent,
    detailsOpen,
    setDetailsOpen,
  } = usePosCart();

  const [customerOpen, setCustomerOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: custPayload, isFetching } = useGetCustomersQuery({
    page: 1,
    limit: 40,
    search: debounced || undefined,
    status: "active",
  });

  const customers = useMemo(() => {
    const raw = (custPayload as { data?: unknown[] } | undefined)?.data;
    return Array.isArray(raw)
      ? (raw as { _id: string; name: string; phone?: string; email?: string; address?: string }[])
      : [];
  }, [custPayload]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-gray-50">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white p-3">
        <div className="relative min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setCustomerOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm"
          >
            <UserRound size={16} className="shrink-0 text-gray-500" />
            <span className="truncate font-medium text-gray-800">{customer.name}</span>
          </button>

          {customerOpen && (
            <div className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer…"
                className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none"
              />
              <div className="max-h-48 overflow-y-auto">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                  onClick={() => {
                    setCustomer(WALKING_CUSTOMER);
                    setCustomerOpen(false);
                  }}
                >
                  Walking Customer
                </button>
                {isFetching && (
                  <p className="px-3 py-2 text-xs text-gray-400">Loading…</p>
                )}
                {customers.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                    onClick={() => {
                      setCustomer({
                        id: c._id,
                        name: c.name,
                        phone: c.phone,
                        email: c.email,
                        address: c.address,
                      });
                      setCustomerOpen(false);
                    }}
                  >
                    <span className="font-medium">{c.name}</span>
                    {c.phone ? (
                      <span className="ml-2 text-xs text-gray-400">{c.phone}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <PosQuickCustomerModal
          trigger={
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600"
              title="Add customer"
            >
              <UserPlus size={18} />
            </button>
          }
        />
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">Cart is empty</p>
        ) : (
          items.map((i) => (
            <div
              key={i.productId}
              className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="font-medium text-gray-900">{i.name}</p>
                <button
                  type="button"
                  onClick={() => removeItem(i.productId)}
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center overflow-hidden rounded-md border border-gray-200">
                  <button
                    type="button"
                    className="px-2 py-1 text-gray-600 hover:bg-gray-50"
                    onClick={() => setQty(i.productId, i.qty - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={i.stock}
                    value={i.qty}
                    onChange={(e) => setQty(i.productId, Number(e.target.value) || 1)}
                    className="w-10 border-x border-gray-200 py-1 text-center text-sm outline-none"
                  />
                  <button
                    type="button"
                    className="px-2 py-1 text-gray-600 hover:bg-gray-50"
                    onClick={() => setQty(i.productId, i.qty + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-500">
                    {formatTaka(i.price)} × {i.qty} Pc
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatTaka(i.price * i.qty)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          See Cart details
          <ChevronUp
            size={16}
            className={`transition ${detailsOpen ? "" : "rotate-180"}`}
          />
        </button>

        {detailsOpen && (
          <div className="space-y-1 border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatTaka(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatTaka(discountTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({vatPercent}%)</span>
              <span>{formatTaka(vatAmount)}</span>
            </div>
          </div>
        )}

        {discountOpen && (
          <div className="space-y-2 border-t border-gray-100 px-4 py-3">
            <label className="block text-xs text-gray-500">Cart discount (৳)</label>
            <input
              type="number"
              min={0}
              value={cartDiscount}
              onChange={(e) => setCartDiscount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            <label className="block text-xs text-gray-500">VAT %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={vatPercent}
              onChange={(e) => setVatPercent(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
          <span className="text-sm">Total ({productCount} Products)</span>
          <span className="text-lg font-bold">{formatTaka(grandTotal)}</span>
        </div>

        <div className="flex gap-2 p-3">
          <button
            type="button"
            disabled={items.length === 0}
            onClick={onPlaceOrder}
            className="flex-1 rounded-lg bg-orange-500 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Place Order
          </button>
          <button
            type="button"
            onClick={() => setDiscountOpen((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-white hover:bg-gray-700"
            title="Discount / Tax"
          >
            <Tag size={18} />
          </button>
          <button
            type="button"
            onClick={clearCart}
            disabled={items.length === 0}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-40"
            title="Clear cart"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
