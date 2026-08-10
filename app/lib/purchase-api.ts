import type { Purchase, PurchaseItem, PurchaseStatus } from "@/app/types/purchase";

export type ApiPurchaseDoc = {
  _id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  supplierEmail?: string;
  supplierPhone?: string;
  supplierAddress?: string;
  title?: string;
  items: Array<{
    productId: string;
    productName: string;
    sku?: string;
    qty: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
  }>;
  subTotal: number;
  discountTotal: number;
  vatPercent: number;
  vatAmount: number;
  totalAmount: number;
  paid: number;
  status: "paid" | "unpaid";
  dueDate: string;
  hold?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function toUiPurchaseStatus(
  doc: Pick<ApiPurchaseDoc, "status" | "dueDate">
): PurchaseStatus {
  if (doc.status === "paid") return "Paid";
  const due = startOfDay(new Date(doc.dueDate));
  const today = startOfDay(new Date());
  if (doc.status === "unpaid" && due < today) return "Overdue";
  return "Unpaid";
}

function isoDateOnly(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function apiPurchaseToPurchase(doc: ApiPurchaseDoc): Purchase {
  const items: PurchaseItem[] = doc.items.map((it, i) => ({
    id: `${String(it.productId)}-${i}`,
    description: it.sku ? `${it.productName} (${it.sku})` : it.productName,
    qty: it.qty,
    cost: it.unitPrice,
    discount: it.discount,
    total: it.lineTotal,
  }));

  const amountDue = Math.round((doc.totalAmount - doc.paid) * 100) / 100;

  return {
    id: doc._id,
    purchaseNo: doc.purchaseNo,
    supplierId: String(doc.supplierId ?? ""),
    supplierName: doc.supplierName,
    supplierEmail: doc.supplierEmail ?? "",
    supplierPhone: doc.supplierPhone ?? "",
    supplierAddress: doc.supplierAddress ?? "",
    createdAt:
      isoDateOnly(doc.createdAt) ||
      isoDateOnly(doc.updatedAt) ||
      new Date().toISOString().slice(0, 10),
    dueDate: isoDateOnly(doc.dueDate),
    amount: doc.totalAmount,
    paid: doc.paid,
    amountDue,
    status: toUiPurchaseStatus(doc),
    title: doc.title || "Purchase",
    items,
    subTotal: doc.subTotal,
    discountTotal: doc.discountTotal,
    vatPercent: doc.vatPercent,
    vatAmount: doc.vatAmount,
    totalAmount: doc.totalAmount,
    hold: Boolean(doc.hold),
    notes: doc.notes,
  };
}
