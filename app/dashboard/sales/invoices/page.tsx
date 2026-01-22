"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Invoice, InvoiceStatus } from "@/app/types/invoice";
import { invoicesSeed } from "@/app/lib/invoice-data";
import { formatDate } from "@/app/lib/format";
import { money } from "@/app/lib/money";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import { cn } from "@/app/lib/cn";


export default function InvoicesPage() {
  const [rows] = useState<Invoice[]>(invoicesSeed);
//   console.log(rows)

  const [q, setQ] = useState("");
  const [customer, setCustomer] = useState<string>("All");
  const [status, setStatus] = useState<InvoiceStatus | "All">("All");
  const [sort, setSort] = useState<"Last7" | "All">("All");


  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const customers = useMemo(() => {
    const list = Array.from(new Set(rows.map((r) => r.customer.name)));
    return list;
  }, [rows]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const last7Cutoff = new Date();
    last7Cutoff.setDate(last7Cutoff.getDate() - 7);

    return rows.filter((r) => {
      if (customer !== "All" && r.customer.name !== customer) return false;
      if (status !== "All" && r.status !== status) return false;

      if (sort === "Last7") {
        const d = new Date(r.createdAt);
        if (Number.isFinite(d.getTime()) && d < last7Cutoff) return false;
      }

      if (!query) return true;

      const blob = [
        r.invoiceNo,
        r.customer.name,
        r.dueDate,
        String(r.amount),
        String(r.paid),
        String(r.amountDue),
        r.status,
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(query);
    });
  }, [rows, q, customer, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, rowsPerPage, safePage]);

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>
            <p className="mt-1 text-sm text-slate-400">Manage your stock invoices</p>
          </div>

          <div className="flex items-center gap-2">
            <TopIconButton title="Export PDF" onClick={() => window.print()}><PdfIcon /></TopIconButton>
            <TopIconButton title="Export XLS" onClick={() => alert("Hook XLS export")}> <XlsIcon /> </TopIconButton>
            <TopIconButton title="Refresh" onClick={() => { setQ(""); setCustomer("All"); setStatus("All"); setSort("Last7"); setPage(1); }}><RefreshIcon /></TopIconButton>
            <TopIconButton title="Collapse" onClick={() => alert("Optional collapse")}><ChevronUpIcon /></TopIconButton>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div className="relative w-full max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search"
                className="w-full rounded-xl border border-white/10 bg-[#0b0f14] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={customer}
                onChange={(v) => { setCustomer(v); setPage(1); }}
                options={[{ value: "All", label: "Customer" }, ...customers.map((c) => ({ value: c, label: c }))]}
              />
              <FilterSelect
                value={status}
                onChange={(v) => { setStatus(v as any); setPage(1); }}
                options={[
                  { value: "All", label: "Status" },
                  { value: "Paid", label: "Paid" },
                  { value: "Unpaid", label: "Unpaid" },
                  { value: "Overdue", label: "Overdue" },
                ]}
              />
              <FilterSelect
                value={sort}
                onChange={(v) => { setSort(v as any); setPage(1); }}
                options={[
                  { value: "Last7", label: "Sort By : Last 7 Days" },
                  { value: "All", label: "Sort By : All" },
                ]}
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="text-left text-sm text-slate-300">
                  <th className="w-12 px-5 py-4" />
                  <th className="px-5 py-4 font-semibold text-slate-100">Invoice No</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">Customer</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">Due Date</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">Amount</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">Paid</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">Amount Due</th>
                  <th className="px-5 py-4 font-semibold text-slate-100">Status</th>
                  <th className="w-40 px-5 py-4 text-right font-semibold text-slate-100"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {paged.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="h-5 w-5 rounded-md border border-white/15 bg-black/20" />
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-100">{r.invoiceNo}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.customer.name} url={r.customer.avatarUrl} />
                        <div className="text-sm font-semibold text-slate-100">{r.customer.name}</div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-300">{formatDate(r.dueDate)}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{money(r.amount)}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{money(r.paid)}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{money(r.amountDue)}</td>

                    <td className="px-5 py-4">
                      <InvoiceBadge status={r.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/sales/invoices/${r.id}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/20 text-white transition hover:bg-white/[0.06] active:translate-y-[1px]"
                          title="View"
                        >
                          <EyeIcon />
                        </Link>

                        <button
                          type="button"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-black/20 text-white transition hover:bg-white/[0.06] active:translate-y-[1px]"
                          title="Delete"
                          onClick={() => alert("Hook delete modal")}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paged.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center text-sm text-slate-400">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Row Per Page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(1); }}
                className="rounded-lg border border-white/10 bg-[#0b0f14] px-2 py-1.5 text-slate-200 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>Entries</span>
            </div>

            <div className="flex items-center gap-2">
              <PageNavButton disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeftIcon />
              </PageNavButton>

              <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(249,115,22,0.9)]">
                {safePage}
              </span>

              <PageNavButton disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRightIcon />
              </PageNavButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- small components --- */

function Avatar({ name, url }: { name: string; url?: string }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return (
    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white/10 text-xs font-bold text-slate-100 ring-1 ring-white/10">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: any;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-white/10 bg-[#0b0f14] px-3 pr-9 text-sm font-semibold text-slate-100 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        <ChevronDownIcon />
      </span>
    </div>
  );
}

function TopIconButton({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
    >
      {children}
    </button>
  );
}
function PageNavButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.02] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-white/[0.02] active:translate-y-0"
      )}
    >
      {children}
    </button>
  );
}

/* icons */
function SearchIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2"/><path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);}
function ChevronDownIcon(){return(<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function ChevronUpIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function ChevronLeftIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function ChevronRightIcon(){return(<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function EyeIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2"/></svg>);}
function TrashIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 6l1 15h8l1-15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);}
function PdfIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/><path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2"/></svg>);}
function XlsIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/><path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2"/></svg>);}
function RefreshIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
