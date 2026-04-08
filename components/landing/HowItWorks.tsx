"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { UserPlus, Package, Zap, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import Link from "next/link";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: UserPlus,
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/30",
    num: 1,
  },
  {
    icon: Package,
    gradient: "from-indigo-500 to-violet-600",
    shadow: "shadow-indigo-500/30",
    num: 2,
  },
  {
    icon: Zap,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-purple-500/30",
    num: 3,
  },
];

export default function HowItWorks() {
  const { t } = useTranslation();
  const lineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Only the line draw stays as GSAP
      gsap.from(lineRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 70%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-28 dark:bg-[#060612]">
      {/* Bg glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/40 blur-[120px] dark:bg-indigo-900/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            {t("landing.howItWorks.badge")}
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {t("landing.howItWorks.subtitle")}
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={stepsRef} className="relative mt-20">
          {/* Connector line */}
          <div
            ref={lineRef}
            className="absolute left-[16.67%] right-[16.67%] top-14 hidden h-0.5 bg-linear-to-r from-blue-300 via-indigo-300 to-purple-300 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 md:block"
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {steps.map(({ icon: Icon, gradient, shadow, num }, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
              >
                {/* Number + Icon */}
                <div className="relative mb-8">
                  <div
                    className={`relative z-10 flex h-28 w-28 items-center justify-center rounded-3xl bg-linear-to-br ${gradient} shadow-2xl ${shadow}`}
                  >
                    <Icon size={40} className="text-white" />
                  </div>
                  {/* Step number bubble */}
                  <div className="absolute -right-2 -top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-xs font-black text-white dark:border-gray-900 dark:bg-white dark:text-gray-900">
                    {num}
                  </div>
                </div>

                {/* Step label */}
                <span className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t(`landing.howItWorks.step${num}`)}
                </span>
                <h3 className="mb-3 text-xl font-black text-gray-900 dark:text-white">
                  {t(`landing.howItWorks.step${num}Title`)}
                </h3>
                <p className="max-w-xs text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  {t(`landing.howItWorks.step${num}Desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            {t("landing.hero.cta")}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
