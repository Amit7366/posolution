"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ShoppingCart,
  Package,
  BarChart3,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import PartnerLogoMarquee from "./PartnerLogoMarquee";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function Hero() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        y: -80,
        scrollTrigger: {
          trigger: scrollRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      gsap.to(mockRef.current, {
        rotateX: 8,
        y: 60,
        scale: 0.96,
        scrollTrigger: {
          trigger: scrollRef.current,
          start: "30% top",
          end: "bottom top",
          scrub: 1.8,
        },
      });
    }, scrollRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={scrollRef}
      className="relative overflow-hidden bg-white pt-12 pb-16 dark:bg-brand-navy"
    >
      <div ref={glowRef} className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-brand-blue/10 blur-[120px] dark:bg-brand-blue/20" />
        <div className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-brand-green/10 blur-[100px] dark:bg-brand-green/15" />
        <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-cyan/10 blur-[100px] dark:bg-brand-cyan/15" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="max-w-xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-mist px-4 py-2 dark:border-brand-cyan/30 dark:bg-brand-blue/20"
            >
              <Star size={14} className="fill-brand-blue text-brand-blue dark:fill-brand-cyan dark:text-brand-cyan" />
              <span className="text-sm font-semibold text-brand-blue-deep dark:text-brand-cyan">
                {t("landing.hero.badgeTag")}
              </span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl font-black leading-[1.15] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.25rem] dark:text-white"
            >
              <span className="block">{t("landing.hero.titleLine1")}</span>
              <span className="block">
                {t("landing.hero.titleLine2")}{" "}
                <span className="text-gray-900 dark:text-white">{t("landing.hero.titleLine2Brand")}</span>
              </span>
              <span className="mt-1 block bg-linear-to-r from-brand-blue via-brand-cyan to-brand-green bg-clip-text text-transparent">
                {t("landing.hero.titleHighlight")}
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 text-base leading-relaxed text-gray-500 sm:text-lg dark:text-gray-400"
            >
              {t("landing.hero.subtitle")}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-brand-blue via-brand-cyan to-brand-green px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-blue/30 transition-all hover:shadow-brand-cyan/45 hover:scale-[1.02]"
              >
                {t("landing.hero.cta")}
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-transparent px-8 py-4 text-base font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-white/5"
              >
                {t("landing.hero.demo")}
              </button>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-10 border-t border-gray-200/80 pt-8 dark:border-gray-800/80"
            >
              <div className="flex flex-wrap gap-8 sm:gap-10">
                {[
                  { top: t("landing.hero.feature1Top"), bottom: t("landing.hero.feature1Bottom") },
                  { top: t("landing.hero.feature2Top"), bottom: t("landing.hero.feature2Bottom") },
                  { top: t("landing.hero.feature3Top"), bottom: t("landing.hero.feature3Bottom") },
                ].map(({ top, bottom }, i) => (
                  <div key={i}>
                    <p className="text-lg font-black text-brand-blue dark:text-brand-cyan">{top}</p>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{bottom}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            ref={mockRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{ perspective: 1200, transformStyle: "preserve-3d" }}
          >
            <div className="absolute -inset-6 rounded-[40px] bg-linear-to-r from-brand-blue/20 via-brand-cyan/20 to-brand-green/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] dark:border-gray-700/50 dark:bg-brand-navy dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/90 px-5 py-3 dark:border-gray-800 dark:bg-brand-navy/80">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  app.sohojpos.com/pos
                </div>
                <div className="h-2.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-12">
                <div className="col-span-3 hidden border-r border-gray-100 bg-gray-50/80 p-3 md:block dark:border-gray-800 dark:bg-brand-navy/70">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-linear-to-br from-brand-blue to-brand-green" />
                    <div className="h-2 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
                  </div>
                  {[true, false, false, false, false].map((active, i) => (
                    <div
                      key={i}
                      className={`mb-1.5 flex items-center gap-2 rounded-lg px-2 py-2 ${active ? "bg-brand-blue" : ""}`}
                    >
                      <div className={`h-2.5 w-2.5 rounded ${active ? "bg-white/80" : "bg-gray-300 dark:bg-gray-700"}`} />
                      <div className={`h-2 w-12 rounded ${active ? "bg-white/80" : "bg-gray-200 dark:bg-gray-700"}`} />
                    </div>
                  ))}
                </div>

                <div className="col-span-12 p-4 md:col-span-6">
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {[
                      { icon: ShoppingCart, label: "Today Sales", val: "৳45,200", color: "blue" },
                      { icon: TrendingUp, label: "Revenue", val: "৳1.2M", color: "emerald" },
                      { icon: Package, label: "Low Stock", val: "12 items", color: "orange" },
                    ].map(({ icon: Icon, label, val, color }, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-2.5 ${
                          color === "blue"
                            ? "border-brand-blue/15 bg-brand-mist dark:border-brand-blue/30 dark:bg-brand-blue/15"
                            : color === "emerald"
                            ? "border-brand-emerald/20 bg-brand-green/5 dark:border-brand-emerald/30 dark:bg-brand-emerald/15"
                            : "border-orange-100 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/30"
                        }`}
                      >
                        <Icon size={13} className={color === "blue" ? "text-brand-blue" : color === "emerald" ? "text-brand-emerald" : "text-orange-600"} />
                        <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/50">
                    <div className="mb-2 h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex h-12 items-end gap-1">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-linear-to-t from-brand-blue to-brand-cyan opacity-80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 hidden border-l border-gray-100 bg-gray-50/60 p-3 md:block dark:border-gray-800 dark:bg-brand-navy/70">
                  <div className="mb-2 flex items-center gap-2">
                    <ShoppingCart size={12} className="text-brand-blue" />
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Cart (3)</span>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="mb-1.5 flex items-center gap-2 rounded-lg bg-white p-2 dark:bg-gray-900/80">
                      <div className="h-5 w-5 shrink-0 rounded-md bg-gray-200 dark:bg-gray-700" />
                      <div className="h-2 w-12 flex-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                  ))}
                  <button className="mt-2 w-full rounded-xl bg-linear-to-r from-brand-blue to-brand-cyan py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <Zap size={10} className="text-white" fill="currentColor" />
                      <span className="text-[10px] font-bold text-white">Charge ৳850</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -left-4 bottom-12 hidden rounded-xl border border-gray-200/80 bg-white px-3 py-2 shadow-xl dark:border-gray-700/50 dark:bg-gray-900 lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <TrendingUp size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-900 dark:text-white">Revenue Up 23%</p>
                  <p className="text-[9px] text-gray-500">vs last month</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -right-4 top-16 hidden rounded-xl border border-gray-200/80 bg-white px-3 py-2 shadow-xl dark:border-gray-700/50 dark:bg-gray-900 lg:block"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-mist dark:bg-brand-blue/20">
                  <BarChart3 size={14} className="text-brand-blue" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-900 dark:text-white">156 Sales Today</p>
                  <p className="text-[9px] text-gray-500">৳45,200 total</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-16 border-t border-gray-200/60 pt-10 dark:border-gray-800/60"
        >
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            {t("landing.hero.partners")}
          </p>
          <PartnerLogoMarquee />
        </motion.div>
      </div>
    </section>
  );
}
