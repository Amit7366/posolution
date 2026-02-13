"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
];

export default function AuthTabs() {
  const pathname = usePathname();

  return (
    <div className="relative flex gap-6 border-b border-neutral-800 pb-3">
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative text-sm font-medium transition ${
              active ? "text-white" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {tab.label}

            {active && (
              <motion.span
                layoutId="authTab"
                className="absolute -bottom-3 left-0 right-0 h-[2px] bg-blue-500 rounded-full"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
