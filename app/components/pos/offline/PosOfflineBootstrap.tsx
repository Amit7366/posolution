"use client";

import { useEffect, useRef } from "react";
import {
  useLazyGetCategoriesQuery,
  useLazyGetCustomersQuery,
  useLazyGetInvoicesQuery,
  useLazyGetProductsQuery,
  useLazyGetStoresQuery,
} from "@/redux/api/baseApi";
import {
  upsertCategories,
  upsertCustomers,
  upsertInvoices,
  upsertProducts,
  upsertStores,
  type CachedCategory,
  type CachedCustomer,
  type CachedInvoice,
  type CachedProduct,
  type CachedStore,
} from "./posCache";
import { usePosOffline } from "./PosOfflineProvider";

function mapProduct(p: Record<string, unknown>): CachedProduct {
  const cat = p.categoryId;
  const categoryId =
    typeof cat === "string"
      ? cat
      : cat && typeof cat === "object" && "_id" in (cat as object)
        ? String((cat as { _id: string })._id)
        : undefined;
  return {
    id: String(p._id),
    name: String(p.name ?? ""),
    price: Number(p.price) || 0,
    quantity: Number(p.quantity) || 0,
    sku: p.sku ? String(p.sku) : undefined,
    images: Array.isArray(p.images) ? (p.images as string[]) : undefined,
    categoryId,
    status: p.status ? String(p.status) : undefined,
  };
}

function mapCustomer(c: Record<string, unknown>): CachedCustomer {
  return {
    id: String(c._id),
    name: String(c.name ?? ""),
    phone: c.phone ? String(c.phone) : undefined,
    email: c.email ? String(c.email) : undefined,
    address: c.address ? String(c.address) : undefined,
    status: c.status ? String(c.status) : "active",
    clientCustomerId: c.clientCustomerId ? String(c.clientCustomerId) : undefined,
  };
}

function mapInvoice(inv: Record<string, unknown>): CachedInvoice {
  return {
    id: String(inv._id),
    invoiceNo: String(inv.invoiceNo ?? ""),
    customerName: inv.customerName ? String(inv.customerName) : undefined,
    customerPhone: inv.customerPhone ? String(inv.customerPhone) : undefined,
    createdAt: inv.createdAt ? String(inv.createdAt) : undefined,
    status: inv.status ? String(inv.status) : undefined,
    totalAmount: Number(inv.totalAmount) || 0,
    hold: Boolean(inv.hold),
    pendingSync: false,
    clientSaleId: inv.clientSaleId ? String(inv.clientSaleId) : undefined,
  };
}

/**
 * Prefetches POS catalog into IndexedDB while online and kicks off sync.
 */
export default function PosOfflineBootstrap() {
  const started = useRef(false);
  const [fetchProducts] = useLazyGetProductsQuery();
  const [fetchCategories] = useLazyGetCategoriesQuery();
  const [fetchCustomers] = useLazyGetCustomersQuery();
  const [fetchStores] = useLazyGetStoresQuery();
  const [fetchInvoices] = useLazyGetInvoicesQuery();
  const { syncNow } = usePosOffline();

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function prefetch() {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        void syncNow();
        return;
      }

      try {
        const [catRes, custRes, storeRes, invRes] = await Promise.all([
          fetchCategories({ page: 1, limit: 100, status: "active" }).unwrap(),
          fetchCustomers({ page: 1, limit: 200, status: "active" }).unwrap(),
          fetchStores({ page: 1, limit: 50 }).unwrap(),
          fetchInvoices({ page: 1, limit: 40 }).unwrap(),
        ]);

        const cats = (Array.isArray(catRes?.data) ? catRes.data : []) as Record<
          string,
          unknown
        >[];
        await upsertCategories(
          cats.map(
            (c): CachedCategory => ({
              id: String(c._id),
              name: String(c.name ?? ""),
              status: c.status ? String(c.status) : undefined,
            })
          )
        );

        const customers = (Array.isArray(custRes?.data) ? custRes.data : []) as Record<
          string,
          unknown
        >[];
        await upsertCustomers(customers.map(mapCustomer));

        const stores = (Array.isArray(storeRes?.data) ? storeRes.data : []) as Record<
          string,
          unknown
        >[];
        await upsertStores(
          stores.map(
            (s): CachedStore => ({
              id: String(s._id),
              name: String(s.name ?? ""),
              address: s.address ? String(s.address) : undefined,
              email: s.email ? String(s.email) : undefined,
              phone: s.phone ? String(s.phone) : undefined,
              logo: s.logo ? String(s.logo) : undefined,
            })
          )
        );

        const invoices = (Array.isArray(invRes?.data) ? invRes.data : []) as Record<
          string,
          unknown
        >[];
        await upsertInvoices(invoices.map(mapInvoice));

        let page = 1;
        let hasMore = true;
        while (hasMore && page <= 20) {
          const res = await fetchProducts({
            page,
            limit: 100,
            status: "active",
            sortBy: "name",
            sortOrder: "asc",
          }).unwrap();
          const rows = (Array.isArray(res?.data) ? res.data : []) as Record<
            string,
            unknown
          >[];
          await upsertProducts(rows.map(mapProduct));
          const total = Number(res?.meta?.total ?? 0);
          const loaded = page * 100;
          hasMore = rows.length > 0 && loaded < total;
          page += 1;
        }
      } catch {
        /* offline or API error */
      }

      void syncNow();
    }

    void prefetch();
  }, [
    fetchCategories,
    fetchCustomers,
    fetchInvoices,
    fetchProducts,
    fetchStores,
    syncNow,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/pos-sw.js").catch(() => {
      /* ignore */
    });
  }, []);

  return null;
}
