import type { Customer, PaymentStatus, ReturnStatus, SalesReturn, SalesReturnLine } from "@/app/types/sales-return";

export type ApiSalesReturnLine = {
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

export type ApiSalesReturnDoc = {
  _id: string;
  returnNo: string;
  reference: string;
  customerName: string;
  returnDate: string;
  refundDueDate?: string;
  items: ApiSalesReturnLine[];
  orderTax: number;
  discount: number;
  shipping: number;
  linesSubTotal: number;
  totalAmount: number;
  paid: number;
  returnStatus: "pending" | "received";
  paymentStatus: "unpaid" | "paid";
  notes?: string;
  stockRestored?: boolean;
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

export function toUiPaymentStatus(doc: Pick<ApiSalesReturnDoc, "paymentStatus" | "refundDueDate">): PaymentStatus {
  if (doc.paymentStatus === "paid") return "Paid";
  if (doc.refundDueDate) {
    const due = startOfDay(new Date(doc.refundDueDate));
    const today = startOfDay(new Date());
    if (doc.paymentStatus === "unpaid" && due < today) return "Overdue";
  }
  return "Unpaid";
}

export function apiDocToSalesReturn(doc: ApiSalesReturnDoc): SalesReturn {
  const first = doc.items[0];
  const due = Math.round((doc.totalAmount - doc.paid) * 100) / 100;

  const lines: SalesReturnLine[] = doc.items.map((it, i) => ({
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

  const customer: Customer = {
    id: doc._id,
    name: doc.customerName,
  };

  const status: ReturnStatus = doc.returnStatus === "received" ? "Received" : "Pending";

  return {
    id: doc._id,
    returnNo: doc.returnNo,
    productName: first?.productName ?? "—",
    productImage: first?.imageUrl || undefined,
    date: isoDateOnly(doc.returnDate),
    refundDueDate: doc.refundDueDate ? isoDateOnly(doc.refundDueDate) : undefined,
    customer,
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
