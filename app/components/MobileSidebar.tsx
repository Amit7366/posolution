"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function MobileSidebar({ role }: { role: "admin" | "user" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 fixed top-3 left-3 z-50 bg-white dark:bg-gray-900 rounded-lg shadow"
      >
        <Menu />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-transform duration-300
${open ? "translate-x-0" : "-translate-x-full"}
`}
      >
        
          <button onClick={() => setOpen(false)} className="absolute right-3 top-5">
            <X />
          </button>
       

        <Sidebar role={role} variant="mobile" />

      </div>
    </>
  );
}
