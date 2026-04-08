"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("landing.pricing.plan1Name"),
      price: t("landing.pricing.plan1Price"),
      period: t("landing.pricing.plan1Period"),
      desc: t("landing.pricing.plan1Desc"),
      features: [1, 2, 3, 4].map((n) => t(`landing.pricing.plan1f${n}`)),
      cta: t("landing.pricing.ctaFree"),
      href: "/register",
      popular: false,
    },
    {
      name: t("landing.pricing.plan2Name"),
      price: t("landing.pricing.plan2Price"),
      period: t("landing.pricing.plan2Period"),
      desc: t("landing.pricing.plan2Desc"),
      features: [1, 2, 3, 4, 5, 6].map((n) => t(`landing.pricing.plan2f${n}`)),
      cta: t("landing.pricing.cta"),
      href: "/register",
      popular: true,
    },
    {
      name: t("landing.pricing.plan3Name"),
      price: t("landing.pricing.plan3Price"),
      period: t("landing.pricing.plan3Period"),
      desc: t("landing.pricing.plan3Desc"),
      features: [1, 2, 3, 4, 5, 6].map((n) => t(`landing.pricing.plan3f${n}`)),
      cta: t("landing.pricing.ctaEnterprise"),
      href: "/register",
      popular: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-[#fafafa] py-28 dark:bg-[#070710]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.012] dark:opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#64748b 1px,transparent 1px),linear-gradient(90deg,#64748b 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-200/60 bg-purple-50 px-4 py-1.5 text-sm font-semibold text-purple-700 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
            {t("landing.pricing.badge")}
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {t("landing.pricing.title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {t("landing.pricing.subtitle")}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              className={`relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 p-px shadow-2xl shadow-indigo-500/40"
                  : "border border-gray-200/70 bg-white shadow-sm hover:shadow-lg dark:border-gray-800/60 dark:bg-gray-900/70"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-px left-0 right-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
              )}

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/40">
                    <Zap size={11} fill="currentColor" />
                    {t("landing.pricing.popular")}
                  </span>
                </div>
              )}

              <div
                className={`flex h-full flex-col rounded-2xl p-8 ${
                  plan.popular ? "bg-white dark:bg-[#0d0d1e]" : ""
                }`}
              >
                {/* Plan header */}
                <div className="mb-8 border-b border-gray-100 pb-8 dark:border-gray-800">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span
                      className={`text-5xl font-black ${
                        plan.popular
                          ? "bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3.5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.popular
                            ? "bg-blue-100 dark:bg-blue-900/50"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <Check
                          size={11}
                          strokeWidth={3}
                          className={
                            plan.popular
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        />
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`group flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${
                    plan.popular
                      ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02]"
                      : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise note */}
        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          All plans include SSL, automatic backups, and free onboarding support.
        </p>
      </div>
    </section>
  );
}
