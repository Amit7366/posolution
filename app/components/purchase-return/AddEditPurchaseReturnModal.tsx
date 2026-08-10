"use client";

import { formatMoney } from "@/app/lib/cx";
import type { PurchaseReturn, PurchaseReturnLine } from "@/app/types/purchase-return";
import {
  useCreatePurchaseReturnMutation,
  useGetSuppliersQuery,
  useLazyGetProductsQuery,
  useUpdatePurchaseReturnMutation,
} from "@/redux/api/baseApi";
import { Search, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Modal from "../ui/Modal";

type Props = {
  open: boolean;
  mode: "add" | "edit";
  initial?: PurchaseReturn | null;
  /** Prefill for creating a return from an existing purchase */
  prefill?: Partial<PurchaseReturn> | null;
  onClose: () => void;
  onSuccess?: () => void;
};

const inputCls =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white";
const labelCls = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200";

function uid() {
  return `line_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function lineSubtotal(line: Omit<PurchaseReturnLine, "subtotal">) {
  const discounted = Math.max(0, line.price * line.qty - line.discount);
  return Math.max(0, discounted + (discounted * line.taxPct) / 100);
}

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return String(data.message);
  }
  return null;
}

export default function AddEditPurchaseReturnModal({
  open,
  mode,
  initial,
  prefill,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";
  const [searchProducts, { data: productResult, isFetching }] = useLazyGetProductsQuery();
  const { data: supplierResult } = useGetSuppliersQuery({ status: "active" });
  const [createReturn, { isLoading: creating }] = useCreatePurchaseReturnMutation();
  const [updateReturn, { isLoading: updating }] = useUpdatePurchaseReturnMutation();

  const [supplierName, setSupplierName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [refundDueDate, setRefundDueDate] = useState("");
  const [reference, setReference] = useState("");
  const [returnStatus, setReturnStatus] = useState<"Pending" | "Received">("Pending");
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid">("unpaid");
  const [paid, setPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [lines, setLines] = useState<PurchaseReturnLine[]>([]);
  const [orderTax, setOrderTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  const suppliers = useMemo(() => {
    const raw = (supplierResult as { data?: unknown[] } | undefined)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [supplierResult]);

  const products = useMemo(() => {
    const raw = (productResult as { data?: unknown[] } | undefined)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [productResult]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(productQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [productQuery]);

  useEffect(() => {
    if (open && debouncedQuery.length >= 2) {
      void searchProducts({ page: 1, limit: 12, search: debouncedQuery });
    }
  }, [open, debouncedQuery, searchProducts]);

  useEffect(() => {
    if (!open) return;
    if (isEdit && initial) {
      // This effect intentionally resets the complete form whenever the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSupplierName(initial.supplierName);
      setDate(initial.date);
      setRefundDueDate(initial.refundDueDate ?? "");
      setReference(initial.reference);
      setReturnStatus(initial.status);
      setPaymentStatus(initial.paymentStatus === "Paid" ? "paid" : "unpaid");
      setPaid(initial.paid);
      setLines(initial.lines.map((line) => ({ ...line, subtotal: lineSubtotal(line) })));
      setOrderTax(initial.orderTax);
      setDiscount(initial.discount);
      setShipping(initial.shipping);
    } else if (prefill) {
      setSupplierName(prefill.supplierName ?? "");
      setDate(prefill.date || new Date().toISOString().slice(0, 10));
      setRefundDueDate(prefill.refundDueDate ?? "");
      setReference(
        prefill.reference || String(Math.floor(100000 + Math.random() * 900000))
      );
      setReturnStatus(prefill.status === "Received" ? "Received" : "Pending");
      setPaymentStatus(prefill.paymentStatus === "Paid" ? "paid" : "unpaid");
      setPaid(prefill.paid ?? 0);
      setLines(
        (prefill.lines ?? []).map((line) => ({
          ...line,
          id: line.id || uid(),
          subtotal: lineSubtotal(line),
        }))
      );
      setOrderTax(prefill.orderTax ?? 0);
      setDiscount(prefill.discount ?? 0);
      setShipping(prefill.shipping ?? 0);
    } else {
      setSupplierName("");
      setDate(new Date().toISOString().slice(0, 10));
      setRefundDueDate("");
      setReference(String(Math.floor(100000 + Math.random() * 900000)));
      setReturnStatus("Pending");
      setPaymentStatus("unpaid");
      setPaid(0);
      setLines([]);
      setOrderTax(0);
      setDiscount(0);
      setShipping(0);
    }
    setNotes("");
    setProductQuery("");
  }, [open, isEdit, initial, prefill]);

  const addProduct = (product: Record<string, unknown>) => {
    const productId = String(product._id ?? "");
    if (!productId) return;
    setLines((current) => {
      const found = current.findIndex((line) => line.productId === productId);
      if (found >= 0) {
        const next = [...current];
        const changed = { ...next[found], qty: next[found].qty + 1 };
        changed.subtotal = lineSubtotal(changed);
        next[found] = changed;
        return next;
      }
      const price = Number(product.price) || 0;
      return [
        {
          id: uid(),
          productId,
          name: String(product.name ?? ""),
          price,
          stock: Number(product.quantity) || 0,
          qty: 1,
          discount: 0,
          taxPct: 0,
          subtotal: price,
        },
        ...current,
      ];
    });
    setProductQuery("");
  };

  const updateLine = (id: string, patch: Partial<PurchaseReturnLine>) => {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== id) return line;
        const next = { ...line, ...patch };
        next.subtotal = lineSubtotal(next);
        return next;
      })
    );
  };

  const subTotal = useMemo(
    () => lines.reduce((sum, line) => sum + (Number.isFinite(line.subtotal) ? line.subtotal : 0), 0),
    [lines]
  );
  const grandTotal = Math.max(0, subTotal + Math.max(0, orderTax) - Math.max(0, discount) + Math.max(0, shipping));
  const saving = creating || updating;

  const submit = async () => {
    if (!supplierName.trim()) return void toast.error("Supplier name is required");
    if (!reference.trim()) return void toast.error("Reference is required");
    if (!lines.length) return void toast.error("Add at least one product");

    const body: Record<string, unknown> = {
      reference: reference.trim(),
      supplierName: supplierName.trim(),
      returnDate: date,
      refundDueDate: refundDueDate || null,
      items: lines.map((line) => ({
        productId: line.productId,
        qty: line.qty,
        unitPrice: line.price,
        discount: line.discount,
        taxPct: line.taxPct,
      })),
      orderTax,
      discount,
      shipping,
      paid: Math.max(0, paid),
      returnStatus: returnStatus === "Received" ? "received" : "pending",
      paymentStatus,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit && initial) {
        await updateReturn({ id: initial.id, body }).unwrap();
        toast.success("Purchase return updated");
      } else {
        await createReturn(body).unwrap();
        toast.success("Purchase return created");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error) || "Unable to save purchase return");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit purchase return" : "Add purchase return"}
      widthClassName="max-w-6xl"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div>
          <label className={labelCls}>Supplier name *</label>
          <input
            list="purchase-return-suppliers"
            value={supplierName}
            onChange={(event) => setSupplierName(event.target.value)}
            className={inputCls}
            placeholder="Select or enter supplier"
          />
          <datalist id="purchase-return-suppliers">
            {suppliers.map((raw) => {
              const supplier = raw as Record<string, unknown>;
              return <option key={String(supplier._id ?? supplier.supplierId)} value={String(supplier.name ?? "")} />;
            })}
          </datalist>
        </div>
        <div>
          <label className={labelCls}>Return date *</label>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Reference *</label>
          <input value={reference} onChange={(event) => setReference(event.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Refund due date</label>
          <input
            type="date"
            value={refundDueDate}
            onChange={(event) => setRefundDueDate(event.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Paid amount</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={paid}
            onChange={(event) => setPaid(Math.max(0, Number(event.target.value) || 0))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Payment status</label>
          <select
            value={paymentStatus}
            onChange={(event) => setPaymentStatus(event.target.value as "unpaid" | "paid")}
            className={inputCls}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label className={labelCls}>Products *</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={productQuery}
            onChange={(event) => setProductQuery(event.target.value)}
            placeholder="Search products"
            className={`${inputCls} pl-10`}
          />
          {isFetching && <span className="absolute right-3 top-3 text-orange-500">…</span>}
          {debouncedQuery.length >= 2 && products.length > 0 && (
            <div className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
              {products.map((raw) => {
                const product = raw as Record<string, unknown>;
                return (
                  <button
                    key={String(product._id)}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="flex w-full justify-between px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {String(product.name ?? "")}
                      <small className="ml-2 text-gray-500">Stock: {String(product.quantity ?? 0)}</small>
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{formatMoney(Number(product.price) || 0)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-[850px] w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Unit price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Tax %</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {!lines.length && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No products added</td></tr>
            )}
            {lines.map((line) => (
              <tr key={line.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{line.name}</td>
                <td className="px-4 py-3">{line.price}</td>
                <td className="px-4 py-3">{line.stock}</td>
                <td className="px-4 py-3">
                  <input type="number" min={1} value={line.qty} onChange={(event) => updateLine(line.id, { qty: Math.max(1, Number(event.target.value) || 1) })} className="h-8 w-20 rounded border border-gray-300 bg-white px-2 dark:border-gray-600 dark:bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <input type="number" min={0} value={line.discount} onChange={(event) => updateLine(line.id, { discount: Math.max(0, Number(event.target.value) || 0) })} className="h-8 w-24 rounded border border-gray-300 bg-white px-2 dark:border-gray-600 dark:bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <input type="number" min={0} max={100} value={line.taxPct} onChange={(event) => updateLine(line.id, { taxPct: Math.min(100, Math.max(0, Number(event.target.value) || 0)) })} className="h-8 w-20 rounded border border-gray-300 bg-white px-2 dark:border-gray-600 dark:bg-gray-800" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <span>{line.subtotal.toFixed(2)}</span>
                    <button type="button" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="text-red-500"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-200 px-4 py-3 text-right text-sm dark:border-gray-700">
          Subtotal: <strong>{formatMoney(subTotal)}</strong>
          <span className="ml-6">Total: <strong className="text-orange-600">{formatMoney(grandTotal)}</strong></span>
          {returnStatus === "Received" && <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">Received will deduct stock</p>}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          ["Order tax", orderTax, setOrderTax],
          ["Discount", discount, setDiscount],
          ["Shipping", shipping, setShipping],
        ].map(([label, value, setter]) => (
          <div key={String(label)}>
            <label className={labelCls}>{String(label)}</label>
            <input type="number" min={0} value={value as number} onChange={(event) => (setter as React.Dispatch<React.SetStateAction<number>>)(Math.max(0, Number(event.target.value) || 0))} className={inputCls} />
          </div>
        ))}
        <div>
          <label className={labelCls}>Return status</label>
          <select value={returnStatus} onChange={(event) => setReturnStatus(event.target.value as "Pending" | "Received")} className={inputCls}>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className={labelCls}>Notes</label>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className={`${inputCls} h-auto py-3`} />
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
        <button type="button" onClick={onClose} className="h-10 rounded-lg border border-gray-300 px-6 text-sm font-semibold dark:border-gray-600">Cancel</button>
        <button type="button" disabled={saving} onClick={() => void submit()} className="h-10 rounded-lg bg-orange-500 px-6 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
          {saving ? "Saving..." : isEdit ? "Save" : "Submit"}
        </button>
      </div>
    </Modal>
  );
}
