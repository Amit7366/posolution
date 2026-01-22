"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { invoicesSeed } from "@/app/lib/invoice-data";
import { formatDate } from "@/app/lib/format";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import { money, numberToWordsUSD } from "@/app/lib/money";


export default function InvoiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const invoice = useMemo(() => invoicesSeed.find((x) => x.id === params.id) ?? null, [params.id]);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#0b0f14] text-slate-100 grid place-items-center">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-lg font-semibold">Invoice not found</div>
          <Link className="mt-3 inline-block text-orange-400 hover:text-orange-300" href="/invoices">
            ← Back to invoices
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        {/* top header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Invoice Details</h1>
          </div>

          <div className="flex items-center gap-2">
            <TopIconButton title="Export PDF" onClick={() => window.print()}><PdfIcon /></TopIconButton>
            <TopIconButton title="Print" onClick={() => window.print()}><PrintIcon /></TopIconButton>
            <TopIconButton title="Collapse" onClick={() => {}}><ChevronUpIcon /></TopIconButton>

            <Link
              href="/invoices"
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] transition hover:bg-orange-400 active:translate-y-[1px]"
            >
              <BackIcon />
              Back to Invoices
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          {/* top row */}
          <div className="flex flex-col gap-6 border-b border-white/10 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
            {/* logo / address */}
            <div className="min-w-[280px]">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                  <span className="text-lg font-black text-white">D</span>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">
                    Dreams <span className="text-xs font-semibold text-orange-400">POS</span>
                  </div>
                  <div className="text-sm text-slate-400">3099 Kennedy Court Framingham, MA 01702</div>
                </div>
              </div>
            </div>

            {/* invoice meta right */}
            <div className="text-right">
              <div className="text-sm text-slate-400">Invoice No <span className="text-orange-400 font-semibold">#{invoice.invoiceNo}</span></div>
              <div className="mt-2 text-sm text-slate-300">
                <div>Created Date : <span className="text-slate-100">{formatDate(invoice.createdAt)}</span></div>
                <div>Due Date : <span className="text-slate-100">{formatDate(invoice.dueDate)}</span></div>
              </div>
            </div>
          </div>

          {/* From / To / Payment */}
          <div className="grid gap-8 border-b border-white/10 px-6 py-6 lg:grid-cols-3">
            <InfoBlock title="From" name={invoice.from.name} address={invoice.from.address} email={invoice.from.email} phone={invoice.from.phone} />
            <InfoBlock title="To" name={invoice.to.name} address={invoice.to.address} email={invoice.to.email} phone={invoice.to.phone} />

            <div>
              <div className="text-sm font-semibold text-slate-200">Payment Status</div>
              <div className="mt-3">
                <InvoiceBadge status={invoice.status} />
              </div>

              <div className="mt-5 w-28 rounded-lg bg-white p-2">
                {/* QR placeholder (replace with real QR component later) */}
                <div className="aspect-square w-full bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(#000_1px,transparent_1px)] bg-[size:6px_6px]" />
              </div>
            </div>
          </div>

          {/* title */}
          <div className="px-6 py-5 text-sm text-slate-300">
            Invoice For : <span className="text-slate-100 font-semibold">{invoice.title}</span>
          </div>

          {/* Items table */}
          <div className="px-6 pb-6">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-white/[0.04] text-left text-sm text-slate-200">
                    <th className="px-5 py-4">Job Description</th>
                    <th className="px-5 py-4">Qty</th>
                    <th className="px-5 py-4">Cost</th>
                    <th className="px-5 py-4">Discount</th>
                    <th className="px-5 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {invoice.items.map((it) => (
                    <tr key={it.id} className="text-sm">
                      <td className="px-5 py-4 font-semibold text-slate-100">{it.description}</td>
                      <td className="px-5 py-4 text-slate-300">{it.qty}</td>
                      <td className="px-5 py-4 text-slate-300">{money(it.cost)}</td>
                      <td className="px-5 py-4 text-slate-300">{money(it.discount)}</td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-100">{money(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* totals right */}
            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div />
              <div className="space-y-4 border-t border-white/10 pt-6">
                <Row label="Sub Total" value={money(invoice.subTotal)} />
                <Row label={`Discount (0%)`} value={money(invoice.discountTotal)} />
                <Row label={`VAT (${invoice.vatPercent}%)`} value={money(invoice.vatAmount)} />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-base font-semibold text-slate-200">Total Amount</div>
                  <div className="text-xl font-bold text-slate-100">{money(invoice.totalAmount)}</div>
                </div>

                <div className="pt-2 text-xs text-slate-400">
                  Amount in Words: <span className="text-slate-200">{numberToWordsUSD(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
              {/* optional footer line like your layout */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  name,
  address,
  email,
  phone,
}: {
  title: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-2 text-lg font-bold text-slate-100">{name}</div>
      <div className="mt-1 text-sm text-slate-400">{address}</div>
      <div className="mt-3 space-y-1 text-sm text-slate-300">
        <div>Email : {email}</div>
        <div>Phone : {phone}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-slate-300">{label}</div>
      <div className="text-slate-100 font-semibold">{value}</div>
    </div>
  );
}

/* icons */
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
function PdfIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/><path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2"/></svg>);}
function PrintIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 8V3h10v5" stroke="currentColor" strokeWidth="2"/><path d="M7 17h10v4H7v-4Z" stroke="currentColor" strokeWidth="2"/><path d="M6 12h12a3 3 0 0 1 3 3v2H3v-2a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="2"/></svg>);}
function ChevronUpIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function BackIcon(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
