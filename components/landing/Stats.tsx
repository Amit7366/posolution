"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Building2, ArrowUpRight, Activity, Headphones } from "lucide-react";

const icons = [Building2, ArrowUpRight, Activity, Headphones];

export default function Stats() {
  const { t } = useTranslation();

  const stats = [1, 2, 3, 4].map((n, i) => ({
    value: t(`landing.stats.s${n}`),
    label: t(`landing.stats.s${n}Label`),
    icon: icons[i],
  }));

  return (
    <section className="relative overflow-hidden py-24">
      {/* Full bleed gradient bg */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700" />
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Top/bottom edge highlights */}
      <div className="absolute left-0 right-0 top-0 h-px bg-white/20" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Icon size={24} className="text-white" />
              </div>
              <p className="text-4xl font-black text-white sm:text-5xl">{value}</p>
              <p className="mt-2 text-sm font-medium text-blue-100">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="mt-16 border-t border-white/20 pt-10 text-center">
          <p className="mx-auto max-w-xl text-base font-medium text-blue-100">
            &ldquo;posulation is the fastest-growing retail management platform in Bangladesh — trusted by shops, restaurants, pharmacies, and wholesalers.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
