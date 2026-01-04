export type Stock = {
  id: string;
  warehouseId: string;
  storeId: string;
  productId: string;
  personId: string;
  date: string; // YYYY-MM-DD
  qty: number;
};

export type Warehouse = { id: string; name: string };
export type Store = { id: string; warehouseId: string; name: string };

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  iconUrl?: string;
};

export type Person = {
  id: string;
  name: string;
  avatarUrl?: string;
};
