"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

const tabs = [
  { labelKey: "auth.tabLogin", href: "/login" },
  { labelKey: "auth.tabRegister", href: "/register" },
] as const;

export default function AuthTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="relative flex gap-8 border-b border-gray-200 dark:border-neutral-800">
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative pb-3 text-sm font-semibold transition ${
              active
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            }`}
          >
            {t(tab.labelKey)}

            {active && (
              <motion.span
                layoutId="authTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
