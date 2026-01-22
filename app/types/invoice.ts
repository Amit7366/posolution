export type InvoiceStatus = "Paid" | "Unpaid" | "Overdue";

export type InvoiceItem = {
  id: string;
  description: string;
  qty: number;
  cost: number; // per unit
  discount: number; // item discount amount
  total: number; // after discount (or final line total)
};

export type Party = {
  name: string;
  address: string;
  email: string;
  phone: string;
};

export type Customer = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Invoice = {
  id: string; // internal id (slug/uuid)
  invoiceNo: string; // INV0001
  customer: Customer;

  createdAt: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD

  amount: number; // total amount (grand)
  paid: number; // paid amount
  amountDue: number; // computed usually

  status: InvoiceStatus;

  from: Party;
  to: Party;

  title: string; // "Design & development of Website"
  items: InvoiceItem[];

  subTotal: number;
  discountTotal: number;
  vatPercent: number; // 5
  vatAmount: number;
  totalAmount: number;

  paymentQrText?: string; // string to encode to QR
};
