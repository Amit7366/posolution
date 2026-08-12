import { idbGet, idbGetAll, idbPut, idbPutMany, STORE } from "./posDb";

export type CachedProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  images?: string[];
  categoryId?: string;
  status?: string;
  updatedAt?: string;
};

export type CachedCategory = {
  id: string;
  name: string;
  status?: string;
};

export type CachedCustomer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  clientCustomerId?: string;
  isTemp?: boolean;
};

export type CachedStore = {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  logo?: string;
};

export type CachedInvoice = {
  id: string;
  invoiceNo: string;
  customerName?: string;
  customerPhone?: string;
  createdAt?: string;
  status?: string;
  totalAmount?: number;
  hold?: boolean;
  pendingSync?: boolean;
  syncedAsHold?: boolean;
  failedSync?: boolean;
  syncError?: string;
  clientSaleId?: string;
  detail?: Record<string, unknown>;
};

function includesQ(hay: string, q: string) {
  return hay.toLowerCase().includes(q.toLowerCase());
}

export async function upsertProducts(rows: CachedProduct[]) {
  await idbPutMany(STORE.products, rows);
}

export async function upsertCategories(rows: CachedCategory[]) {
  await idbPutMany(STORE.categories, rows);
}

export async function upsertCustomers(rows: CachedCustomer[]) {
  await idbPutMany(STORE.customers, rows);
}

export async function upsertStores(rows: CachedStore[]) {
  await idbPutMany(STORE.stores, rows);
}

export async function upsertInvoices(rows: CachedInvoice[]) {
  await idbPutMany(STORE.invoices, rows);
}

export async function upsertInvoice(row: CachedInvoice) {
  await idbPut(STORE.invoices, row);
}

export async function getCachedProduct(id: string) {
  return idbGet<CachedProduct>(STORE.products, id);
}

export async function getCachedCustomer(id: string) {
  return idbGet<CachedCustomer>(STORE.customers, id);
}

export async function searchCachedProducts(opts: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: CachedProduct[]; total: number }> {
  const all = await idbGetAll<CachedProduct>(STORE.products);
  const q = (opts.search || "").trim();
  const cat = opts.categoryId || "";
  let filtered = all.filter((p) => {
    if (cat && p.categoryId !== cat) return false;
    if (!q) return true;
    return includesQ(p.name, q) || (p.sku ? includesQ(p.sku, q) : false);
  });
  filtered.sort((a, b) => a.name.localeCompare(b.name));
  const total = filtered.length;
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.max(1, opts.limit ?? 24);
  const start = (page - 1) * limit;
  return { data: filtered.slice(start, start + limit), total };
}

export async function getAllCachedCategories() {
  const rows = await idbGetAll<CachedCategory>(STORE.categories);
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}

export async function searchCachedCustomers(opts: {
  search?: string;
  limit?: number;
}): Promise<CachedCustomer[]> {
  const all = await idbGetAll<CachedCustomer>(STORE.customers);
  const q = (opts.search || "").trim();
  let filtered = all.filter((c) => {
    if (c.status && c.status !== "active") return false;
    if (!q) return true;
    return (
      includesQ(c.name, q) ||
      (c.phone ? includesQ(c.phone, q) : false) ||
      (c.email ? includesQ(c.email, q) : false)
    );
  });
  filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered.slice(0, opts.limit ?? 40);
}

export async function getAllCachedStores() {
  return idbGetAll<CachedStore>(STORE.stores);
}

export async function searchCachedInvoices(opts: {
  search?: string;
  limit?: number;
}): Promise<CachedInvoice[]> {
  const all = await idbGetAll<CachedInvoice>(STORE.invoices);
  const q = (opts.search || "").trim();
  let filtered = all.filter((inv) => {
    if (!q) return true;
    return includesQ(inv.invoiceNo || "", q) || includesQ(inv.customerName || "", q);
  });
  filtered.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  return filtered.slice(0, opts.limit ?? 40);
}

/** Decrement local stock after an offline sale is queued. */
export async function decrementLocalStock(
  lines: { productId: string; qty: number }[]
): Promise<void> {
  for (const line of lines) {
    const p = await getCachedProduct(line.productId);
    if (!p) continue;
    const next = Math.max(0, (p.quantity ?? 0) - line.qty);
    await idbPut(STORE.products, { ...p, quantity: next });
  }
}
