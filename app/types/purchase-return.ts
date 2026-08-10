export type ReturnStatus = "Received" | "Pending";
export type PaymentStatus = "Paid" | "Unpaid" | "Overdue";

export type PurchaseReturnLine = {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  qty: number;
  discount: number;
  taxPct: number;
  subtotal: number;
};

export type PurchaseReturn = {
  id: string;
  returnNo?: string;
  productName: string;
  productImage?: string;
  date: string;
  refundDueDate?: string;
  supplierName: string;
  status: ReturnStatus;
  total: number;
  paid: number;
  due: number;
  paymentStatus: PaymentStatus;
  reference: string;
  lines: PurchaseReturnLine[];
  orderTax: number;
  discount: number;
  shipping: number;
};
