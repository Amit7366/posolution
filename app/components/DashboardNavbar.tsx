"use client";

import { useState } from "react";
import { ChevronDown, Search, Bell, Mail, Settings, PlusCircle, Monitor } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import Image from "next/image";

export default function DashboardNavbar() {
  const [openStore, setOpenStore] = useState(false);

  return (
    <nav className="
      w-full flex items-center justify-between gap-4 
      px-4 md:px-6 py-2 
      bg-white dark:bg-gray-900 
      border-b border-gray-200 dark:border-gray-700
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
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-transparent outline-none text-sm"
          />
          <div className="
            text-xs px-2 py-0.5 rounded 
            bg-white dark:bg-gray-700 
            border border-gray-300 dark:border-gray-600
          ">
            ⌘ K
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
          <span className="text-sm font-medium">Freshmart</span>
          <ChevronDown size={16} />
        </button>

        {/* Add New */}
        <button className="
          hidden md:flex items-center gap-2 
          bg-orange-400 hover:bg-orange-500 text-white 
          px-4 py-2 rounded-xl text-sm font-medium
        ">
          <PlusCircle size={18} /> Add New
        </button>

        {/* POS Button */}
        <button className="
          hidden md:flex items-center gap-2 
          bg-[#0d1b3e] text-white px-4 py-2 
          rounded-xl text-sm font-medium
        ">
          <Monitor size={18} /> POS
        </button>

        {/* Language */}
        <button className="
          hidden md:flex items-center justify-center
          bg-gray-100 dark:bg-gray-800
          w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700
        ">
          🇺🇸
        </button>

        {/* Message */}
        <button className="
          relative flex items-center justify-center
          bg-gray-100 dark:bg-gray-800
          w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700
        ">
          <Mail size={18} />
        </button>

        {/* Notification */}
        <button className="
          relative flex items-center justify-center
          bg-gray-100 dark:bg-gray-800
          w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700
        ">
          <Bell size={18} />
          <span className="
            absolute top-1 right-1 
            w-3 h-3 bg-red-500 rounded-full border border-white
          "></span>
        </button>

        {/* Settings */}
        <button className="
          hidden md:flex items-center justify-center
          bg-gray-100 dark:bg-gray-800
          w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700
        ">
          <Settings size={18} />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile */}
        <button className="flex items-center">
          <Image
            src="https://dreamspos.dreamstechnologies.com/html/template/assets/img/profiles/avator1.jpg"
            width={36}
            height={36}
            alt="user profile"
            className="rounded-xl object-cover"
          />
        </button>
      </div>
    </nav>
  );
}
