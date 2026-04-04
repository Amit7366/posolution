"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/dashboard/ui/Modal";
import { useLazyGetProductsQuery, useCreateInvoiceMutation } from "@/redux/api/baseApi";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toast } from "sonner";
import { Trash2, Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";

type LineRow = {
  key: string;
  productId: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  discount: number;
  stock: number;
};

function rowKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateInvoiceModal({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [triggerSearch, { data: searchResult, isFetching }] = useLazyGetProductsQuery();
  const [createInvoice, { isLoading: saving }] = useCreateInvoiceMutation();

  const [productQuery, setProductQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(productQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [productQuery]);

  useEffect(() => {
    if (!open) return;
    if (debouncedQ.length < 2) return;
    void triggerSearch({ page: 1, limit: 15, search: debouncedQ });
  }, [open, debouncedQ, triggerSearch]);

  const productHits = useMemo(() => {
    const raw = (searchResult as { data?: unknown[] } | undefined)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [searchResult]);

  const [lines, setLines] = useState<LineRow[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [title, setTitle] = useState("Sales invoice");
  const [vatPercent, setVatPercent] = useState(0);
  const [paid, setPaid] = useState(0);
  const [status, setStatus] = useState<"unpaid" | "paid">("unpaid");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [showFrom, setShowFrom] = useState(false);
  const [fromName, setFromName] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromPhone, setFromPhone] = useState("");

  useEffect(() => {
    if (!open) return;
    setLines([]);
    setProductQuery("");
    setDebouncedQ("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setTitle(t("dash.invoices.defaultTitle"));
    setVatPercent(0);
    setPaid(0);
    setStatus("unpaid");
    setDueDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setShowFrom(false);
    setFromName("");
    setFromAddress("");
    setFromEmail("");
    setFromPhone("");
  }, [open, t]);

  const addProduct = (p: Record<string, unknown>) => {
    const id = String(p._id ?? "");
    if (!id) return;
    if (lines.some((l) => l.productId === id)) {
      toast.message(t("dash.invoices.alreadyAdded"));
      return;
    }
    setLines((prev) => [
      ...prev,
      {
        key: rowKey(),
        productId: id,
        name: String(p.name ?? ""),
        sku: String(p.sku ?? ""),
        qty: 1,
        unitPrice: Number(p.price) || 0,
        discount: 0,
        stock: Number(p.quantity) || 0,
      },
    ]);
    setProductQuery("");
  };

  const totals = useMemo(() => {
    let sub = 0;
    let disc = 0;
    for (const l of lines) {
      sub += l.qty * l.unitPrice;
      disc += l.discount;
    }
    const subTotal = Math.round(sub * 100) / 100;
    const discountTotal = Math.round(disc * 100) / 100;
    const base = Math.round((subTotal - discountTotal) * 100) / 100;
    const vatAmount = Math.round(((base * vatPercent) / 100) * 100) / 100;
    const totalAmount = Math.round((base + vatAmount) * 100) / 100;
    const amountDue = Math.round((totalAmount - paid) * 100) / 100;
    return { subTotal, discountTotal, vatAmount, totalAmount, amountDue };
  }, [lines, vatPercent, paid]);

  const effectiveStatus: "unpaid" | "paid" =
    paid >= totals.totalAmount && totals.totalAmount > 0 ? "paid" : status;

  const submit = async () => {
    if (!customerName.trim()) {
      toast.error(t("dash.invoices.errCustomer"));
      return;
    }
    if (!lines.length) {
      toast.error(t("dash.invoices.errLines"));
      return;
    }
    for (const l of lines) {
      if (l.qty < 1) {
        toast.error(t("dash.invoices.errQty"));
        return;
      }
      if ((effectiveStatus === "paid" || paid >= totals.totalAmount) && l.qty > l.stock) {
        toast.error(t("dash.invoices.errStock", { name: l.name }));
        return;
      }
    }

    const body: Record<string, unknown> = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      title: title.trim() || t("dash.invoices.defaultTitle"),
      items: lines.map((l) => ({
        productId: l.productId,
        qty: l.qty,
        unitPrice: l.unitPrice,
        discount: l.discount,
      })),
      vatPercent,
      paid,
      status: effectiveStatus,
      dueDate,
      notes: notes.trim(),
    };

    if (showFrom && (fromName || fromAddress || fromEmail || fromPhone)) {
      body.fromParty = {
        name: fromName,
        address: fromAddress,
        email: fromEmail,
        phone: fromPhone,
      };
    }

    try {
      await createInvoice(body).unwrap();
      toast.success(t("dash.invoices.createdOk"));
      onCreated?.();
      onClose();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message;
      toast.error(msg || t("dash.invoices.createdFail"));
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-[#0b0f14] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("dash.invoices.createModalTitle")}
      className="max-w-5xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{t("dash.invoices.modalFooterHint")}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
            >
              {t("dash.common.cancel")}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("dash.invoices.createSubmit")}
            </button>
          </div>
        </div>
      }
    >
      <div className="max-h-[min(78vh,720px)] space-y-6 overflow-y-auto pr-1">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className={labelCls}>{t("dash.invoices.fieldCustomerName")} *</label>
            <input
              data-initial-focus
              className={inputCls}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t("dash.invoices.phCustomerName")}
            />
          </div>
          <div>
            <label className={labelCls}>{t("dash.invoices.fieldDueDate")} *</label>
            <input className={inputCls} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{t("dash.invoices.fieldEmail")}</label>
            <input
              className={inputCls}
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className={labelCls}>{t("dash.invoices.fieldPhone")}</label>
            <input className={inputCls} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <label className={labelCls}>{t("dash.invoices.fieldAddress")}</label>
            <input className={inputCls} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </div>
          <div className="lg:col-span-2">
            <label className={labelCls}>{t("dash.invoices.fieldTitle")}</label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFrom((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
        >
          {t("dash.invoices.toggleSeller")}
          {showFrom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showFrom && (
          <div className="grid gap-4 rounded-xl border border-white/10 bg-black/20 p-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <label className={labelCls}>{t("dash.invoiceDetail.from")} — {t("dash.invoices.fieldName")}</label>
              <input className={inputCls} value={fromName} onChange={(e) => setFromName(e.target.value)} />
            </div>
            <div className="lg:col-span-2">
              <label className={labelCls}>{t("dash.invoices.fieldAddress")}</label>
              <input className={inputCls} value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t("dash.invoices.fieldEmail")}</label>
              <input className={inputCls} value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t("dash.invoices.fieldPhone")}</label>
              <input className={inputCls} value={fromPhone} onChange={(e) => setFromPhone(e.target.value)} />
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>{t("dash.invoices.addProducts")}</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className={`${inputCls} pl-10`}
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder={t("dash.invoices.searchProductsPh")}
            />
            {isFetching ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-orange-400" />
            ) : null}
          </div>
          {debouncedQ.length >= 2 && productHits.length > 0 && (
            <ul className="mt-2 max-h-48 overflow-auto rounded-xl border border-white/10 bg-[#0b0f14] py-1 shadow-xl">
              {productHits.map((p) => {
                const pr = p as Record<string, unknown>;
                return (
                  <li key={String(pr._id)}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-slate-100 transition hover:bg-white/[0.06]"
                      onClick={() => addProduct(pr)}
                    >
                      <span className="font-medium">{String(pr.name ?? "")}</span>
                      <span className="shrink-0 text-xs text-slate-400">
                        SKU {String(pr.sku ?? "—")} · {t("dash.invoices.stock")}{" "}
                        {String(pr.quantity ?? 0)} · {t("dash.invoices.price")} {String(pr.price ?? 0)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04] text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-3 py-3">{t("dash.invoices.colProduct")}</th>
                <th className="px-3 py-3 w-24">{t("dash.invoiceDetail.qty")}</th>
                <th className="px-3 py-3 w-28">{t("dash.invoices.unitPrice")}</th>
                <th className="px-3 py-3 w-28">{t("dash.invoiceDetail.discount")}</th>
                <th className="px-3 py-3 w-28 text-right">{t("dash.invoiceDetail.total")}</th>
                <th className="w-12 px-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {lines.map((l) => {
                const lineGross = Math.round(l.qty * l.unitPrice * 100) / 100;
                const lineNet = Math.round((lineGross - l.discount) * 100) / 100;
                return (
                  <tr key={l.key}>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-100">{l.name}</div>
                      <div className="text-xs text-slate-500">
                        {l.sku} · {t("dash.invoices.stock")} {l.stock}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        className={`${inputCls} py-2`}
                        value={l.qty}
                        onChange={(e) => {
                          const v = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setLines((prev) => prev.map((x) => (x.key === l.key ? { ...x, qty: v } : x)));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={`${inputCls} py-2`}
                        value={l.unitPrice}
                        onChange={(e) => {
                          const v = Math.max(0, parseFloat(e.target.value) || 0);
                          setLines((prev) => prev.map((x) => (x.key === l.key ? { ...x, unitPrice: v } : x)));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className={`${inputCls} py-2`}
                        value={l.discount}
                        onChange={(e) => {
                          const v = Math.max(0, parseFloat(e.target.value) || 0);
                          setLines((prev) => prev.map((x) => (x.key === l.key ? { ...x, discount: v } : x)));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-100">{lineNet.toFixed(2)}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        title={t("dash.common.delete")}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => setLines((prev) => prev.filter((x) => x.key !== l.key))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {lines.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-slate-500">
                    {t("dash.invoices.noLinesYet")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className={labelCls}>{t("dash.invoices.vatPercent")}</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              className={inputCls}
              value={vatPercent}
              onChange={(e) => setVatPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("dash.invoices.paymentStatus")}</label>
            <select
              className={inputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value as "unpaid" | "paid")}
            >
              <option value="unpaid">{t("dash.invoices.unpaid")}</option>
              <option value="paid">{t("dash.invoices.paid")}</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("dash.invoices.amountPaid")}</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputCls}
              value={paid}
              onChange={(e) => setPaid(Math.max(0, parseFloat(e.target.value) || 0))}
            />
          </div>
          <div>
            <label className={labelCls}>{t("dash.invoices.amountDue")}</label>
            <div className="flex h-[42px] items-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 text-lg font-bold text-orange-200">
              {totals.amountDue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/25 p-4">
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex justify-between gap-2 text-slate-400">
              <span>{t("dash.invoiceDetail.subTotal")}</span>
              <span className="font-semibold text-slate-100">{totals.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-2 text-slate-400">
              <span>{t("dash.invoiceDetail.discount")}</span>
              <span className="font-semibold text-slate-100">{totals.discountTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-2 text-slate-400">
              <span>{t("dash.invoiceDetail.vat")}</span>
              <span className="font-semibold text-slate-100">{totals.vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-2 text-orange-200">
              <span className="font-semibold">{t("dash.invoiceDetail.totalAmount")}</span>
              <span className="text-lg font-bold">{totals.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          {effectiveStatus === "paid" ? (
            <p className="mt-3 text-xs text-amber-200/90">{t("dash.invoices.paidDeductsStock")}</p>
          ) : null}
        </div>

        <div>
          <label className={labelCls}>{t("dash.invoices.notes")}</label>
          <textarea className={`${inputCls} min-h-[80px] resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
