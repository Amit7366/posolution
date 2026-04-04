"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/app/lib/format";
import { InvoiceBadge } from "@/app/components/invoices/InvoiceBadge";
import { money, numberToWordsUSD } from "@/app/lib/money";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { apiInvoiceToInvoice, toUiInvoiceStatus, type ApiInvoiceDoc } from "@/app/lib/invoice-api";
import { useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from "@/redux/api/baseApi";
import { toast } from "sonner";

function getQueryErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "object" && error !== null && "data" in error) {
    const d = (error as { data?: { message?: string } }).data;
    if (d?.message) return String(d.message);
  }
  return null;
}

export default function InvoiceDetailsPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const { data: payload, isLoading, error } = useGetInvoiceByIdQuery(id, { skip: !id });
  const [updateInvoice, { isLoading: saving }] = useUpdateInvoiceMutation();

  const rawDoc = (payload as { data?: ApiInvoiceDoc } | undefined)?.data;
  const invoice = useMemo(() => (rawDoc ? apiInvoiceToInvoice(rawDoc) : null), [rawDoc]);

  const [apiStatus, setApiStatus] = useState<"unpaid" | "paid" | null>(null);

  useEffect(() => {
    if (rawDoc?.status) setApiStatus(rawDoc.status);
  }, [rawDoc?.status]);

  const discountPct = invoice
    ? invoice.subTotal > 0
      ? Math.round((invoice.discountTotal / invoice.subTotal) * 100)
      : 0
    : 0;

  const displayStatus = rawDoc
    ? toUiInvoiceStatus({ ...rawDoc, status: (apiStatus ?? rawDoc.status) as "paid" | "unpaid" })
    : "Unpaid";

  const applyStatus = async () => {
    if (!id || !apiStatus) return;
    try {
      await updateInvoice({ id, body: { status: apiStatus } }).unwrap();
      toast.success(t("dash.invoiceDetail.statusSaved"));
    } catch (e: unknown) {
      toast.error(getQueryErrorMessage(e) || t("dash.invoiceDetail.statusSaveFail"));
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-[#0b0f14] text-slate-100 grid place-items-center">
        <div className="text-slate-400">Invalid id</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f14] text-slate-100 grid place-items-center">
        <div className="text-slate-400">{t("dash.common.loading")}</div>
      </div>
    );
  }

  const errMsg = getQueryErrorMessage(error);
  if (errMsg || !invoice || !rawDoc) {
    return (
      <div className="min-h-screen bg-[#0b0f14] text-slate-100 grid place-items-center">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-lg font-semibold">{t("dash.invoiceDetail.notFound")}</div>
          {errMsg ? <p className="mt-2 text-sm text-red-300">{errMsg}</p> : null}
          <Link className="mt-3 inline-block text-orange-400 hover:text-orange-300" href="/dashboard/sales/invoices">
            {t("dash.invoiceDetail.back")}
          </Link>
        </div>
      </div>
    );
  }

  const amountDue = Math.round((rawDoc.totalAmount - rawDoc.paid) * 100) / 100;

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t("dash.invoiceDetail.title")}</h1>
          </div>

          <div className="flex items-center gap-2">
            <TopIconButton title={t("dash.common.exportPdf")} onClick={() => window.print()}>
              <PdfIcon />
            </TopIconButton>
            <TopIconButton title={t("dash.common.print")} onClick={() => window.print()}>
              <PrintIcon />
            </TopIconButton>
            <TopIconButton title={t("dash.common.collapse")} onClick={() => {}}>
              <ChevronUpIcon />
            </TopIconButton>

            <Link
              href="/dashboard/sales/invoices"
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-12px_rgba(249,115,22,0.8)] transition hover:bg-orange-400 active:translate-y-[1px]"
            >
              <BackIcon />
              {t("dash.invoiceDetail.backBtn")}
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="flex flex-col gap-6 border-b border-white/10 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
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

            <div className="text-right">
              <div className="text-sm text-slate-400">
                {t("dash.invoiceDetail.invoiceNo")}{" "}
                <span className="font-semibold text-orange-400">#{invoice.invoiceNo}</span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-slate-300">
                <div>
                  {t("dash.invoiceDetail.created")}{" "}
                  <span className="text-slate-100">{formatDate(invoice.createdAt)}</span>
                </div>
                <div>
                  {t("dash.invoiceDetail.due")}{" "}
                  <span className="text-slate-100">{formatDate(invoice.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 border-b border-white/10 px-6 py-6 lg:grid-cols-3">
            <InfoBlock
              title={t("dash.invoiceDetail.from")}
              name={invoice.from.name}
              address={invoice.from.address}
              email={invoice.from.email}
              phone={invoice.from.phone}
              emailPrefix={t("dash.invoiceDetail.email")}
              phonePrefix={t("dash.invoiceDetail.phone")}
            />
            <InfoBlock
              title={t("dash.invoiceDetail.to")}
              name={invoice.to.name}
              address={invoice.to.address}
              email={invoice.to.email}
              phone={invoice.to.phone}
              emailPrefix={t("dash.invoiceDetail.email")}
              phonePrefix={t("dash.invoiceDetail.phone")}
            />

            <div>
              <div className="text-sm font-semibold text-slate-200">{t("dash.invoiceDetail.paymentStatus")}</div>
              <div className="mt-3">
                <InvoiceBadge status={displayStatus} t={t} />
              </div>

              <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {t("dash.invoiceDetail.changeStatus")}
                </div>
                <select
                  className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-500/30"
                  value={apiStatus ?? rawDoc.status}
                  onChange={(e) => setApiStatus(e.target.value as "unpaid" | "paid")}
                >
                  <option value="unpaid">{t("dash.invoices.unpaid")}</option>
                  <option value="paid">{t("dash.invoices.paid")}</option>
                </select>
                <button
                  type="button"
                  disabled={saving || (apiStatus ?? rawDoc.status) === rawDoc.status}
                  onClick={() => void applyStatus()}
                  className="w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("dash.invoiceDetail.statusSave")}
                </button>
                <p className="text-xs text-slate-500">{t("dash.invoiceDetail.paymentUpdateHint")}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-white/10 bg-black/15 px-3 py-2">
                  <div className="text-xs text-slate-500">{t("dash.invoiceDetail.amountPaidLabel")}</div>
                  <div className="font-semibold text-slate-100">{money(rawDoc.paid)}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/15 px-3 py-2">
                  <div className="text-xs text-slate-500">{t("dash.invoiceDetail.amountDueLabel")}</div>
                  <div className="font-semibold text-orange-200">{money(amountDue)}</div>
                </div>
              </div>

              <div className="mt-5 w-28 rounded-lg bg-white p-2">
                <div className="aspect-square w-full bg-[linear-gradient(90deg,#000_1px,transparent_1px),linear-gradient(#000_1px,transparent_1px)] bg-[size:6px_6px]" />
              </div>
            </div>
          </div>

          <div className="px-6 py-5 text-sm text-slate-300">
            {t("dash.invoiceDetail.invoiceFor")}{" "}
            <span className="font-semibold text-slate-100">{invoice.title}</span>
          </div>

          {rawDoc.notes ? (
            <div className="border-b border-white/10 px-6 pb-5 text-sm text-slate-400">
              <span className="font-semibold text-slate-300">{t("dash.invoiceDetail.notesLabel")}: </span>
              {rawDoc.notes}
            </div>
          ) : null}

          <div className="px-6 pb-6">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-white/[0.04] text-left text-sm text-slate-200">
                    <th className="px-5 py-4">{t("dash.invoiceDetail.jobDesc")}</th>
                    <th className="px-5 py-4">{t("dash.invoiceDetail.qty")}</th>
                    <th className="px-5 py-4">{t("dash.invoiceDetail.cost")}</th>
                    <th className="px-5 py-4">{t("dash.invoiceDetail.discount")}</th>
                    <th className="px-5 py-4 text-right">{t("dash.invoiceDetail.total")}</th>
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

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
              <div />
              <div className="space-y-4 border-t border-white/10 pt-6">
                <Row label={t("dash.invoiceDetail.subTotal")} value={money(invoice.subTotal)} />
                <Row
                  label={t("dash.invoiceDetail.discountPercent", { percent: discountPct })}
                  value={money(invoice.discountTotal)}
                />
                <Row
                  label={t("dash.invoiceDetail.vatPercent", { percent: invoice.vatPercent })}
                  value={money(invoice.vatAmount)}
                />
                <div className="flex items-center justify-between pt-2">
                  <div className="text-base font-semibold text-slate-200">{t("dash.invoiceDetail.totalAmount")}</div>
                  <div className="text-xl font-bold text-slate-100">{money(invoice.totalAmount)}</div>
                </div>

                <div className="pt-2 text-xs text-slate-400">
                  {t("dash.invoiceDetail.amountWords")}{" "}
                  <span className="text-slate-200">{numberToWordsUSD(invoice.totalAmount)}</span>
                </div>
              </div>
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
  emailPrefix,
  phonePrefix,
}: {
  title: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  emailPrefix: string;
  phonePrefix: string;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-2 text-lg font-bold text-slate-100">{name || "—"}</div>
      <div className="mt-1 text-sm text-slate-400">{address || "—"}</div>
      <div className="mt-3 space-y-1 text-sm text-slate-300">
        <div>
          {emailPrefix} {email || "—"}
        </div>
        <div>
          {phonePrefix} {phone || "—"}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-slate-300">{label}</div>
      <div className="font-semibold text-slate-100">{value}</div>
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
function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 8V3h10v5" stroke="currentColor" strokeWidth="2" />
      <path d="M7 17h10v4H7v-4Z" stroke="currentColor" strokeWidth="2" />
      <path d="M6 12h12a3 3 0 0 1 3 3v2H3v-2a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function ChevronUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
