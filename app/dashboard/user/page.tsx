"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

export default function UserPage() {
  const { t } = useTranslation();
  return (
    <div className="p-6 text-gray-900 dark:text-gray-200">
      <h1 className="text-xl font-semibold">{t("dash.adminUser.userTitle")}</h1>
    </div>
  );
}
