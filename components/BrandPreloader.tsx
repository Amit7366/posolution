"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const STORAGE_KEY = "posulation-preloader-seen";
const APP_PREFIXES = ["/dashboard", "/pos"];
const DURATION_MS = 1100;

function isAppRoute(pathname: string) {
  return APP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function BrandPreloader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isAppRoute(pathname)) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="brand-preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-brand-navy"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-hidden
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <Image
              src="/posulation-icon.png"
              alt="posulation"
              width={88}
              height={88}
              priority
              className="object-contain"
            />
            <div className="flex h-8 items-end gap-1.5" aria-hidden>
              <span
                className="brand-preloader-bar h-4 w-1.5 rounded-sm bg-brand-blue"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="brand-preloader-bar h-6 w-1.5 rounded-sm bg-brand-cyan"
                style={{ animationDelay: "140ms" }}
              />
              <span
                className="brand-preloader-bar h-8 w-1.5 rounded-sm bg-brand-green"
                style={{ animationDelay: "280ms" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
