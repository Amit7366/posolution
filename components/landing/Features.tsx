"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Package,
  QrCode,
  FileText,
  BarChart3,
  Store,
  Users,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const features = [
  {
    Icon: Zap,
    gradient: "from-brand-blue to-brand-cyan",
    bg: "bg-brand-mist dark:bg-brand-blue/20",
    border: "hover:border-brand-cyan/60 dark:hover:border-brand-cyan/40",
    glow: "group-hover:shadow-brand-blue/20",
    key: 1,
  },
  {
    Icon: Package,
    gradient: "from-brand-emerald to-brand-teal",
    bg: "bg-brand-green/10 dark:bg-brand-emerald/20",
    border: "hover:border-brand-emerald/60 dark:hover:border-brand-teal/40",
    glow: "group-hover:shadow-brand-emerald/20",
    key: 2,
  },
  {
    Icon: QrCode,
    gradient: "from-brand-cyan to-brand-teal",
    bg: "bg-brand-cyan/10 dark:bg-brand-cyan/20",
    border: "hover:border-brand-cyan/60 dark:hover:border-brand-teal/40",
    glow: "group-hover:shadow-brand-cyan/20",
    key: 3,
  },
  {
    Icon: FileText,
    gradient: "from-brand-green to-brand-lime",
    bg: "bg-brand-green/10 dark:bg-brand-green/20",
    border: "hover:border-brand-green/60 dark:hover:border-brand-lime/40",
    glow: "group-hover:shadow-brand-green/20",
    key: 4,
  },
  {
    Icon: BarChart3,
    gradient: "from-brand-cyan to-brand-blue",
    bg: "bg-brand-mist dark:bg-brand-cyan/20",
    border: "hover:border-brand-cyan/60 dark:hover:border-brand-blue/40",
    glow: "group-hover:shadow-brand-cyan/20",
    key: 5,
  },
  {
    Icon: Store,
    gradient: "from-brand-teal to-brand-leaf",
    bg: "bg-brand-teal/10 dark:bg-brand-leaf/30",
    border: "hover:border-brand-teal/60 dark:hover:border-brand-leaf/40",
    glow: "group-hover:shadow-brand-teal/20",
    key: 6,
  },
  {
    Icon: Users,
    gradient: "from-brand-blue-deep to-brand-blue",
    bg: "bg-brand-mist dark:bg-brand-blue/20",
    border: "hover:border-brand-blue/60 dark:hover:border-brand-cyan/40",
    glow: "group-hover:shadow-brand-blue/20",
    key: 7,
  },
  {
    Icon: ShieldCheck,
    gradient: "from-brand-leaf to-brand-teal",
    bg: "bg-brand-leaf/10 dark:bg-brand-leaf/30",
    border: "hover:border-brand-leaf/40 dark:hover:border-brand-teal/40",
    glow: "group-hover:shadow-brand-leaf/20",
    key: 8,
  },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-brand-mist py-28 dark:bg-brand-navy"
    >
      {/* Subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
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
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-mist px-4 py-1.5 text-sm font-semibold text-brand-blue-deep dark:border-brand-cyan/40 dark:bg-brand-blue/20 dark:text-brand-cyan">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-blue dark:bg-brand-cyan" />
            {t("landing.features.badge")}
          </span>
          <h2 className="mt-5 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            {t("landing.features.title")}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            {t("landing.features.subtitle")}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, gradient, bg, border, glow, key }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
              className={`group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${border} ${glow} dark:border-gray-800/60 dark:bg-gray-900/60`}
            >
              {/* Top accent line */}
              <div
                className={`absolute left-0 right-0 top-0 h-0.5 bg-linear-to-r ${gradient} scale-x-0 transition-transform duration-300 group-hover:scale-x-100`}
              />

              {/* Icon */}
              <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br ${gradient}`}
                >
                  <Icon size={16} className="text-white" />
                </div>
              </div>

              <h3 className="mb-2.5 text-base font-bold text-gray-900 dark:text-white">
                {t(`landing.features.f${key}Title`)}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {t(`landing.features.f${key}Desc`)}
              </p>

              {/* Noise texture overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)" }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            And many more features coming — built for Bangladeshi businesses.
          </p>
        </div>
      </div>
    </section>
  );
}
