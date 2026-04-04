"use client";

import { useCallback, useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { translate, type AppLocale } from "./dictionaries";

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(language, key, vars),
    [language]
  );

  return useMemo(
    () => ({
      t,
      language: language as AppLocale,
      setLanguage,
      toggleLanguage,
    }),
    [t, language, setLanguage, toggleLanguage]
  );
}
