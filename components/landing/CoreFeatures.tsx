"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Package, ScanLine, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const FEATURE_ICONS = [ShoppingCart, Package, ScanLine, FileText];

export default function CoreFeatures() {
  const { t } = useTranslation();

  const features = [1, 2, 3, 4].map((n, i) => ({
    icon: FEATURE_ICONS[i],
    title: t(`landing.features.f${n}Title`),
    desc: t(`landing.features.f${n}Desc`),
  }));

  return (
    <section id="features" className="bg-brand-mist py-20 dark:bg-brand-navy">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            {t("landing.features.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 dark:text-gray-400">
            {t("landing.features.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800/50 dark:bg-gray-900/60"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-mist dark:bg-brand-blue/20">
                <Icon size={22} className="text-brand-blue dark:text-brand-cyan" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
