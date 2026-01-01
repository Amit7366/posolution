"use client";

import { cn } from "@/app/lib/cn";
import React, { useEffect, useRef } from "react";

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
  className,
}: {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: () => void;
  ariaLabel?: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <label className={cn("inline-flex cursor-pointer items-center", className)}>
      <input
        ref={ref}
        type="checkbox"
        aria-label={ariaLabel}
        checked={!!checked}
        onChange={onChange}
        className="h-5 w-5 appearance-none rounded-md border border-white/15 bg-white/[0.02] outline-none ring-orange-500/30 transition checked:border-orange-500/40 checked:bg-orange-500/20 focus:ring-4"
      />
      <span className="pointer-events-none -ml-5 grid h-5 w-5 place-items-center text-white">
        {(checked || indeterminate) && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-90">
            {indeterminate ? (
              <path d="M6 12h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        )}
      </span>
    </label>
  );
}
