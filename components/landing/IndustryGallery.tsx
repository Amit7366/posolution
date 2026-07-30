"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/useTranslation";

const INDUSTRY_IMAGES = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
  "https://images.unsplash.com/photo-1576602976037-6e88717b17dd?w=600&q=80",
  "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
];

export default function IndustryGallery() {
  const { t } = useTranslation();

  const industries = [1, 2, 3, 4, 5, 6].map((n, i) => ({
    label: t(`landing.industry.i${n}`),
    image: INDUSTRY_IMAGES[i],
  }));

  return (
    <section id="industry" className="bg-white py-20 dark:bg-[#060612]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            {t("landing.industry.title")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map(({ label, image }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src={image}
                alt={label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <p className="absolute bottom-4 left-4 text-lg font-bold text-white">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
