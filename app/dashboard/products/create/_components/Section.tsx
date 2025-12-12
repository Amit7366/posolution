"use client";
import React, { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Section({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-t-md"
      >
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">ⓘ</span>
          {title}
        </div>
        <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`p-5 ${open ? "block" : "hidden"}`}>{children}</div>
    </div>
  );
}
