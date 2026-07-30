"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function NumberedFeatures() {
  const { t } = useTranslation();

  const steps = [
    { num: t("landing.howItWorks.step1"), title: t("landing.howItWorks.step1Title"), desc: t("landing.howItWorks.step1Desc") },
    { num: t("landing.howItWorks.step2"), title: t("landing.howItWorks.step2Title"), desc: t("landing.howItWorks.step2Desc") },
    { num: t("landing.howItWorks.step3"), title: t("landing.howItWorks.step3Title"), desc: t("landing.howItWorks.step3Desc") },
    { num: t("landing.numbered.step4"), title: t("landing.numbered.step4Title"), desc: t("landing.numbered.step4Desc") },
    { num: t("landing.numbered.step5"), title: t("landing.numbered.step5Title"), desc: t("landing.numbered.step5Desc") },
    { num: t("landing.numbered.step6"), title: t("landing.numbered.step6Title"), desc: t("landing.numbered.step6Desc") },
  ];

  return (
    <section className="bg-[#fafafa] py-20 dark:bg-[#070710]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              {t("landing.numbered.title")}
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {steps.map(({ num, title, desc }, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">{num}</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80"
              alt="Mobile POS payment"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
