export type PurchaseStatus = "Paid" | "Unpaid" | "Overdue";

export type PurchaseItem = {
  id: string;
  description: string;
  qty: number;
  cost: number;
  discount: number;
  total: number;
};

export type Purchase = {
  id: string;
  purchaseNo: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierAddress: string;
  createdAt: string;
  dueDate: string;
  amount: number;
  paid: number;
  amountDue: number;
  status: PurchaseStatus;
  title: string;
  items: PurchaseItem[];
  subTotal: number;
  discountTotal: number;
  vatPercent: number;
  vatAmount: number;
  totalAmount: number;
  hold: boolean;
  notes?: string;
};
