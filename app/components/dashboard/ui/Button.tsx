"use client";

import { cn } from "@/app/lib/cn";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ className, variant = "secondary", size = "md", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60";
  const sizes = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2.5 text-sm";

  const variants =
    variant === "primary"
      ? "bg-orange-500 text-white shadow-[0_12px_30px_-16px_rgba(249,115,22,0.95)] hover:bg-orange-400"
      : variant === "danger"
      ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/25"
      : variant === "ghost"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06]"
      : "bg-slate-800 text-white hover:brightness-110 dark:bg-[#0f2f52]";

  return <button className={cn(base, sizes, variants, className)} {...props} />;
}
