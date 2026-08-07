"use client";

import { AnimatePresence, motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import AuthTabs from "./AuthTabs";
import SocialAuthButtons from "./SocialAuthButtons";
import { useTranslation } from "@/lib/i18n/useTranslation";
import NavbarLanguageSwitcher from "@/components/NavbarLanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

type AuthFormShellProps = {
  children: React.ReactNode;
};

export default function AuthFormShell({ children }: AuthFormShellProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isRegister = pathname === "/register";

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-y-auto bg-white transition-colors duration-300 dark:bg-neutral-950">
      {/* Subtle grid pattern — light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:hidden"
        style={{
          backgroundImage:
            "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 55%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 55%)",
        }}
      />
      {/* Subtle grid pattern — dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden opacity-[0.25] dark:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, #404040 1px, transparent 1px), linear-gradient(to bottom, #404040 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 55%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 flex items-center justify-end gap-2 px-6 pt-5 sm:px-10 lg:px-12">
        <NavbarLanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:px-12">
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.div
            key={isRegister ? "register-icon" : "login-icon"}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 transition-colors dark:border-neutral-700 dark:text-neutral-500"
          >
            <UserRound size={28} strokeWidth={1.5} />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 transition-colors sm:text-3xl dark:text-white">
                {isRegister ? t("auth.registerForm.title") : t("auth.loginForm.title")}
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
                {t("auth.secureSubtitle")}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <AuthTabs />

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: isRegister ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRegister ? -24 : 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8">
          <SocialAuthButtons />
        </div>
      </div>
    </div>
  );
}
