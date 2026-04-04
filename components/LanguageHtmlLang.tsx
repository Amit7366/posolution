"use client";

import { useEffect } from "react";
import { useLanguage } from "./LanguageProvider";

/** Keeps <html lang> in sync with the selected locale (a11y + fonts). */
export function LanguageHtmlLang({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  return <>{children}</>;
}
