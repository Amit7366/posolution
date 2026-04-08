"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Play,
  ShoppingCart,
  Package,
  BarChart3,
  Zap,
  TrendingUp,
  CheckCircle2,
  Star,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

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

const TRUST_ITEMS = [
  "No credit card required",
  "Free plan forever",
  "Setup in 5 minutes",
];

export default function Hero() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax glow blobs
      gsap.to(glowRef.current, {
        y: -80,
        scrollTrigger: {
          trigger: scrollRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });

      // Mock dashboard tilt on scroll
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

  const stats = [
    { value: t("landing.hero.stat1"), label: t("landing.hero.stat1Label") },
    { value: t("landing.hero.stat2"), label: t("landing.hero.stat2Label") },
    { value: t("landing.hero.stat3"), label: t("landing.hero.stat3Label") },
  ];

  return (
    <section
      ref={scrollRef}
      className="relative overflow-hidden bg-white pt-28 pb-0 dark:bg-[#060612]"
    >
      {/* Animated background */}
      <div ref={glowRef} className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/15" />
        <div className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-purple-500/8 blur-[100px] dark:bg-purple-600/12" />
        <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-500/8 blur-[100px] dark:bg-indigo-600/10" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#94a3b8 1px,transparent 1px),linear-gradient(90deg,#94a3b8 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 flex justify-center"
        >
          <a
            href="#features"
            className="group inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 py-1.5 pl-2.5 pr-4 text-sm font-medium text-blue-700 backdrop-blur-sm transition-all hover:border-blue-300 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
              <Zap size={10} fill="currentColor" /> New
            </span>
            {t("landing.hero.badge")}
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-center text-5xl font-black tracking-tight text-gray-900 sm:text-6xl lg:text-7xl dark:text-white"
          style={{ lineHeight: 1.08 }}
        >
          {t("landing.hero.title").split(t("landing.hero.titleHighlight"))[0]}
          <span className="relative inline-block">
            <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {t("landing.hero.titleHighlight")}
            </span>
            {/* Underline squiggle */}
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="8"
              viewBox="0 0 300 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M1 5.5C50 1.5 100 7.5 150 4C200 0.5 250 6.5 299 3"
                stroke="url(#heroUnderline)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="heroUnderline" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="0.5" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          {t("landing.hero.title").split(t("landing.hero.titleHighlight"))[1]}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-7 max-w-2xl text-center text-lg leading-relaxed text-gray-500 sm:text-xl dark:text-gray-400"
        >
          {t("landing.hero.subtitle")}
        </motion.p>

        {/* Trust items */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-4 flex flex-wrap items-center justify-center gap-4"
        >
          {TRUST_ITEMS.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
            >
              <CheckCircle2 size={14} className="text-emerald-500" />
              {item}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/register"
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:scale-[1.03]"
          >
            <span className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">{t("landing.hero.cta")}</span>
            <ArrowRight size={18} className="relative transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/8"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
              <Play size={14} className="ml-0.5 text-blue-600 dark:text-blue-400" fill="currentColor" />
            </span>
            {t("landing.hero.demo")}
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-14 flex max-w-lg flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-16"
        >
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
          {/* Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">4.9 rating</p>
          </div>
        </motion.div>

        {/* Dashboard mock */}
        <motion.div
          ref={mockRef}
          initial={{ opacity: 0, y: 80, rotateX: -6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
          style={{ perspective: 1200, transformStyle: "preserve-3d" }}
        >
          {/* Glow halo */}
          <div className="absolute -inset-8 rounded-[40px] bg-linear-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-3xl" />

          {/* Browser frame */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] dark:border-gray-700/50 dark:bg-[#0d0d1a] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
            {/* Browser bar */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/90 px-5 py-3 dark:border-gray-800 dark:bg-[#111125]">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                app.sohojpos.com/pos
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* App UI */}
            <div className="grid grid-cols-12">
              {/* Sidebar */}
              <div className="col-span-2 hidden border-r border-gray-100 bg-gray-50/80 p-4 md:block dark:border-gray-800 dark:bg-[#0a0a18]">
                <div className="mb-5 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600" />
                  <div className="h-2.5 w-16 rounded-full bg-gray-300 dark:bg-gray-700" />
                </div>
                {[
                  { active: true, width: "w-14" },
                  { active: false, width: "w-12" },
                  { active: false, width: "w-16" },
                  { active: false, width: "w-10" },
                  { active: false, width: "w-14" },
                  { active: false, width: "w-12" },
                ].map(({ active, width }, i) => (
                  <div
                    key={i}
                    className={`mb-1.5 flex items-center gap-2 rounded-lg px-2 py-2 ${active ? "bg-blue-600" : ""}`}
                  >
                    <div className={`h-3 w-3 rounded ${active ? "bg-white/80" : "bg-gray-300 dark:bg-gray-700"}`} />
                    <div className={`h-2 rounded ${active ? `${width} bg-white/80` : `${width} bg-gray-200 dark:bg-gray-700`}`} />
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className="col-span-12 p-5 md:col-span-7">
                {/* Top stat cards */}
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[
                    { icon: ShoppingCart, label: "Today Sales", val: "৳45,200", change: "+12%", color: "blue" },
                    { icon: TrendingUp, label: "Revenue", val: "৳1.2M", change: "+8%", color: "emerald" },
                    { icon: Package, label: "Low Stock", val: "12 items", change: "alert", color: "orange" },
                  ].map(({ icon: Icon, label, val, change, color }, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-3.5 ${
                        color === "blue"
                          ? "border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/30"
                          : color === "emerald"
                          ? "border-emerald-100 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                          : "border-orange-100 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <Icon
                          size={15}
                          className={
                            color === "blue"
                              ? "text-blue-600"
                              : color === "emerald"
                              ? "text-emerald-600"
                              : "text-orange-600"
                          }
                        />
                        <span
                          className={`text-[10px] font-bold ${
                            change === "alert"
                              ? "text-orange-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {change}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{label}</p>
                      <p className="mt-0.5 text-sm font-bold text-gray-800 dark:text-gray-100">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Chart bar */}
                <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-2.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="h-2 w-12 rounded-full bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="flex h-16 items-end gap-1.5">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm bg-linear-to-t from-blue-500 to-indigo-400 opacity-80"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Product list rows */}
                <div className="space-y-2">
                  {[
                    { w1: "w-24", w2: "w-16", w3: "w-10", color: "bg-blue-500" },
                    { w1: "w-20", w2: "w-12", w3: "w-14", color: "bg-emerald-500" },
                    { w1: "w-28", w2: "w-16", w3: "w-8", color: "bg-purple-500" },
                  ].map(({ w1, w2, w3, color }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50"
                    >
                      <div className={`h-7 w-7 shrink-0 rounded-lg ${color} opacity-80`} />
                      <div className={`h-2 ${w1} rounded-full bg-gray-200 dark:bg-gray-700`} />
                      <div className="ml-auto flex items-center gap-3">
                        <div className={`h-2 ${w2} rounded-full bg-gray-100 dark:bg-gray-800`} />
                        <div className={`h-2 ${w3} rounded-full bg-emerald-200 dark:bg-emerald-900/50`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart */}
              <div className="col-span-12 hidden border-l border-gray-100 bg-gray-50/60 p-4 md:col-span-3 md:block dark:border-gray-800 dark:bg-[#0a0a18]">
                <div className="mb-3 flex items-center gap-2">
                  <ShoppingCart size={13} className="text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cart (3)</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "w-20", price: "w-10" },
                    { name: "w-16", price: "w-12" },
                    { name: "w-22", price: "w-8" },
                  ].map(({ name, price }, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-white p-2.5 dark:bg-gray-900/80">
                      <div className="h-6 w-6 shrink-0 rounded-md bg-gray-200 dark:bg-gray-700" />
                      <div className={`h-2 ${name} flex-1 rounded-full bg-gray-200 dark:bg-gray-700`} />
                      <div className={`h-2 ${price} rounded-full bg-blue-200 dark:bg-blue-900/50`} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1.5 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900/50">
                  <div className="flex justify-between">
                    <div className="h-2 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="h-2 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-2 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
                    <div className="h-2 w-10 rounded-full bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
                <button className="mt-3 w-full rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Zap size={11} className="text-white" fill="currentColor" />
                    <span className="text-xs font-bold text-white">Charge ৳850</span>
                  </div>
                </button>

                {/* Payment methods */}
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {["Cash", "bKash", "Card"].map((m, i) => (
                    <div
                      key={i}
                      className={`rounded-lg py-1.5 text-center text-[10px] font-medium ${
                        i === 0
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification cards */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="absolute -left-6 bottom-16 hidden rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-xl dark:border-gray-700/50 dark:bg-gray-900 lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">Revenue Up 23%</p>
                <p className="text-[11px] text-gray-500">Compared to last month</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="absolute -right-6 top-24 hidden rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-xl dark:border-gray-700/50 dark:bg-gray-900 lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <BarChart3 size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">156 Sales Today</p>
                <p className="text-[11px] text-gray-500">৳45,200 total</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white dark:from-[#060612]" />
      </div>
    </section>
  );
}
