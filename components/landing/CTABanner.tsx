"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const TRUST = [
  { icon: ShieldCheck, label: "Enterprise Security" },
  { icon: Zap, label: "99.9% Uptime" },
  { icon: Users, label: "10,000+ Businesses" },
];

export default function CTABanner() {
  const { t } = useTranslation();
  const blobsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // Continuous blob float — no ScrollTrigger needed
      gsap.to(".cta-blob-1", {
        y: -20,
        x: 15,
        duration: 5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(".cta-blob-2", {
        y: 20,
        x: -15,
        duration: 6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
    }, blobsRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-28 dark:bg-[#060612]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          ref={blobsRef}
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 px-8 py-20 text-center sm:px-16"
        >
          {/* Animated blobs */}
          <div className="cta-blob-1 absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="cta-blob-2 absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Top edge shine */}
          <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />

          <div className="relative">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-sm">
              <Sparkles size={14} className="text-yellow-300" fill="currentColor" />
              <span className="text-sm font-semibold text-white">
                {t("landing.hero.trustedBy")}
              </span>
            </div>

            {/* Headline */}
            <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("landing.cta.title")}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-blue-100">
              {t("landing.cta.subtitle")}
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="group flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.03]"
              >
                {t("landing.cta.btn")}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="text-sm font-medium text-blue-200">{t("landing.cta.btnSub")}</p>
            </div>

            {/* Trust row */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
              {TRUST.map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon size={15} className="text-blue-200" />
                  <span className="text-sm font-medium text-blue-100">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
