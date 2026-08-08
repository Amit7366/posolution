"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, RefreshCcw, Search, Users } from "lucide-react";
import { useGetCustomersQuery } from "@/redux/api/baseApi";

type CustomerRow = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
};

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("search");
      if (q) {
        setSearchInput(q);
        setSearch(q.trim());
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching, refetch } = useGetCustomersQuery({
    page,
    limit: perPage,
    search: search || undefined,
    status: status || undefined,
  });

  const rows: CustomerRow[] = useMemo(() => {
    const raw = (data as { data?: CustomerRow[] } | undefined)?.data;
    return Array.isArray(raw) ? raw : [];
  }, [data]);

  const meta = (data as { meta?: { page: number; limit: number; total: number } } | undefined)
    ?.meta;
  const total = meta?.total ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(total / (meta?.limit || perPage)));

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
            <Users className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Customers</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage customers and view purchase history
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <RefreshCcw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, phone, email…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4" colSpan={5}>
                      <div className="h-10 rounded bg-gray-100 dark:bg-gray-800" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No customers found
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c._id} className="hover:bg-orange-50/40 dark:hover:bg-orange-950/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                          {initials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900 dark:text-white">
                            {c.name}
                          </p>
                          {c.address ? (
                            <p className="truncate text-xs text-gray-400">{c.address}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          c.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {c.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/customers/${c._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
                      >
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>{total} total</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-600"
            >
              Prev
            </button>
            <span className="px-2 text-sm text-gray-600 dark:text-gray-300">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
