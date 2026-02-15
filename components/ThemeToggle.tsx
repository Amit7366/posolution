"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) return null

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle Theme"
      className="relative w-12 h-6 flex items-center rounded-full bg-slate-200 dark:bg-slate-800 transition-colors duration-300 p-1"
    >
      {/* Animated Circle */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 bg-white dark:bg-slate-900 rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: isDark ? 24 : 0,
        }}
      >
        {isDark ? (
          <Moon size={12} className="text-yellow-400" />
        ) : (
          <Sun size={12} className="text-orange-500" />
        )}
      </motion.div>
    </button>
  )
}
