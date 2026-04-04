"use client";

import { cn } from "@/app/lib/cn";
import { InvoiceStatus } from "@/app/types/invoice";
import React from "react";

type TFn = (key: string, vars?: Record<string, string | number>) => string;

export function InvoiceBadge({ status, t }: { status: InvoiceStatus; t?: TFn }) {
  const cls =
    status === "Paid"
      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
      : status === "Unpaid"
        ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25"
        : "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25";

  const dot =
    status === "Paid" ? "bg-emerald-400" : status === "Unpaid" ? "bg-rose-400" : "bg-amber-400";

  const label =
    t == null
      ? status
      : status === "Paid"
        ? t("dash.invoices.paid")
        : status === "Unpaid"
          ? t("dash.invoices.unpaid")
          : t("dash.invoices.overdue");

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold", cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
