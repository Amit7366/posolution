"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/app/components/dashboard/ui/Modal";
import {
  useCreatePurchaseMutation,
  useGetSuppliersQuery,
  useLazyGetProductsQuery,
} from "@/redux/api/baseApi";

type LineRow = {
  key: string;
  productId: string;
  name: string;
  sku: string;
  qty: number;
  unitPrice: number;
  discount: number;
};

type SupplierDoc = {
  _id: string;
  name?: string;
  supplierName?: string;
  email?: string;
  phone?: string;
  address?: string;
};

type Props = { open: boolean; onClose: () => void; onCreated?: () => void };
const rowKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function CreatePurchaseModal({ open, onClose, onCreated }: Props) {
  const { data: supplierPayload, isLoading: suppliersLoading } = useGetSuppliersQuery(undefined);
  const [searchProducts, { data: productPayload, isFetching }] = useLazyGetProductsQuery();
  const [createPurchase, { isLoading: saving }] = useCreatePurchaseMutation();
  const [supplierId, setSupplierId] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [lines, setLines] = useState<LineRow[]>([]);
  const [title, setTitle] = useState("Purchase");
  const [vatPercent, setVatPercent] = useState(0);
  const [paid, setPaid] = useState(0);
  const [status, setStatus] = useState<"unpaid" | "paid">("unpaid");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const suppliers = useMemo(() => {
    const raw = (supplierPayload as { data?: SupplierDoc[] } | undefined)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [supplierPayload]);
  const selectedSupplier = suppliers.find((supplier) => supplier._id === supplierId);
  const productHits = useMemo(() => {
    const raw = (productPayload as { data?: unknown[] } | undefined)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [productPayload]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(productQuery.trim()), 350);
    return () => clearTimeout(timer);
  }, [productQuery]);

  useEffect(() => {
    if (open && debouncedQ.length >= 2) void searchProducts({ page: 1, limit: 15, search: debouncedQ });
  }, [open, debouncedQ, searchProducts]);

  function resetForm() {
    setSupplierId("");
    setProductQuery("");
    setDebouncedQ("");
    setLines([]);
    setTitle("Purchase");
    setVatPercent(0);
    setPaid(0);
    setStatus("unpaid");
    setDueDate(new Date().toISOString().slice(0, 10));
    setNotes("");
  }

  function closeModal() {
    resetForm();
    onClose();
  }

  const totals = useMemo(() => {
    const subTotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
    const discountTotal = lines.reduce((sum, line) => sum + line.discount, 0);
    const vatAmount = ((subTotal - discountTotal) * vatPercent) / 100;
    const totalAmount = subTotal - discountTotal + vatAmount;
    return { subTotal, discountTotal, vatAmount, totalAmount, amountDue: totalAmount - paid };
  }, [lines, paid, vatPercent]);

  function addProduct(product: Record<string, unknown>) {
    const productId = String(product._id ?? "");
    if (!productId) return;
    if (lines.some((line) => line.productId === productId)) return toast.message("Product already added.");
    setLines((current) => [...current, {
      key: rowKey(),
      productId,
      name: String(product.name ?? ""),
      sku: String(product.sku ?? ""),
      qty: 1,
      unitPrice: Number(product.price) || 0,
      discount: 0,
    }]);
    setProductQuery("");
    setDebouncedQ("");
  }

  async function submit() {
    if (!selectedSupplier) return toast.error("Select a supplier.");
    if (!lines.length) return toast.error("Add at least one product.");
    if (lines.some((line) => line.qty < 1)) return toast.error("Quantity must be at least 1.");
    const effectiveStatus = paid >= totals.totalAmount && totals.totalAmount > 0 ? "paid" : status;
    try {
      await createPurchase({
        supplierId: selectedSupplier._id,
        supplierName: selectedSupplier.name || selectedSupplier.supplierName || "",
        supplierEmail: selectedSupplier.email || "",
        supplierPhone: selectedSupplier.phone || "",
        supplierAddress: selectedSupplier.address || "",
        title: title.trim() || "Purchase",
        items: lines.map(({ productId, qty, unitPrice, discount }) => ({ productId, qty, unitPrice, discount })),
        vatPercent,
        paid,
        status: effectiveStatus,
        hold: false,
        dueDate,
        notes: notes.trim(),
        ...(paid > 0 ? { paymentType: "cash" as const } : {}),
      }).unwrap();
      toast.success("Purchase created successfully.");
      onCreated?.();
      closeModal();
    } catch (error: unknown) {
      toast.error((error as { data?: { message?: string } })?.data?.message || "Could not create purchase.");
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400";

  return (
    <Modal open={open} onClose={closeModal} title="Create Purchase" className="max-w-5xl" footer={
      <div className="flex w-full justify-end gap-2">
        <button type="button" onClick={closeModal} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600">Cancel</button>
        <button type="button" disabled={saving} onClick={() => void submit()} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create Purchase
        </button>
      </div>
    }>
      <div className="max-h-[min(78vh,720px)] space-y-6 overflow-y-auto pr-1">
        <div className="grid gap-4 lg:grid-cols-2">
          <label>
            <span className={labelClass}>Supplier *</span>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass}>
              <option value="">{suppliersLoading ? "Loading suppliers..." : "Select supplier"}</option>
              {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.name || supplier.supplierName || "Unnamed supplier"}</option>)}
            </select>
          </label>
          <label><span className={labelClass}>Due date *</span><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} /></label>
          <label className="lg:col-span-2"><span className={labelClass}>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} /></label>
        </div>

        <div>
          <span className={labelClass}>Products</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Search products by name or SKU" className={`${inputClass} pl-10`} />
            {isFetching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-orange-500" />}
          </div>
          {debouncedQ.length >= 2 && productHits.length > 0 && (
            <ul className="mt-2 max-h-48 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              {productHits.map((item) => {
                const product = item as Record<string, unknown>;
                return <li key={String(product._id)}><button type="button" onClick={() => addProduct(product)} className="flex w-full justify-between px-3 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-white/[0.06]"><strong>{String(product.name || "")}</strong><span className="text-gray-500">SKU {String(product.sku || "—")} · Price {String(product.price || 0)}</span></button></li>;
              })}
            </ul>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full min-w-[680px] text-sm">
            <thead><tr className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-white/[0.04]"><th className="px-3 py-3">Product</th><th className="px-3 py-3">Qty</th><th className="px-3 py-3">Unit cost</th><th className="px-3 py-3">Discount</th><th className="px-3 py-3 text-right">Total</th><th /></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {lines.map((line) => <tr key={line.key}>
                <td className="px-3 py-2"><strong>{line.name}</strong><div className="text-xs text-gray-500">{line.sku || "No SKU"}</div></td>
                <td className="w-24 px-3 py-2"><input type="number" min={1} value={line.qty} onChange={(e) => setLines((rows) => rows.map((row) => row.key === line.key ? { ...row, qty: Math.max(1, Number(e.target.value) || 1) } : row))} className={inputClass} /></td>
                <td className="w-32 px-3 py-2"><input type="number" min={0} step=".01" value={line.unitPrice} onChange={(e) => setLines((rows) => rows.map((row) => row.key === line.key ? { ...row, unitPrice: Math.max(0, Number(e.target.value) || 0) } : row))} className={inputClass} /></td>
                <td className="w-32 px-3 py-2"><input type="number" min={0} step=".01" value={line.discount} onChange={(e) => setLines((rows) => rows.map((row) => row.key === line.key ? { ...row, discount: Math.max(0, Number(e.target.value) || 0) } : row))} className={inputClass} /></td>
                <td className="px-3 py-2 text-right font-semibold">{(line.qty * line.unitPrice - line.discount).toFixed(2)}</td>
                <td className="px-2"><button type="button" onClick={() => setLines((rows) => rows.filter((row) => row.key !== line.key))} className="p-2 text-red-500"><Trash2 className="h-4 w-4" /></button></td>
              </tr>)}
              {!lines.length && <tr><td colSpan={6} className="px-3 py-10 text-center text-gray-500">No products added yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <label><span className={labelClass}>VAT percent</span><input type="number" min={0} max={100} step=".01" value={vatPercent} onChange={(e) => setVatPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} className={inputClass} /></label>
          <label><span className={labelClass}>Amount paid</span><input type="number" min={0} step=".01" value={paid} onChange={(e) => setPaid(Math.max(0, Number(e.target.value) || 0))} className={inputClass} /></label>
          <label><span className={labelClass}>Status</span><select value={status} onChange={(e) => setStatus(e.target.value as "paid" | "unpaid")} className={inputClass}><option value="unpaid">Unpaid</option><option value="paid">Paid</option></select></label>
        </div>
        <div className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-black/20 sm:grid-cols-5">
          <Summary label="Subtotal" value={totals.subTotal} /><Summary label="Discount" value={totals.discountTotal} /><Summary label="VAT" value={totals.vatAmount} /><Summary label="Total" value={totals.totalAmount} accent /><Summary label="Due" value={totals.amountDue} accent />
        </div>
        <label><span className={labelClass}>Notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} min-h-20`} /></label>
      </div>
    </Modal>
  );
}

function Summary({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return <div><div className="text-xs text-gray-500">{label}</div><div className={`font-bold ${accent ? "text-orange-500" : ""}`}>{value.toFixed(2)}</div></div>;
}
