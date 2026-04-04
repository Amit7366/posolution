"use client";

import AuthTabs from "@/components/auth/AuthTabs";
import ThemeToggle from "@/components/ThemeToggle";
import NavbarLanguageSwitcher from "@/components/NavbarLanguageSwitcher";
import { StepBack } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 transition-colors duration-500 bg-white dark:bg-neutral-950">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-10 transition-colors duration-500">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {t("auth.welcomeBack")}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-neutral-400">{t("auth.subtitle")}</p>

            <Link
              href="/"
              className="mt-2 flex items-center gap-2 text-sm text-slate-900 hover:underline dark:text-amber-300"
            >
              <StepBack size={16} /> <span>{t("auth.backHome")}</span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <NavbarLanguageSwitcher variant="compact" />
            <ThemeToggle />
          </div>
        </div>

        {/* Tabs */}
        <AuthTabs />

        {/* Form */}
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
