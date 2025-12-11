"use client";

import Link from "next/link";
import { LayoutGrid, Receipt, Settings } from "lucide-react";

export default function PosSidebar() {
  return (
    <aside className="w-20 bg-gray-100 dark:bg-gray-800 flex flex-col items-center py-6 gap-6 border-r dark:border-gray-700">
      <Link href="/pos" className="p-3 rounded-lg bg-orange-500 text-white">
        <LayoutGrid size={24} />
      </Link>

      <Link href="/pos/orders" className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
        <Receipt size={24} />
      </Link>

      <Link href="/dashboard/settings" className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg mt-auto">
        <Settings size={24} />
      </Link>
    </aside>
  );
}
