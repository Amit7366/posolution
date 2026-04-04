"use client";

import { Bell, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NavbarLanguageSwitcher from "@/components/NavbarLanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Topbar() {
  const { t } = useTranslation();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-3">
        <Menu className="cursor-pointer text-gray-700 md:hidden dark:text-gray-200" />
        <h1 className="text-lg font-semibold">{t("topbar.title")}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Bell className="cursor-pointer text-gray-600 dark:text-gray-300" />
        <NavbarLanguageSwitcher />
        <ThemeToggle variant="icon" />
      </div>
    </header>
  );
}
