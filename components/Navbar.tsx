"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import NavbarLanguageSwitcher from "./NavbarLanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="fixed left-1/2 top-6 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-2xl border border-white/30 bg-white/60 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BrandName
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex md:gap-8">
          <Link
            href="#features"
            className="relative text-slate-700 transition after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:text-blue-600 hover:after:w-full dark:text-slate-300"
          >
            {t("marketing.features")}
          </Link>
          <Link
            href="#pricing"
            className="relative text-slate-700 transition after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:text-blue-600 hover:after:w-full dark:text-slate-300"
          >
            {t("marketing.pricing")}
          </Link>
          <Link
            href="/login"
            className="relative text-slate-700 transition after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:text-blue-600 hover:after:w-full dark:text-slate-300"
          >
            {t("marketing.login")}
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
          >
            {t("marketing.register")}
          </Link>

          <NavbarLanguageSwitcher />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <NavbarLanguageSwitcher />
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl p-2 transition hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-expanded={isOpen}
            aria-label="Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="border-b border-slate-200 bg-white px-6 pb-6 dark:border-slate-800 dark:bg-slate-950 md:hidden"
          >
            <div className="flex flex-col gap-5 pt-4">
              <Link
                href="#features"
                onClick={() => setIsOpen(false)}
                className="relative text-slate-700 transition after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:text-blue-600 hover:after:w-full dark:text-slate-300"
              >
                {t("marketing.features")}
              </Link>

              <Link
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="relative text-slate-700 transition after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:text-blue-600 hover:after:w-full dark:text-slate-300"
              >
                {t("marketing.pricing")}
              </Link>

              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="relative text-slate-700 transition after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:text-blue-600 hover:after:w-full dark:text-slate-300"
              >
                {t("marketing.login")}
              </Link>

              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-white shadow-md transition hover:bg-blue-700"
              >
                {t("marketing.register")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
