import type { Invoice, InvoiceItem, InvoiceStatus, Party } from "@/app/types/invoice";

export type ApiInvoiceDoc = {
  _id: string;
  invoiceNo: string;
  fromParty?: Party;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
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
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function toUiInvoiceStatus(doc: Pick<ApiInvoiceDoc, "status" | "dueDate">): InvoiceStatus {
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

const emptyParty: Party = { name: "", address: "", email: "", phone: "" };

export function apiInvoiceToInvoice(doc: ApiInvoiceDoc): Invoice {
  const items: InvoiceItem[] = doc.items.map((it, i) => ({
    id: `${String(it.productId)}-${i}`,
    description: it.sku ? `${it.productName} (${it.sku})` : it.productName,
    qty: it.qty,
    cost: it.unitPrice,
    discount: it.discount,
    total: it.lineTotal,
  }));

  const from: Party = doc.fromParty ?? emptyParty;
  const to: Party = {
    name: doc.customerName,
    address: doc.customerAddress ?? "",
    email: doc.customerEmail ?? "",
    phone: doc.customerPhone ?? "",
  };

  const amountDue = Math.round((doc.totalAmount - doc.paid) * 100) / 100;

  return {
    id: doc._id,
    invoiceNo: doc.invoiceNo,
    customer: { id: doc._id, name: doc.customerName },
    createdAt: isoDateOnly(doc.createdAt) || isoDateOnly(doc.updatedAt) || new Date().toISOString().slice(0, 10),
    dueDate: isoDateOnly(doc.dueDate),
    amount: doc.totalAmount,
    paid: doc.paid,
    amountDue,
    status: toUiInvoiceStatus(doc),
    from,
    to,
    title: doc.title || "Sales invoice",
    items,
    subTotal: doc.subTotal,
    discountTotal: doc.discountTotal,
    vatPercent: doc.vatPercent,
    vatAmount: doc.vatAmount,
    totalAmount: doc.totalAmount,
    paymentQrText: `Invoice:${doc.invoiceNo}|Amount:${doc.totalAmount}|Customer:${doc.customerName}`,
  };
}
