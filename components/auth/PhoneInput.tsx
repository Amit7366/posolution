"use client";

import { forwardRef } from "react";
import { cn } from "@/app/lib/cn";
import { toBdLocalPhoneInput } from "@/lib/phone";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  error?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, error, value = "", onChange, onBlur, name, ...props }, ref) => {
    const local = toBdLocalPhoneInput(value);

    return (
      <div
        className={cn(
          "mt-2 flex overflow-hidden rounded-lg border bg-white transition dark:bg-neutral-900",
          "focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/20",
          error
            ? "border-red-400 dark:border-red-500"
            : "border-gray-200 dark:border-neutral-700"
        )}
      >
        <span className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          +880
        </span>
        <input
          ref={ref}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={local}
          onBlur={onBlur}
          onChange={(e) => {
            const next = toBdLocalPhoneInput(e.target.value);
            onChange?.(next ? `+880${next}` : "");
          }}
          className={cn(
            "w-full bg-transparent px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-neutral-500",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
