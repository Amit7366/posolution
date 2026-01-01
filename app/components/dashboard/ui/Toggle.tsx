"use client";

import { cn } from "@/app/lib/cn";
import React from "react";

export function Toggle({
  value,
  onChange,
  ariaLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "relative h-6 w-11 rounded-full border border-white/10 transition",
        value ? "bg-emerald-500/40" : "bg-white/10"
      )}
      aria-label={ariaLabel ?? "Toggle"}
      title={ariaLabel ?? "Toggle"}
    >
      <span
        className={cn(
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition",
          value ? "left-5" : "left-1"
        )}
      />
    </button>
  );
}
