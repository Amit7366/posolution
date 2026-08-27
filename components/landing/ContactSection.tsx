"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Headphones, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ContactSection() {
  const { t } = useTranslation();

  const contactCards = [
    { icon: Phone, label: t("landing.contact.callUs"), value: t("landing.contact.phone") },
    { icon: Mail, label: t("landing.contact.emailUs"), value: t("landing.contact.email") },
    { icon: MapPin, label: t("landing.contact.ourOffice"), value: t("landing.contact.office") },
  ];

  return (
    <section id="contact" className="bg-brand-mist py-20 dark:bg-brand-navy">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            {t("landing.contact.title")}
          </h2>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
                alt="Support team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                <Headphones size={16} className="text-brand-blue dark:text-brand-cyan" />
                {t("landing.contact.support247")}
              </span>
              <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                <ShieldCheck size={16} className="text-brand-blue dark:text-brand-cyan" />
                {t("landing.contact.secureData")}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {contactCards.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200/60 bg-white p-4 dark:border-gray-800/50 dark:bg-gray-900/60"
                >
                  <Icon size={20} className="text-brand-blue dark:text-brand-cyan" />
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/50">
              <iframe
                title="Office location"
                src="https://maps.google.com/maps?q=Dhaka,Bangladesh&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="h-64 w-full sm:h-72"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
