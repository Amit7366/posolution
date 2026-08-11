"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, ChevronRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NavbarLanguageSwitcher from "./NavbarLanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");
  const { t } = useTranslation();

  const desktopLinks = [
    { href: "#features", label: t("marketing.features") },
    { href: "#industry", label: t("marketing.industry") },
    { href: "#pricing", label: t("marketing.pricing") },
    { href: "#faq", label: t("marketing.faqs") },
    { href: "#contact", label: t("marketing.contact") },
  ];

  const mobileLinks = [
    { href: "#home", label: t("marketing.home") },
    ...desktopLinks,
  ];

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleNavClick = (href: string) => {
    setActiveHref(href);
    closeMenu();
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gray-200/80 bg-white transition-colors dark:border-gray-800/80 dark:bg-gray-950 ${
        isOpen ? "bg-white dark:bg-gray-950" : "bg-white/95 backdrop-blur-md dark:bg-gray-950/95"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setActiveHref("#home")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/30">
            <ShoppingCart size={15} className="text-white" />
          </div>
          <span className="text-lg font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            posulation
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {desktopLinks.map(({ href, label }) => (
            <Link
              key={href + label}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <NavbarLanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {t("marketing.login")}
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.03]"
          >
            {t("marketing.register")}
            <ChevronRight size={14} />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="relative z-[60] rounded-xl p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden dark:text-gray-200 dark:hover:bg-gray-800"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/40 lg:hidden"
              onClick={closeMenu}
            />

            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="absolute inset-x-3 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 lg:hidden dark:border-gray-800 dark:bg-gray-950 dark:shadow-black/40"
            >
              <motion.nav
                className="flex flex-col items-center gap-1 px-6 pb-2 pt-8"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                  closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
                }}
              >
                {mobileLinks.map(({ href, label }) => {
                  const active = activeHref === href;
                  return (
                    <motion.div
                      key={href}
                      variants={{
                        open: { opacity: 1, y: 0 },
                        closed: { opacity: 0, y: 10 },
                      }}
                      transition={{ duration: 0.25 }}
                      className="w-full"
                    >
                      <Link
                        href={href}
                        onClick={() => handleNavClick(href)}
                        className={`relative mx-auto flex w-fit flex-col items-center px-3 py-2.5 text-base font-bold transition-colors ${
                          active
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        }`}
                      >
                        {label}
                        {active && (
                          <motion.span
                            layoutId="mobileNavActive"
                            className="mt-1 h-1 w-8 rounded-full bg-blue-600 dark:bg-blue-500"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.25 }}
                className="flex items-center justify-center gap-3 px-6 py-5"
              >
                <NavbarLanguageSwitcher />
                <ThemeToggle variant="icon" />
              </motion.div>

              <div className="mx-6 border-t border-gray-200 dark:border-gray-800" />

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.25 }}
                className="flex items-center justify-between gap-4 px-6 py-5"
              >
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="text-sm font-semibold text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  {t("marketing.login")}
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-transform hover:scale-[1.03]"
                >
                  {t("marketing.startFreeTrial")}
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
