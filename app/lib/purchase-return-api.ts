import type {
  PaymentStatus,
  PurchaseReturn,
  PurchaseReturnLine,
  ReturnStatus,
} from "@/app/types/purchase-return";

export type ApiPurchaseReturnLine = {
  productId: string;
  productName: string;
  sku: string;
  imageUrl: string;
  qty: number;
  unitPrice: number;
  discount: number;
  taxPct: number;
  lineSubtotal: number;
};

export type ApiPurchaseReturnDoc = {
  _id: string;
  returnNo: string;
  reference: string;
  supplierName: string;
  returnDate: string;
  refundDueDate?: string;
  items: ApiPurchaseReturnLine[];
  orderTax: number;
  discount: number;
  shipping: number;
  linesSubTotal: number;
  totalAmount: number;
  paid: number;
  returnStatus: "pending" | "received";
  paymentStatus: "unpaid" | "paid";
  notes?: string;
  stockDeducted?: boolean;
  createdAt?: string;
};

function isoDateOnly(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function toUiPaymentStatus(
  doc: Pick<ApiPurchaseReturnDoc, "paymentStatus" | "refundDueDate">
): PaymentStatus {
  if (doc.paymentStatus === "paid") return "Paid";
  if (doc.refundDueDate) {
    const due = startOfDay(new Date(doc.refundDueDate));
    const today = startOfDay(new Date());
    if (doc.paymentStatus === "unpaid" && due < today) return "Overdue";
  }
  return "Unpaid";
}

export function apiDocToPurchaseReturn(doc: ApiPurchaseReturnDoc): PurchaseReturn {
  const first = doc.items[0];
  const due = Math.round((doc.totalAmount - doc.paid) * 100) / 100;

  const lines: PurchaseReturnLine[] = doc.items.map((it, i) => ({
    id: `l-${i}-${String(it.productId)}`,
    productId: String(it.productId),
    name: it.productName,
    price: it.unitPrice,
    stock: 0,
    qty: it.qty,
    discount: it.discount,
    taxPct: it.taxPct,
    subtotal: it.lineSubtotal,
  }));

  const status: ReturnStatus = doc.returnStatus === "received" ? "Received" : "Pending";

  return {
    id: doc._id,
    returnNo: doc.returnNo,
    productName: first?.productName ?? "—",
    productImage: first?.imageUrl,
    date: isoDateOnly(doc.returnDate) || isoDateOnly(doc.createdAt),
    refundDueDate: isoDateOnly(doc.refundDueDate),
    supplierName: doc.supplierName,
    status,
    total: doc.totalAmount,
    paid: doc.paid,
    due,
    paymentStatus: toUiPaymentStatus(doc),
    reference: doc.reference,
    lines,
    orderTax: doc.orderTax,
    discount: doc.discount,
    shipping: doc.shipping,
  };
}
