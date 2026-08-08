export type DashboardChartPoint = { label: string; sales: number; purchase: number };

export type DashboardDueInvoice = {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paid: number;
  amountDue: number;
  dueDate: string;
  overdue: boolean;
};

export type DashboardSummary = {
  totals: {
    totalSales: number;
    totalSalesReturn: number;
    totalPurchase: number;
    totalPurchaseReturn: number;
    profit: number;
    collectedIncome: number;
    invoiceDue: number;
    totalExpenses: number;
    totalPaymentReturns: number;
  };
  trends: {
    salesPctVsLastMonth: number | null;
    salesReturnPctVsLastMonth: number | null;
    profitPctVsLastMonth: number | null;
    collectedIncomePctVsLastMonth: number | null;
    invoiceDuePctVsLastMonth: number | null;
  };
  counts: {
    suppliers: number;
    customers: number;
    orders: number;
    products: number;
    categories: number;
    invoicesToday: number;
  };
  customersOverview: {
    firstTime: number;
    returning: number;
  };
  topProducts: Array<{
    productId: string;
    name: string;
    price: number;
    qtySold: number;
    revenue: number;
    imageUrl: string;
  }>;
  lowStock: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    imageUrl: string;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNo: string;
    productLabel: string;
    categoryLabel: string;
    amount: number;
    status: "paid" | "unpaid" | "overdue";
    date: string;
    isToday: boolean;
    imageUrl: string;
  }>;
  dueInvoices: DashboardDueInvoice[];
  topCustomers: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  topCategories: Array<{
    categoryId: string | null;
    name: string;
    revenue: number;
  }>;
  categoryStats: {
    categoryCount: number;
    productCount: number;
  };
  orderHeatmap: number[][];
  chartPoints: DashboardChartPoint[];
  chartRange: string;
};

export function parseDashboardSummaryPayload(payload: unknown): DashboardSummary | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  return data as DashboardSummary;
}
