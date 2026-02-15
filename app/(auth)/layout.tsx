"use client"

import AuthTabs from "@/components/auth/AuthTabs"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeToggle from "@/components/ThemeToggle"
import { StepBack } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex items-center justify-center px-6 transition-colors duration-500 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-10 transition-colors duration-500">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1">
                Login or create a new account
              </p>

              <Link href="/" className="flex items-center gap-2 text-sm mt-2 text-slate-900 dark:text-amber-300 hover:underline">
                <StepBack size={16} /> <span>Back to Home</span>
              </Link>
            </div>

            {/* Theme toggle */}
            <ThemeToggle />
          </div>

          {/* Tabs */}
          <AuthTabs />

          {/* Form */}
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </ThemeProvider>
  )
}
