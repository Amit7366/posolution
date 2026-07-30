"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = Array.from({ length: 10 }, (_, n) => ({
    q: t(`landing.faq.q${n + 1}`),
    a: t(`landing.faq.a${n + 1}`),
  }));

  return (
    <section className="bg-white py-20 dark:bg-[#060612]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            {t("landing.faq.title")}
          </h2>
          <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
            {t("landing.faq.subtitle")}
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                openIndex === i
                  ? "border-blue-200/80 bg-gray-50 dark:border-blue-800/60 dark:bg-gray-900"
                  : "border-gray-200/60 bg-white dark:border-gray-800/50 dark:bg-gray-900/60"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                  {q}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                    openIndex === i
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {openIndex === i ? <Minus size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                  >
                    <div className="border-t border-gray-200 px-6 pb-6 pt-4 dark:border-gray-800">
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
