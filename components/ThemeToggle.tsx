"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  /** `icon` matches compact dashboard nav controls; `switch` is the pill control for auth/marketing */
  variant?: "switch" | "icon";
  className?: string;
};

export default function ThemeToggle({ variant = "switch", className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (!mounted) {
    return (
      <span
        className={cn(
          variant === "icon"
            ? "inline-flex h-10 w-10 shrink-0 rounded-xl border border-transparent bg-gray-100 dark:bg-gray-800"
            : "inline-block h-6 w-12 rounded-full bg-slate-200 dark:bg-slate-800",
          className
        )}
        aria-hidden
      />
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-gray-800 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900",
          className
        )}
      >
        {isDark ? <Sun className="h-[18px] w-[18px]" strokeWidth={2} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={2} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex h-6 w-12 items-center rounded-full bg-slate-200 p-1 transition-colors duration-300 dark:bg-slate-800",
        className
      )}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-md dark:bg-slate-900"
        animate={{ x: isDark ? 24 : 0 }}
      >
        {isDark ? (
          <Moon size={12} className="text-amber-300" aria-hidden />
        ) : (
          <Sun size={12} className="text-orange-500" aria-hidden />
        )}
      </motion.div>
    </button>
  );
}
