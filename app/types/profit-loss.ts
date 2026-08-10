export type ProfitLossPreset = "1D" | "3D" | "7D" | "1M" | "1Y" | "custom";

export type ProfitLossReport = {
  preset: ProfitLossPreset;
  label: string;
  from: string;
  to: string;
  totals: {
    totalSales: number;
    totalSalesReturn: number;
    netSales: number;
    totalPurchase: number;
    totalPurchaseReturn: number;
    netPurchase: number;
    grossProfit: number;
    profitMargin: number | null;
    salesCollected: number;
    purchasePaid: number;
  };
  counts: {
    salesOrders: number;
    purchaseOrders: number;
  };
};

export function parseProfitLossPayload(raw: unknown): ProfitLossReport | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as { data?: unknown };
  const data = (root.data ?? raw) as Partial<ProfitLossReport> | null;
  if (!data || typeof data !== "object" || !data.totals) return null;
  return data as ProfitLossReport;
}
