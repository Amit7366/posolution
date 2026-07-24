"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function MobileSidebar({ role }: { role: "admin" | "user" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed left-3 top-3 z-50 rounded-lg bg-white p-2 text-gray-800 shadow-md ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-full w-64 border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900
${open ? "translate-x-0" : "-translate-x-full"}
`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-5 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
       

        <Sidebar role={role} variant="mobile" />

      </div>
    </>
  );
}
