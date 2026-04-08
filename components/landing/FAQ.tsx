"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Link from "next/link";

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: t(`landing.faq.q${n}`),
    a: t(`landing.faq.a${n}`),
  }));

  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-28 dark:bg-[#070710]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012] dark:opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#64748b 1px,transparent 1px),linear-gradient(90deg,#64748b 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            {t("landing.faq.badge")}
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {t("landing.faq.title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {t("landing.faq.subtitle")}
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
              className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                openIndex === i
                  ? "border-blue-200/80 bg-white shadow-md dark:border-blue-800/60 dark:bg-gray-900"
                  : "border-gray-200/60 bg-white shadow-sm dark:border-gray-800/50 dark:bg-gray-900/60"
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
                    <div className="border-t border-gray-100 px-6 pb-6 pt-4 dark:border-gray-800">
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Support CTA */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-3 rounded-2xl border border-gray-200/60 bg-white p-8 text-center shadow-sm dark:border-gray-800/50 dark:bg-gray-900/60"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <MessageCircle size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">Still have questions?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Our support team is available 24/7 to help you get started.
          </p>
          <Link
            href="/register"
            className="mt-1 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Talk to Support
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
