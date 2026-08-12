"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useGetStoresQuery,
  useLazyGetInvoiceByIdQuery,
  useLazyGetInvoicesQuery,
} from "@/redux/api/baseApi";
import { TransactionListSkeleton, OrderDetailSkeleton } from "./PosSkeletons";
import PosReceipt, { printPosReceipt, type ReceiptInvoice } from "./PosReceipt";
import {
  getAllCachedStores,
  searchCachedInvoices,
  upsertInvoices,
  type CachedInvoice,
} from "./offline/posCache";
import { usePosOffline } from "./offline/PosOfflineProvider";
import { POS_SYNC_EVENT } from "./offline/posSync";

type InvoiceListItem = {
  _id: string;
  invoiceNo: string;
  customerName?: string;
  createdAt?: string;
  status?: string;
  totalAmount?: number;
  pendingSync?: boolean;
  syncedAsHold?: boolean;
  failedSync?: boolean;
  syncError?: string;
  hold?: boolean;
  detail?: Record<string, unknown>;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PosTransactionsSheet({ open, onClose }: Props) {
  const { online, syncNow, pending } = usePosOffline();
  const [view, setView] = useState<"list" | "detail">("list");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InvoiceListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localDetail, setLocalDetail] = useState<Record<string, unknown> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const [localLoading, setLocalLoading] = useState(false);

  const [fetchInvoices, { isFetching }] = useLazyGetInvoicesQuery();
  const [fetchInvoice, { data: detailPayload, isFetching: detailLoading }] =
    useLazyGetInvoiceByIdQuery();
  const { data: storesPayload } = useGetStoresQuery(
    { page: 1, limit: 20 },
    { skip: !online }
  );
  const [cachedStore, setCachedStore] = useState<{
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  } | null>(null);

  const store = useMemo(() => {
    const raw = (storesPayload as { data?: unknown[] } | undefined)?.data;
    const list = Array.isArray(raw)
      ? (raw as {
          name?: string;
          address?: string;
          email?: string;
          phone?: string;
        }[])
      : [];
    return list[0] ?? cachedStore;
  }, [storesPayload, cachedStore]);

  useEffect(() => {
    void getAllCachedStores().then((rows) => {
      const s = rows[0];
      if (s) {
        setCachedStore({
          name: s.name,
          address: s.address,
          email: s.email,
          phone: s.phone,
        });
      }
    });
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setView("list");
    setSelectedId(null);
    setLocalDetail(null);
    setPage(1);
    setItems([]);
    setHasMore(true);
    setQuery("");
    setDebounced("");
    if (online && pending > 0) void syncNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [debounced, open, online]);

  const mapCached = (inv: CachedInvoice): InvoiceListItem => ({
    _id: inv.id,
    invoiceNo: inv.invoiceNo,
    customerName: inv.customerName,
    createdAt: inv.createdAt,
    status: inv.pendingSync
      ? inv.failedSync
        ? "Failed sync"
        : "Pending sync"
      : inv.syncedAsHold
        ? "Held (stock)"
        : inv.status,
    totalAmount: inv.totalAmount,
    pendingSync: inv.pendingSync,
    syncedAsHold: inv.syncedAsHold,
    failedSync: inv.failedSync,
    syncError: inv.syncError,
    hold: inv.hold,
    detail: inv.detail,
  });

  const loadFromCache = useCallback(
    async (replace: boolean) => {
      setLocalLoading(true);
      try {
        const rows = await searchCachedInvoices({
          search: debounced || undefined,
          limit: 80,
        });
        const mapped = rows.map(mapCached);
        setItems(mapped);
        setHasMore(false);
      } finally {
        setLocalLoading(false);
      }
    },
    [debounced]
  );

  const loadPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (!open || loadingRef.current) return;
      loadingRef.current = true;
      try {
        if (!online) {
          await loadFromCache(replace);
          return;
        }
        const res = await fetchInvoices({
          page: pageNum,
          limit: 20,
          search: debounced || undefined,
        }).unwrap();
        const rows = (Array.isArray(res?.data) ? res.data : []) as InvoiceListItem[];
        const total = Number(res?.meta?.total ?? 0);

        // Merge pending local invoices at top on first page
        let pendingLocal: InvoiceListItem[] = [];
        if (pageNum === 1) {
          const cached = await searchCachedInvoices({ limit: 80 });
          pendingLocal = cached.filter((c) => c.pendingSync).map(mapCached);
          void upsertInvoices(
            rows.map((inv) => ({
              id: inv._id,
              invoiceNo: inv.invoiceNo,
              customerName: inv.customerName,
              createdAt: inv.createdAt,
              status: inv.status,
              totalAmount: inv.totalAmount,
              pendingSync: false,
            }))
          );
        }

        setItems((prev) => {
          const apiNext = replace ? rows : [...prev.filter((p) => !p.pendingSync), ...rows];
          const next =
            pageNum === 1
              ? [...pendingLocal, ...apiNext.filter((r) => !pendingLocal.some((p) => p._id === r._id))]
              : apiNext;
          setHasMore(rows.length > 0 && (replace ? rows.length : prev.length + rows.length) < total + pendingLocal.length);
          return next;
        });
      } catch {
        await loadFromCache(replace);
        if (replace) toast.message("Showing cached transactions (offline)");
      } finally {
        loadingRef.current = false;
      }
    },
    [open, fetchInvoices, debounced, online, loadFromCache]
  );

  useEffect(() => {
    if (!open || view !== "list") return;
    void loadPage(page, page === 1);
  }, [open, view, page, loadPage]);

  // Refresh list when offline sales sync finishes
  useEffect(() => {
    if (!open) return;
    const onSynced = () => {
      setPage(1);
      setItems([]);
      void loadPage(1, true);
    };
    window.addEventListener(POS_SYNC_EVENT, onSynced);
    return () => window.removeEventListener(POS_SYNC_EVENT, onSynced);
  }, [open, loadPage]);

  useEffect(() => {
    if (!open || view !== "list" || !online) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasMore &&
          !isFetching &&
          items.length > 0
        ) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [open, view, hasMore, isFetching, items.length, online]);

  useEffect(() => {
    if (!selectedId) return;
    if (selectedId.startsWith("local_")) {
      const local = items.find((i) => i._id === selectedId);
      setLocalDetail(local?.detail ?? null);
      return;
    }
    if (!online) {
      const local = items.find((i) => i._id === selectedId);
      setLocalDetail(local?.detail ?? null);
      return;
    }
    setLocalDetail(null);
    void fetchInvoice(selectedId);
  }, [selectedId, fetchInvoice, online, items]);

  const detail =
    localDetail ||
    (detailPayload as { data?: Record<string, unknown> } | undefined)?.data;

  function handlePrint() {
    if (!detail || (detail as { pendingSync?: boolean }).pendingSync) {
      toast.error("Cannot print until sale is synced");
      return;
    }
    const ok = printPosReceipt(detail as ReceiptInvoice, store);
    if (!ok) {
      toast.error("Allow pop-ups to print the receipt");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-900">
        {view === "list" ? (
          <>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ChevronLeft size={16} /> Close
              </button>
            </div>

            <div className="border-b border-gray-100 p-3 dark:border-gray-700">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Order"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {(isFetching || localLoading) && items.length === 0 ? (
                <TransactionListSkeleton />
              ) : items.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">No transactions</p>
              ) : (
                <div className="space-y-2">
                  {items.map((inv) => (
                    <button
                      key={inv._id}
                      type="button"
                      onClick={() => {
                        setSelectedId(inv._id);
                        setView("detail");
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:border-orange-300 hover:bg-orange-50/40 dark:border-gray-700 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/10"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{inv.invoiceNo}</p>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {inv.customerName || "Unknown"}
                          {inv.createdAt ? <> • {formatDateTime(inv.createdAt)}</> : null}
                        </p>
                        {(inv.pendingSync || inv.syncedAsHold || inv.failedSync) && (
                          <p
                            className={`mt-0.5 text-xs font-medium ${
                              inv.failedSync
                                ? "text-red-500"
                                : inv.pendingSync
                                  ? "text-amber-500"
                                  : "text-sky-500"
                            }`}
                          >
                            {inv.failedSync
                              ? inv.syncError || "Sync failed"
                              : inv.pendingSync
                                ? "Pending sync"
                                : "Held (stock) — confirm later"}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={18} className="shrink-0 text-gray-400" />
                    </button>
                  ))}
                  <div ref={sentinelRef} className="h-6" />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 print:hidden dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Order Details</h2>
              <button
                type="button"
                onClick={() => {
                  setView("list");
                  setSelectedId(null);
                  setLocalDetail(null);
                }}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ChevronLeft size={16} /> Back
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-gray-100 p-4 dark:bg-gray-950">
              {(detailLoading && !localDetail) || !detail ? (
                <OrderDetailSkeleton />
              ) : (
                <>
                  <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Thermal print preview · 80mm
                  </p>
                  <PosReceipt detail={detail as ReceiptInvoice} store={store} mode="screen" />
                </>
              )}
            </div>

            {detail && !(detail as { pendingSync?: boolean }).pendingSync && (
              <div className="border-t border-gray-100 p-4 print:hidden dark:border-gray-700">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full rounded-lg bg-orange-500 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-600"
                >
                  Print
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

function formatDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}
