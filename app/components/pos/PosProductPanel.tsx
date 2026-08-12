"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LayoutGrid, List, Search } from "lucide-react";
import { toast } from "sonner";
import { useGetCategoriesQuery, useLazyGetProductsQuery } from "@/redux/api/baseApi";
import { usePosCart } from "./PosCartContext";
import { formatTaka } from "./formatTaka";
import { ProductGridSkeleton, ProductListSkeleton } from "./PosSkeletons";
import {
  getAllCachedCategories,
  searchCachedProducts,
  upsertProducts,
  type CachedProduct,
} from "./offline/posCache";
import { usePosOffline } from "./offline/PosOfflineProvider";

type ProductRow = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  images?: string[];
  unitId?: { name?: string; shortName?: string } | string;
};

const PAGE_SIZE = 24;

function cachedToRow(p: CachedProduct): ProductRow {
  return {
    _id: p.id,
    name: p.name,
    price: p.price,
    quantity: p.quantity,
    sku: p.sku,
    images: p.images,
  };
}

export default function PosProductPanel() {
  const { addItem } = usePosCart();
  const { online } = usePosOffline();
  const [view, setView] = useState<"list" | "grid">("list");
  const [categoryId, setCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [offlineCats, setOfflineCats] = useState<{ _id: string; name: string }[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const itemsRef = useRef<ProductRow[]>([]);
  const wasOnlineRef = useRef(online);

  const [fetchProducts, { isFetching, isLoading }] = useLazyGetProductsQuery();
  const { data: catPayload } = useGetCategoriesQuery(
    { page: 1, limit: 100, status: "active" },
    { skip: !online }
  );

  // Keep latest items for offline seed without stale closures
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const categories = useMemo(() => {
    if (!online) return offlineCats;
    const raw = (catPayload as { data?: unknown[] } | undefined)?.data;
    const api = Array.isArray(raw) ? (raw as { _id: string; name: string }[]) : [];
    if (api.length > 0) return api;
    return offlineCats;
  }, [online, catPayload, offlineCats]);

  // Seed offline category list from last API response so dropdown doesn't empty
  useEffect(() => {
    const raw = (catPayload as { data?: unknown[] } | undefined)?.data;
    if (!Array.isArray(raw) || raw.length === 0) return;
    setOfflineCats(
      (raw as { _id: string; name: string }[]).map((c) => ({
        _id: c._id,
        name: c.name,
      }))
    );
  }, [catPayload]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // Only reset list on search/category change — NOT when online flips
  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [debouncedQ, categoryId]);

  useEffect(() => {
    if (online) return;
    void getAllCachedCategories().then((rows) => {
      if (rows.length === 0) return;
      setOfflineCats(rows.map((c) => ({ _id: c.id, name: c.name })));
    });
  }, [online]);

  // When dropping offline: keep on-screen products, seed IDB, then merge from cache
  useEffect(() => {
    const wasOnline = wasOnlineRef.current;
    wasOnlineRef.current = online;
    if (wasOnline && !online) {
      const snapshot = itemsRef.current;
      if (snapshot.length > 0) {
        void upsertProducts(
          snapshot.map((p) => ({
            id: p._id,
            name: p.name,
            price: Number(p.price) || 0,
            quantity: Number(p.quantity) || 0,
            sku: p.sku,
            images: p.images,
            categoryId: categoryId || undefined,
          }))
        ).then(async () => {
          const { data, total: metaTotal } = await searchCachedProducts({
            search: debouncedQ || undefined,
            categoryId: categoryId || undefined,
            page: 1,
            limit: Math.max(PAGE_SIZE, snapshot.length),
          });
          if (data.length > 0) {
            setItems(data.map(cachedToRow));
            setTotal(metaTotal);
            setHasMore(data.length < metaTotal);
          }
        });
      } else {
        // Nothing on screen — try cache
        void searchCachedProducts({
          search: debouncedQ || undefined,
          categoryId: categoryId || undefined,
          page: 1,
          limit: PAGE_SIZE,
        }).then(({ data, total: metaTotal }) => {
          setItems(data.map(cachedToRow));
          setTotal(metaTotal);
          setHasMore(data.length < metaTotal);
        });
      }
    }
  }, [online, categoryId, debouncedQ]);

  const loadFromCache = useCallback(
    async (pageNum: number, replace: boolean) => {
      setLocalLoading(true);
      try {
        const { data, total: metaTotal } = await searchCachedProducts({
          search: debouncedQ || undefined,
          categoryId: categoryId || undefined,
          page: pageNum,
          limit: PAGE_SIZE,
        });
        const rows = data.map(cachedToRow);
        setTotal(metaTotal);
        setItems((prev) => {
          // Don't wipe a good in-memory list with an empty cache read
          if (replace && rows.length === 0 && prev.length > 0) {
            setHasMore(false);
            return prev;
          }
          const next = replace ? rows : [...prev, ...rows];
          setHasMore(next.length < metaTotal);
          return next;
        });
      } finally {
        setLocalLoading(false);
      }
    },
    [debouncedQ, categoryId]
  );

  const loadPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      try {
        if (!online) {
          await loadFromCache(pageNum, replace);
          return;
        }
        const res = await fetchProducts({
          page: pageNum,
          limit: PAGE_SIZE,
          search: debouncedQ || undefined,
          categoryId: categoryId || undefined,
          status: "active",
          sortBy: "name",
          sortOrder: "asc",
        }).unwrap();

        const rows = (Array.isArray(res?.data) ? res.data : []) as ProductRow[];
        const metaTotal = Number(res?.meta?.total ?? 0);
        setTotal(metaTotal);
        setItems((prev) => {
          const next = replace ? rows : [...prev, ...rows];
          setHasMore(next.length < metaTotal);
          return next;
        });
        // Await write-through so going offline immediately after load still has cache
        await upsertProducts(
          rows.map((p) => ({
            id: p._id,
            name: p.name,
            price: Number(p.price) || 0,
            quantity: Number(p.quantity) || 0,
            sku: p.sku,
            images: p.images,
            categoryId: categoryId || undefined,
          }))
        );
      } catch {
        await loadFromCache(pageNum, replace);
        if (replace && itemsRef.current.length === 0) {
          toast.message("Showing cached products (offline)");
        }
      } finally {
        loadingMoreRef.current = false;
      }
    },
    [fetchProducts, debouncedQ, categoryId, online, loadFromCache]
  );

  useEffect(() => {
    void loadPage(page, page === 1);
  }, [page, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasMore &&
          !isFetching &&
          !localLoading &&
          items.length > 0
        ) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, isFetching, localLoading, items.length]);

  function handleAdd(p: ProductRow) {
    if ((p.quantity ?? 0) < 1) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: p._id,
      name: p.name,
      sku: p.sku,
      price: Number(p.price) || 0,
      stock: Number(p.quantity) || 0,
      image: p.images?.[0],
    });
  }

  const showInitialSkeleton =
    ((isLoading || isFetching || localLoading) && items.length === 0);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-3 dark:border-gray-700 sm:p-4">
        <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`p-2 ${view === "list" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
            title="List view"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`p-2 ${view === "grid" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
            title="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
        </div>

        <div className="relative">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="appearance-none rounded-lg bg-orange-500 py-2 pl-3 pr-8 text-sm font-medium text-white outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id} className="text-gray-900">
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white"
          />
        </div>

        <div className="relative min-w-[160px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Product"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {showInitialSkeleton ? (
          view === "list" ? (
            <ProductListSkeleton />
          ) : (
            <ProductGridSkeleton />
          )
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">No products found</p>
        ) : view === "list" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => handleAdd(p)}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:border-orange-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-500/50"
              >
                <ProductThumb src={p.images?.[0]} name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900 dark:text-gray-100">{p.name}</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatTaka(Number(p.price) || 0)}
                  </p>
                  <p className="text-xs text-gray-400">Stock: {p.quantity ?? 0}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => handleAdd(p)}
                className="rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:border-orange-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-500/50"
              >
                <ProductThumb src={p.images?.[0]} name={p.name} large />
                <p className="mt-2 truncate font-semibold text-gray-900 dark:text-gray-100">{p.name}</p>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {formatTaka(Number(p.price) || 0)}
                </p>
              </button>
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-8 w-full" />
        {(isFetching || localLoading) && items.length > 0 && (
          <p className="py-3 text-center text-xs text-gray-400">Loading more…</p>
        )}
        {!hasMore && items.length > 0 && (
          <p className="py-2 text-center text-xs text-gray-400">
            Showing {items.length} of {total}
          </p>
        )}
      </div>
    </div>
  );
}

function ProductThumb({
  src,
  name,
  large,
}: {
  src?: string;
  name: string;
  large?: boolean;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={
          large
            ? "aspect-square w-full rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
            : "h-14 w-14 shrink-0 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
        }
      />
    );
  }
  return (
    <div
      className={
        large
          ? "flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-400 dark:bg-gray-700 dark:text-gray-500"
          : "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-400 dark:bg-gray-700 dark:text-gray-500"
      }
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
