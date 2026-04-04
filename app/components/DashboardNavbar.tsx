"use client";

import { useState } from "react";
import { ChevronDown, Search, Bell, Mail, Settings, PlusCircle, Monitor } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NavbarLanguageSwitcher from "@/components/NavbarLanguageSwitcher";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function DashboardNavbar() {
  const [openStore, setOpenStore] = useState(false);
  const { t } = useTranslation();

  return (
    <nav className="
      w-full flex items-center justify-between gap-4 
      px-4 md:px-6 py-2 
      bg-white dark:bg-gray-900 
      border-b border-gray-200 dark:border-gray-700
      text-gray-900 dark:text-gray-100
    ">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4 flex-1">
        
        {/* Search */}
        <div className="
          hidden md:flex items-center gap-2 
          bg-gray-100 dark:bg-gray-800 
          px-3 py-2 rounded-xl w-full max-w-sm 
          border border-gray-200 dark:border-gray-700
        ">
          <Search size={18} className="shrink-0 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder={t("nav.searchPlaceholder")}
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          <div className="
            text-xs px-2 py-0.5 rounded 
            bg-white dark:bg-gray-700 
            border border-gray-300 dark:border-gray-600
          ">
            {t("nav.shortcutHint")}
          </div>
        </div>

      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">

        {/* Store Select */}
        <button
          onClick={() => setOpenStore(!openStore)}
          className="
            hidden md:flex items-center gap-2 
            bg-gray-100 dark:bg-gray-800 
            px-3 py-1.5 rounded-xl 
            border border-gray-200 dark:border-gray-700
          "
        >
          <Image
            src="https://dreamspos.dreamstechnologies.com/html/template/assets/img/store/store-01.png"
            alt="store"
            width={22}
            height={22}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("nav.storeName")}</span>
          <ChevronDown size={16} />
        </button>

        {/* Add New */}
        <button className="
          hidden md:flex items-center gap-2 
          bg-orange-400 hover:bg-orange-500 text-white 
          px-4 py-2 rounded-xl text-sm font-medium
        ">
          <PlusCircle size={18} /> {t("nav.addNew")}
        </button>

        {/* POS Button */}
        <button className="
          hidden md:flex items-center gap-2 
          bg-[#0d1b3e] text-white px-4 py-2 
          rounded-xl text-sm font-medium
          dark:bg-slate-800 dark:ring-1 dark:ring-slate-600
        ">
          <Monitor size={18} className="shrink-0" /> {t("nav.pos")}
        </button>

        <NavbarLanguageSwitcher />

        {/* Message */}
        <button className="
          relative flex items-center justify-center
          bg-gray-100 dark:bg-gray-800
          w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700
        ">
          <Mail size={18} className="text-gray-700 dark:text-gray-200" />
        </button>

        {/* Notification */}
        <button className="
          relative flex items-center justify-center
          bg-gray-100 dark:bg-gray-800
          w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700
        ">
          <Bell size={18} className="text-gray-700 dark:text-gray-200" />
          <span
            className="
            absolute right-1 top-1 
            h-3 w-3 rounded-full border border-white bg-red-500 dark:border-gray-800
          "
            aria-hidden
          />
        </button>

        {/* Settings */}
        <button className="
          hidden md:flex items-center justify-center
          bg-gray-100 dark:bg-gray-800
          w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700
        ">
          <Settings size={18} className="text-gray-700 dark:text-gray-200" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle variant="icon" />

        {/* User Profile */}
        <button className="flex items-center">
          <Image
            src="https://dreamspos.dreamstechnologies.com/html/template/assets/img/profiles/avator1.jpg"
            width={36}
            height={36}
            alt={t("nav.userProfileAlt")}
            className="rounded-xl object-cover"
          />
        </button>
      </div>
    </nav>
  );
}
