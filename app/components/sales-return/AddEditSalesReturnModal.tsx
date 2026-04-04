"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import type { SalesReturn, SalesReturnLine } from "@/app/types/sales-return";
import Modal from "../ui/Modal";
import { formatMoney } from "@/app/lib/cx";
import { useLazyGetProductsQuery, useCreateSalesReturnMutation, useUpdateSalesReturnMutation } from "@/redux/api/baseApi";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toast } from "sonner";

type Mode = "add" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial?: SalesReturn | null;
  onClose: () => void;
  onSuccess?: () => void;
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

function getQueryErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "object" && error !== null && "data" in error) {
    const d = (error as { data?: { message?: string } }).data;
    if (d?.message) return String(d.message);
  }
  return null;
}

const PLACEHOLDER_IMG = "https://cdn-icons-png.flaticon.com/512/732/732228.png";

export default function AddEditSalesReturnModal({ open, mode, initial, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const isEdit = mode === "edit";

  const [triggerSearch, { data: searchResult, isFetching }] = useLazyGetProductsQuery();
  const [createReturn, { isLoading: creating }] = useCreateSalesReturnMutation();
  const [updateReturn, { isLoading: updating }] = useUpdateSalesReturnMutation();

  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [refundDueDate, setRefundDueDate] = useState("");
  const [reference, setReference] = useState("");
  const [returnStatusUi, setReturnStatusUi] = useState<"Pending" | "Received">("Pending");
  const [paymentApi, setPaymentApi] = useState<"unpaid" | "paid">("unpaid");
  const [paidInput, setPaidInput] = useState(0);

  const [productQuery, setProductQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [lines, setLines] = useState<SalesReturnLine[]>([]);

  const [orderTax, setOrderTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    const tmr = setTimeout(() => setDebouncedQ(productQuery.trim()), 350);
    return () => clearTimeout(tmr);
  }, [productQuery]);

  useEffect(() => {
    if (!open) return;
    if (debouncedQ.length < 2) return;
    void triggerSearch({ page: 1, limit: 12, search: debouncedQ });
  }, [open, debouncedQ, triggerSearch]);

  const productHits = useMemo(() => {
    const raw = (searchResult as { data?: unknown[] } | undefined)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [searchResult]);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initial) {
      setCustomerName(initial.customer.name);
      setDate(initial.date);
      setReference(initial.reference);
      setReturnStatusUi(initial.status);
      setPaymentApi(initial.paymentStatus === "Paid" ? "paid" : "unpaid");
      setPaidInput(initial.paid);
      setRefundDueDate(initial.refundDueDate ?? "");
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

    setCustomerName("");
    setDate(new Date().toISOString().slice(0, 10));
    setRefundDueDate("");
    setReference(`${Math.floor(100000 + Math.random() * 900000)}`);
    setReturnStatusUi("Pending");
    setPaymentApi("unpaid");
    setPaidInput(0);
    setLines([]);
    setOrderTax(0);
    setDiscount(0);
    setShipping(0);
    setProductQuery("");
  }, [open, isEdit, initial]);

  const addProduct = (p: Record<string, unknown>) => {
    const id = String(p._id ?? "");
    if (!id) return;
    const price = Number(p.price) || 0;
    const stock = Number(p.quantity) || 0;
    const imgs = p.images as string[] | undefined;
    const image = Array.isArray(imgs) && imgs[0] ? String(imgs[0]) : PLACEHOLDER_IMG;

    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === id);
      if (idx >= 0) {
        const clone = [...prev];
        const cur = clone[idx];
        const next = { ...cur, qty: cur.qty + 1 };
        next.subtotal = computeLineSubtotal(next);
        clone[idx] = next;
        return clone;
      }

      const line: SalesReturnLine = {
        id: uid("line"),
        productId: id,
        name: String(p.name ?? ""),
        price,
        stock,
        qty: 1,
        discount: 0,
        taxPct: 0,
        subtotal: price,
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
    const ot = Math.max(0, orderTax);
    const d = Math.max(0, discount);
    const s = Math.max(0, shipping);
    return Math.max(0, base + ot - d + s);
  }, [subTotal, orderTax, discount, shipping]);

  const saving = creating || updating;

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error(t("dash.salesReturn.errCustomer"));
      return;
    }
    if (!reference.trim()) {
      toast.error(t("dash.salesReturn.errReference"));
      return;
    }
    if (!lines.length) {
      toast.error(t("dash.salesReturn.errLines"));
      return;
    }

    const body: Record<string, unknown> = {
      reference: reference.trim(),
      customerName: customerName.trim(),
      returnDate: date,
      refundDueDate: refundDueDate.trim() || null,
      items: lines.map((l) => ({
        productId: l.productId,
        qty: l.qty,
        unitPrice: l.price,
        discount: l.discount,
        taxPct: l.taxPct,
      })),
      orderTax,
      discount,
      shipping,
      paid: Math.max(0, paidInput),
      returnStatus: returnStatusUi === "Received" ? "received" : "pending",
      paymentStatus: paymentApi,
    };

    try {
      if (isEdit && initial) {
        await updateReturn({ id: initial.id, body }).unwrap();
        toast.success(t("dash.salesReturn.updatedOk"));
      } else {
        await createReturn(body).unwrap();
        toast.success(t("dash.salesReturn.createdOk"));
      }
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      toast.error(getQueryErrorMessage(e) || t("dash.salesReturn.saveFail"));
    }
  };

  const lineImage = (productId: string) => {
    const hit = lines.find((l) => l.productId === productId);
    const fromSearch = productHits.find((x) => String((x as Record<string, unknown>)._id) === productId) as
      | Record<string, unknown>
      | undefined;
    const imgs = fromSearch?.images as string[] | undefined;
    if (Array.isArray(imgs) && imgs[0]) return String(imgs[0]);
    return PLACEHOLDER_IMG;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("dash.salesReturn.editModalTitle") : t("dash.salesReturn.addModalTitle")}
      widthClassName="max-w-6xl"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            {t("dash.salesReturn.customerNameLabel")} <span className="text-red-500">*</span>
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
            placeholder={t("dash.salesReturn.customerNamePh")}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            {t("dash.salesReturn.colDate")} <span className="text-red-500">*</span>
          </label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            {t("dash.salesReturn.referenceLabel")} <span className="text-red-500">*</span>
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder={t("dash.salesReturn.referencePh")}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">{t("dash.salesReturn.refundDueLabel")}</label>
          <input
            value={refundDueDate}
            onChange={(e) => setRefundDueDate(e.target.value)}
            type="date"
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">{t("dash.salesReturn.paidAmountLabel")}</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={paidInput}
            onChange={(e) => setPaidInput(Math.max(0, parseFloat(e.target.value) || 0))}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white">{t("dash.salesReturn.paymentStatusApi")}</label>
          <select
            value={paymentApi}
            onChange={(e) => setPaymentApi(e.target.value as "unpaid" | "paid")}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option className="bg-[#0b0f14]" value="unpaid">
              {t("dash.invoices.unpaid")}
            </option>
            <option className="bg-[#0b0f14]" value="paid">
              {t("dash.invoices.paid")}
            </option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-medium text-white">
          {t("dash.salesReturn.colProduct")} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder={t("dash.salesReturn.searchProductsPh")}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
          />
          {isFetching ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-400">…</span>
          ) : null}
          {debouncedQ.length >= 2 && productHits.length > 0 && (
            <div className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-white/10 bg-[#0b0f14] shadow-[0_20px_60px_rgba(0,0,0,.65)]">
              {productHits.map((raw) => {
                const p = raw as Record<string, unknown>;
                const imgs = p.images as string[] | undefined;
                const img = Array.isArray(imgs) && imgs[0] ? String(imgs[0]) : PLACEHOLDER_IMG;
                return (
                  <button
                    key={String(p._id)}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded bg-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{String(p.name ?? "")}</div>
                        <div className="text-xs text-white/50">
                          SKU: {String(p.sku ?? "—")} · {t("dash.invoices.stock")} {String(p.quantity ?? 0)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-white/70">{formatMoney(Number(p.price) || 0)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/25">
        <div className="grid grid-cols-7 gap-0 border-b border-white/10 bg-[#1b222c] px-4 py-3 text-sm text-white/80">
          <div className="col-span-2">{t("dash.salesReturn.colProduct")}</div>
          <div>{t("dash.salesReturn.netUnitPrice")}</div>
          <div>{t("dash.invoices.stock")}</div>
          <div>QTY</div>
          <div>{t("dash.invoiceDetail.discount")} ($)</div>
          <div className="text-right">{t("dash.invoiceDetail.total")} ($)</div>
        </div>

        <div className="max-h-[300px] overflow-auto">
          {lines.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-white/40">{t("dash.salesReturn.noLines")}</div>
          ) : (
            lines.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-7 items-center gap-0 border-b border-white/10 px-4 py-3 text-sm"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded bg-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lineImage(l.productId)} alt="" className="h-full w-full object-cover" />
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
                    title={t("dash.common.delete")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/10 p-4 text-sm text-white/70">
          <div className="flex flex-wrap justify-end gap-6">
            <span>
              {t("dash.invoiceDetail.subTotal")}: <strong className="text-white">{formatMoney(subTotal)}</strong>
            </span>
            <span>
              {t("dash.invoiceDetail.totalAmount")}: <strong className="text-orange-300">{formatMoney(grandTotal)}</strong>
            </span>
          </div>
          {returnStatusUi === "Received" ? (
            <p className="mt-2 text-xs text-amber-200/90">{t("dash.salesReturn.receivedStockHint")}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white">{t("dash.salesReturn.orderTax")}</label>
          <input
            type="number"
            value={orderTax}
            onChange={(e) => setOrderTax(Number(e.target.value || 0))}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white">{t("dash.salesReturn.orderDiscount")}</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value || 0))}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white">{t("dash.salesReturn.shipping")}</label>
          <input
            type="number"
            value={shipping}
            onChange={(e) => setShipping(Number(e.target.value || 0))}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white">{t("dash.common.status")}</label>
          <select
            value={returnStatusUi}
            onChange={(e) => setReturnStatusUi(e.target.value as "Pending" | "Received")}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-white/20"
          >
            <option className="bg-[#0b0f14]" value="Pending">
              {t("dash.salesReturn.pending")}
            </option>
            <option className="bg-[#0b0f14]" value="Received">
              {t("dash.salesReturn.received")}
            </option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-lg bg-[#0b2a44] px-6 text-sm font-semibold text-white hover:opacity-95"
        >
          {t("dash.common.cancel")}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleSubmit()}
          className="h-10 rounded-lg bg-[#ffa24a] px-6 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
        >
          {saving ? t("dash.common.saving") : isEdit ? t("dash.common.save") : t("dash.salesReturn.submit")}
        </button>
      </div>
    </Modal>
  );
}
