"use client";

import { useEffect, useRef, useState } from "react";

const PARTNER_LOGOS = [
  "FreshMart",
  "StyleHub",
  "TechZone",
  "GreenGrocers",
  "QuickPay",
  "DhakaMart",
];

export default function PartnerLogoMarquee() {
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLSpanElement[]>([]);
  const items = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const halfWidth = rect.width / 2;

        itemRefs.current.forEach((el) => {
          if (!el) return;
          const itemRect = el.getBoundingClientRect();
          const itemCenter = itemRect.left + itemRect.width / 2;
          const distance = Math.abs(centerX - itemCenter);
          const t = Math.min(distance / halfWidth, 1);
          const scale = 1.28 - t * 0.43;
          const opacity = 0.4 + (1 - t) * 0.6;
          el.style.transform = `scale(${scale})`;
          el.style.opacity = String(opacity);
        });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden py-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-white to-transparent dark:from-brand-navy"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-white to-transparent dark:from-brand-navy"
        aria-hidden
      />

      <div
        className="partner-marquee-track flex w-max items-center gap-12 sm:gap-20"
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            ref={(el) => {
              if (el) itemRefs.current[i] = el;
            }}
            className="shrink-0 px-2 text-sm font-bold text-gray-600 will-change-transform sm:text-base dark:text-gray-300"
            style={{ transform: "scale(0.85)", opacity: 0.5 }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
