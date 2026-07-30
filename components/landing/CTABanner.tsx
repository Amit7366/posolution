"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function CTABanner() {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-100 py-20 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            {t("landing.cta.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500 dark:text-gray-400">
            {t("landing.cta.subtitle")}
          </p>
          <Link
            href="/register"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.03]"
          >
            {t("landing.cta.btn")}
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">{t("landing.cta.btnSub")}</p>
        </motion.div>
      </div>
    </section>
  );
}
