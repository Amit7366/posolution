"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, ChevronRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NavbarLanguageSwitcher from "./NavbarLanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#features", label: t("marketing.features") },
    { href: "#pricing", label: t("marketing.pricing") },
    { href: "/login", label: t("marketing.login") },
  ];

  return (
    <header
      className={`fixed left-1/2 top-5 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-2xl transition-all duration-300 ${
        scrolled
          ? "border border-gray-200/80 bg-white/80 shadow-lg shadow-gray-900/8 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/80"
          : "border border-white/20 bg-white/60 backdrop-blur-md dark:border-white/5 dark:bg-gray-950/40"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/30">
            <ShoppingCart size={15} className="text-white" />
          </div>
          <span className="text-lg font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sohoj POS
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NavbarLanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/register"
            className="ml-1 flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.03]"
          >
            {t("marketing.register")}
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <NavbarLanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex flex-col gap-1 px-4 pb-5 pt-3">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white"
              >
                {t("marketing.register")}
                <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
