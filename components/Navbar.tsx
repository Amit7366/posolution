"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/30 dark:border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BrandName
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#features"
            className="relative text-slate-700 dark:text-slate-300 hover:text-blue-600 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="relative text-slate-700 dark:text-slate-300 hover:text-blue-600 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="relative text-slate-700 dark:text-slate-300 hover:text-blue-600 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition"
          >
            Register
          </Link>

          <ThemeToggle />
        </nav>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Animated */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden px-6 pb-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col gap-5 pt-4">
              <Link
                href="#features"
                onClick={() => setIsOpen(false)}
                className="relative text-slate-700 dark:text-slate-300 hover:text-blue-600 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
              >
                Features
              </Link>

              <Link
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="relative text-slate-700 dark:text-slate-300 hover:text-blue-600 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
              >
                Pricing
              </Link>

              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="relative text-slate-700 dark:text-slate-300 hover:text-blue-600 transition after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
              >
                Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
