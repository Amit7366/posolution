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
import PosReceipt, { printPosReceipt } from "./PosReceipt";

type InvoiceListItem = {
  _id: string;
  invoiceNo: string;
  customerName?: string;
  createdAt?: string;
  status?: string;
  totalAmount?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PosTransactionsSheet({ open, onClose }: Props) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InvoiceListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const [fetchInvoices, { isFetching }] = useLazyGetInvoicesQuery();
  const [fetchInvoice, { data: detailPayload, isFetching: detailLoading }] =
    useLazyGetInvoiceByIdQuery();
  const { data: storesPayload } = useGetStoresQuery({ page: 1, limit: 20 });

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
    return list[0] ?? null;
  }, [storesPayload]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setView("list");
    setSelectedId(null);
    setPage(1);
    setItems([]);
    setHasMore(true);
    setQuery("");
    setDebounced("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    setItems([]);
    setHasMore(true);
  }, [debounced, open]);

  const loadPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (!open || loadingRef.current) return;
      loadingRef.current = true;
      try {
        const res = await fetchInvoices({
          page: pageNum,
          limit: 20,
          search: debounced || undefined,
        }).unwrap();
        const rows = (Array.isArray(res?.data) ? res.data : []) as InvoiceListItem[];
        const total = Number(res?.meta?.total ?? 0);
        setItems((prev) => {
          const next = replace ? rows : [...prev, ...rows];
          setHasMore(next.length < total);
          return next;
        });
      } catch {
        toast.error("Failed to load transactions");
        setHasMore(false);
      } finally {
        loadingRef.current = false;
      }
    },
    [open, fetchInvoices, debounced]
  );

  useEffect(() => {
    if (!open || view !== "list") return;
    void loadPage(page, page === 1);
  }, [open, view, page, loadPage]);

  useEffect(() => {
    if (!open || view !== "list") return;
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
  }, [open, view, hasMore, isFetching, items.length]);

  useEffect(() => {
    if (selectedId) void fetchInvoice(selectedId);
  }, [selectedId, fetchInvoice]);

  const detail = (detailPayload as { data?: Record<string, any> } | undefined)?.data;

  function handlePrint() {
    if (!detail) return;
    const ok = printPosReceipt(detail, store);
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
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {view === "list" ? (
          <>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
              >
                <ChevronLeft size={16} /> Close
              </button>
            </div>

            <div className="border-b border-gray-100 p-3">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Order"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {isFetching && items.length === 0 ? (
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
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:border-orange-300 hover:bg-orange-50/40"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{inv.invoiceNo}</p>
                        <p className="truncate text-sm text-gray-500">
                          {inv.customerName || "Unknown"}
                          {inv.createdAt ? <> • {formatDateTime(inv.createdAt)}</> : null}
                        </p>
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
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 print:hidden">
              <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
              <button
                type="button"
                onClick={() => {
                  setView("list");
                  setSelectedId(null);
                }}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
              >
                <ChevronLeft size={16} /> Back
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-gray-100 p-4">
              {detailLoading || !detail ? (
                <OrderDetailSkeleton />
              ) : (
                <>
                  <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                    Thermal print preview · 80mm
                  </p>
                  <PosReceipt detail={detail} store={store} mode="screen" />
                </>
              )}
            </div>

            {detail && (
              <div className="border-t border-gray-100 p-4 print:hidden">
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
