"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const avatarGradients = [
  "from-brand-blue to-brand-cyan",
  "from-brand-cyan to-brand-green",
  "from-brand-emerald to-brand-teal",
];

const cardAccents = [
  "hover:border-brand-blue/50 dark:hover:border-brand-cyan/50",
  "hover:border-brand-cyan/50 dark:hover:border-brand-green/50",
  "hover:border-brand-emerald/50 dark:hover:border-brand-teal/50",
];

const industries = ["Grocery & Retail", "Fashion & Boutique", "Wholesale Distribution"];

export default function Testimonials() {
  const { t } = useTranslation();

  const testimonials = [1, 2, 3].map((n, i) => ({
    name: t(`landing.testimonials.t${n}Name`),
    role: t(`landing.testimonials.t${n}Role`),
    text: t(`landing.testimonials.t${n}Text`),
    industry: industries[i],
    initials: t(`landing.testimonials.t${n}Name`)
      .split(" ")
      .map((w: string) => w[0])
      .slice(0, 2)
      .join(""),
  }));

  return (
    <section className="relative overflow-hidden bg-white py-28 dark:bg-brand-navy">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-80 w-[800px] -translate-x-1/2 rounded-full bg-brand-cyan/15 blur-[100px] dark:bg-brand-green/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-4 py-1.5 text-sm font-semibold text-brand-leaf dark:border-brand-green/40 dark:bg-brand-green/15 dark:text-brand-lime">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
            {t("landing.testimonials.badge")}
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {t("landing.testimonials.title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {t("landing.testimonials.subtitle")}
          </p>
          {/* Stars summary */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-brand-green" fill="currentColor" />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">4.9/5</span>
            <span className="text-sm text-gray-400">from 2,400+ reviews</span>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map(({ name, role, text, industry, initials }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:border-gray-800/60 dark:bg-gray-900/60 ${cardAccents[i]}`}
            >
              {/* Industry tag */}
              <span className="mb-5 inline-block self-start rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {industry}
              </span>

              {/* Quote icon */}
              <Quote size={28} className="mb-3 text-gray-200 dark:text-gray-700" fill="currentColor" />

              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={13} className="text-brand-green" fill="currentColor" />
                ))}
              </div>

              {/* Text */}
              <p className="flex-1 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                &ldquo;{text}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-8 flex items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${avatarGradients[i]} text-sm font-bold text-white`}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logos row (mock) */}
        <div className="mt-16 border-t border-gray-100 pt-12 dark:border-gray-800">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Used by businesses across Bangladesh
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 dark:opacity-30">
            {["Dhaka Mart", "Fashion Hub", "PharmaCare", "AgroFresh", "QuickBite", "TechZone"].map(
              (name, i) => (
                <div key={i} className="text-sm font-black tracking-tight text-gray-500 dark:text-gray-400">
                  {name}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
