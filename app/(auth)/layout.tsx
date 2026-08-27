"use client";

import AuthMarketingPanel from "@/components/auth/AuthMarketingPanel";
import AuthFormShell from "@/components/auth/AuthFormShell";
import BrandLogo from "@/components/BrandLogo";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh w-full bg-white transition-colors duration-300 dark:bg-neutral-950">
      {/* Mobile brand strip */}
      <div className="fixed inset-x-0 top-0 z-20 border-b border-white/20 bg-brand-blue dark:border-brand-cyan/20 dark:bg-brand-navy lg:hidden">
        <div className="flex h-14 items-center px-4">
          <BrandLogo size="sm" onDark wordmark={t("auth.marketing.brand")} />
        </div>
      </div>

      <aside className="hidden w-[46%] max-w-xl shrink-0 lg:block xl:w-[48%] xl:max-w-none">
        <div className="sticky top-0 h-dvh">
          <AuthMarketingPanel />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-1 flex-col pt-14 lg:pt-0">
        <AuthFormShell>{children}</AuthFormShell>
      </div>
    </div>
  );
}
