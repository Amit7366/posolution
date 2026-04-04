export type LowStockProduct = {
  id: string;
  warehouse: string;
  store: string;
  name: string;
  imageUrl?: string;
  category: string;
  sku: string;
  quantity: number;
  /** Stored on product; null means list used default threshold */
  lowStockThreshold: number | null;
};
