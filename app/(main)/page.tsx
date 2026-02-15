"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";

export default function HomePage() {


  return (
    <main className="px-6 md:px-16 py-24">
      <section className="text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Build Premium SaaS Apps with Next.js 16
        </h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
          Enterprise architecture, persistent dark mode, SEO optimized metadata,
          and production-ready UI system.
        </p>
        <div className="mt-10 flex gap-6 justify-center">
          <Link href="/register">
            <button className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg shadow-xl hover:shadow-indigo-500/40 transition-all">
              Get Started
            </button>
          </Link>
          <Link href="#features">
            <button
              className="
    px-8 py-4 rounded-2xl text-lg
    border border-slate-300 dark:border-yellow-400
    bg-transparent dark:bg-yellow-400
    text-slate-900 dark:text-black
    transition-colors duration-300
  "
            >
              Learn More
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
