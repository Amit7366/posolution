"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import AuthMarketingPanel from "@/components/auth/AuthMarketingPanel";
import AuthFormShell from "@/components/auth/AuthFormShell";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-dvh w-full bg-white transition-colors duration-300 dark:bg-neutral-950">
      {/* Mobile brand strip */}
      <div className="fixed inset-x-0 top-0 z-20 border-b border-blue-500/30 bg-blue-600 dark:border-blue-400/20 dark:bg-blue-950 lg:hidden">
        <div className="flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10">
              <ShoppingCart size={14} />
            </span>
            <span className="text-base font-semibold tracking-tight">
              {t("auth.marketing.brand")}
            </span>
          </Link>
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
