"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="px-6 py-24 md:px-16">
      <section className="mx-auto max-w-5xl text-center">
        <h1 className="bg-linear-to-r from-brand-blue via-brand-cyan to-brand-green bg-clip-text text-5xl font-bold leading-tight text-transparent md:text-7xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">{t("home.heroSubtitle")}</p>
        <div className="mt-10 flex justify-center gap-6">
          <Link href="/register">
            <button
              type="button"
              className="rounded-2xl bg-brand-blue px-8 py-4 text-lg text-white shadow-xl transition-all hover:bg-brand-blue-bright hover:shadow-brand-cyan/40"
            >
              {t("home.getStarted")}
            </button>
          </Link>
          <Link href="#features">
            <button
              type="button"
              className="rounded-2xl border border-slate-300 bg-transparent px-8 py-4 text-lg text-slate-900 transition-colors duration-300 dark:border-yellow-400 dark:bg-yellow-400 dark:text-black"
            >
              {t("home.learnMore")}
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
