"use client";

import { Bell, Menu } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export default function Topbar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <Menu className="md:hidden" />
        <h1 className="font-semibold text-lg">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <Bell className="text-gray-600 dark:text-gray-300 cursor-pointer" />
        <ThemeToggle />
      </div>
    </header>
  );
}
