"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

const AVATARS = [
  { top: "8%", left: "12%", delay: 0, initials: "RA", tone: "bg-amber-300 text-amber-900" },
  { top: "18%", right: "10%", delay: 0.4, initials: "FK", tone: "bg-rose-300 text-rose-900" },
  { top: "48%", left: "6%", delay: 0.8, initials: "KB", tone: "bg-emerald-300 text-emerald-900" },
  { top: "55%", right: "8%", delay: 1.2, initials: "NS", tone: "bg-violet-300 text-violet-900" },
  { bottom: "22%", left: "18%", delay: 1.6, initials: "MA", tone: "bg-sky-300 text-sky-900" },
];

export default function AuthMarketingPanel() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const testimonials = [
    {
      text: t("marketing.testimonials.t1Text"),
      name: t("marketing.testimonials.t1Name"),
      role: t("marketing.testimonials.t1Role"),
    },
    {
      text: t("marketing.testimonials.t2Text"),
      name: t("marketing.testimonials.t2Name"),
      role: t("marketing.testimonials.t2Role"),
    },
    {
      text: t("marketing.testimonials.t3Text"),
      name: t("marketing.testimonials.t3Name"),
      role: t("marketing.testimonials.t3Role"),
    },
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const current = testimonials[index];

  return (
    <div className="relative flex h-full min-h-[280px] flex-col overflow-hidden bg-linear-to-b from-blue-600 to-blue-800 text-white transition-colors duration-300 dark:from-blue-950 dark:to-neutral-950 lg:min-h-0">
      {/* Soft glow accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-500/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-1/3 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl dark:bg-indigo-600/15"
      />

      {/* Brand */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {t("auth.marketing.brand")}
          </span>
        </Link>
      </div>

      {/* Globe + avatars — desktop focus */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-8 lg:py-4">
        <div className="relative h-48 w-48 sm:h-56 sm:w-56 lg:h-64 lg:w-64">
          {/* Connection arcs */}
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 256 256"
          >
            <motion.path
              d="M40 80 Q128 20 216 90"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              strokeDasharray="4 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
            <motion.path
              d="M30 150 Q128 220 230 140"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
              strokeDasharray="4 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
            />
          </svg>

          <motion.div
            className="absolute inset-[12%] rounded-full bg-linear-to-br from-sky-300/90 to-blue-500/80 shadow-[0_0_60px_rgba(56,189,248,0.35)]"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Globe grid lines */}
            <div className="absolute inset-0 overflow-hidden rounded-full opacity-40">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/50" />
              <div className="absolute left-1/4 top-0 h-full w-px bg-white/30" />
              <div className="absolute right-1/4 top-0 h-full w-px bg-white/30" />
              <div className="absolute top-1/3 left-0 h-px w-full bg-white/40" />
              <div className="absolute top-1/2 left-0 h-px w-full bg-white/50" />
              <div className="absolute top-2/3 left-0 h-px w-full bg-white/40" />
              <div className="absolute inset-0 rounded-full border border-white/30" />
              <div className="absolute inset-[18%] rounded-full border border-white/20" />
            </div>
          </motion.div>

          {AVATARS.map((avatar, i) => (
            <motion.div
              key={i}
              className={`absolute flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border-2 border-white text-xs font-bold shadow-lg sm:h-11 sm:w-11 ${avatar.tone}`}
              style={{
                top: avatar.top,
                left: avatar.left,
                right: avatar.right,
                bottom: avatar.bottom,
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.5 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: avatar.delay,
              }}
            >
              {avatar.initials}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="relative z-10 mt-auto px-6 pb-8 sm:px-8 lg:px-10 lg:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <blockquote className="text-lg font-semibold leading-snug tracking-tight sm:text-xl lg:text-2xl">
              &ldquo;{current.text}&rdquo;
            </blockquote>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-semibold">{current.name}</p>
                <p className="mt-0.5 text-sm text-blue-100/80">{current.role}</p>
                <div className="mt-2 flex gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-white text-white" />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 transition hover:bg-white/20"
                  aria-label={t("auth.marketing.prevTestimonial")}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 transition hover:bg-white/20"
                  aria-label={t("auth.marketing.nextTestimonial")}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
