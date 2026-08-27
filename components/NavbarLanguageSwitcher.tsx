"use client";

import { useLanguage } from "./LanguageProvider";
import { cn } from "@/lib/utils";

type Variant = "navbar" | "compact";

export default function NavbarLanguageSwitcher({ variant = "navbar" }: { variant?: Variant }) {
  const { language, setLanguage } = useLanguage();

  const isCompact = variant === "compact";

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex rounded-xl border p-0.5",
        isCompact
          ? "border-neutral-600 bg-neutral-900/80"
          : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
      )}
    >
      <button
        type="button"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
          isCompact ? "min-w-[2.25rem]" : "min-w-[2.5rem]",
          language === "en"
            ? isCompact
              ? "bg-brand-blue text-white"
              : "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
            : isCompact
              ? "text-neutral-400 hover:text-white"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        )}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={language === "bn"}
        onClick={() => setLanguage("bn")}
        className={cn(
          "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
          isCompact ? "min-w-[2.25rem]" : "min-w-[2.5rem]",
          language === "bn"
            ? isCompact
              ? "bg-brand-blue text-white"
              : "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
            : isCompact
              ? "text-neutral-400 hover:text-white"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        )}
      >
        বাংলা
      </button>
    </div>
  );
}
