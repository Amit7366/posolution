"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, ChevronRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NavbarLanguageSwitcher from "./NavbarLanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { href: "#features", label: t("marketing.features") },
    { href: "#industry", label: t("marketing.industry") },
    { href: "#pricing", label: t("marketing.pricing") },
    { href: "#", label: t("marketing.blog") },
    { href: "#contact", label: t("marketing.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/30">
            <ShoppingCart size={15} className="text-white" />
          </div>
          <span className="text-lg font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sohoj POS
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map(({ href, label }) => (
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

        <div className="flex items-center gap-2 lg:hidden">
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-100 lg:hidden dark:border-gray-800"
          >
            <div className="flex flex-col gap-1 px-4 pb-5 pt-3">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href + label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-100"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t("marketing.login")}
              </Link>
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
