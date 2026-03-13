"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 hover:border-blue-500 hover:text-white transition"
    >
      <span
        className={
          language === "en" ? "font-semibold text-blue-400" : "text-neutral-400"
        }
      >
        EN
      </span>
      <span className="text-neutral-500">/</span>
      <span
        className={
          language === "bn" ? "font-semibold text-blue-400" : "text-neutral-400"
        }
      >
        বাংলা
      </span>
    </button>
  );
}

