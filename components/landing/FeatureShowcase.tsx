"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BarChart3, Store, Users, Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const SHOWCASE_ICONS = [BarChart3, Store, Users, Shield];

export default function FeatureShowcase() {
  const { t } = useTranslation();

  const items = [5, 6, 7, 8].map((n, i) => ({
    icon: SHOWCASE_ICONS[i],
    title: t(`landing.features.f${n}Title`),
    desc: t(`landing.features.f${n}Desc`),
  }));

  return (
    <section className="bg-white py-20 dark:bg-[#060612]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
              alt="POS checkout"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              {t("landing.showcase.title")}
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200/60 bg-gray-50/50 p-4 dark:border-gray-800/50 dark:bg-gray-900/40"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
                    <Icon size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
