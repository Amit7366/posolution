export type ReturnStatus = "Received" | "Pending";
export type PaymentStatus = "Paid" | "Unpaid" | "Overdue";

export type Customer = {
  id: string;
  name: string;
  avatar?: string;
};

export type Product = {
  id: string;
  name: string;
  code: string;
  sku: string;
  image?: string;
  stock: number;
  price: number;
};

export type SalesReturnLine = {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  qty: number;
  discount: number; // $
  taxPct: number; // %
  subtotal: number; // computed
};

export type SalesReturn = {
  id: string;
  productName: string; // display in list
  productImage?: string;
  date: string; // YYYY-MM-DD
  customer: Customer;

  status: ReturnStatus;
  total: number;
  paid: number;
  due: number;
  paymentStatus: PaymentStatus;

  reference: string;

  // modal details
  lines: SalesReturnLine[];
  orderTax: number;
  discount: number;
  shipping: number;
};
