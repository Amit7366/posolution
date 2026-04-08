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
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "hover:border-blue-300/60 dark:hover:border-blue-700/60",
    glow: "group-hover:shadow-blue-500/20",
    key: 1,
  },
  {
    Icon: Package,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "hover:border-emerald-300/60 dark:hover:border-emerald-700/60",
    glow: "group-hover:shadow-emerald-500/20",
    key: 2,
  },
  {
    Icon: QrCode,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "hover:border-violet-300/60 dark:hover:border-violet-700/60",
    glow: "group-hover:shadow-violet-500/20",
    key: 3,
  },
  {
    Icon: FileText,
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "hover:border-orange-300/60 dark:hover:border-orange-700/60",
    glow: "group-hover:shadow-orange-500/20",
    key: 4,
  },
  {
    Icon: BarChart3,
    gradient: "from-sky-500 to-cyan-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "hover:border-sky-300/60 dark:hover:border-sky-700/60",
    glow: "group-hover:shadow-sky-500/20",
    key: 5,
  },
  {
    Icon: Store,
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "hover:border-pink-300/60 dark:hover:border-pink-700/60",
    glow: "group-hover:shadow-pink-500/20",
    key: 6,
  },
  {
    Icon: Users,
    gradient: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "hover:border-indigo-300/60 dark:hover:border-indigo-700/60",
    glow: "group-hover:shadow-indigo-500/20",
    key: 7,
  },
  {
    Icon: ShieldCheck,
    gradient: "from-slate-600 to-gray-700",
    bg: "bg-slate-50 dark:bg-slate-900/50",
    border: "hover:border-slate-300/60 dark:hover:border-slate-600/60",
    glow: "group-hover:shadow-slate-500/20",
    key: 8,
  },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#fafafa] py-28 dark:bg-[#070710]"
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
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
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
