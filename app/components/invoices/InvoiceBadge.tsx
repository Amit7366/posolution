"use client";

import { cn } from "@/app/lib/cn";
import { InvoiceStatus } from "@/app/types/invoice";
import React from "react";

export function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  const cls =
    status === "Paid"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Unpaid"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

  const dot =
    status === "Paid" ? "bg-emerald-500" : status === "Unpaid" ? "bg-rose-500" : "bg-amber-500";

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-semibold", cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {status}
    </span>
  );
}
