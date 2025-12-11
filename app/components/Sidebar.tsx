"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { sidebarMenus } from "../lib/menus";

export default function Sidebar({ role }: { role: "admin" | "user" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (title: string) => {
    setOpen(prev => (prev === title ? null : title));
  };

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800">
      
      {/* HEADER */}
      <div className="p-4 font-semibold text-lg border-b bg-white dark:bg-gray-900 dark:text-white">
        POS Dashboard
      </div>

      {/* MENU LIST */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {sidebarMenus
          .filter(m => m.role === "all" || m.role === role)
          .map((menu, index) => {
            const isActive = pathname.startsWith(menu.href || "");
            const isOpen = open === menu.title;
            const Icon = menu.icon;

            return (
              <div key={index} className="mb-1">

                {/* SECTION TITLE */}
                {menu.section && (
                  <p className="uppercase text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-3 mt-5 mb-2 tracking-wide">
                    {menu.section}
                  </p>
                )}

                {/* SINGLE OR DROPDOWN MENU */}
                <button
                  onClick={() => (menu.children ? toggle(menu.title) : null)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`${
                        isActive
                          ? "text-orange-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    {menu.title}
                  </span>

                  {menu.children && (
                    <ChevronDown
                      size={17}
                      className={`text-gray-500 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* DROPDOWN CHILDREN */}
                {menu.children && (
                  <div
                    className={`ml-9 overflow-hidden transition-all duration-300 space-y-1 ${
                      isOpen ? "max-h-60 mt-1" : "max-h-0"
                    }`}
                  >
                    {menu.children.map((child, i) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={i}
                          href={child.href!}
                          className={`flex items-center text-[13px] py-[6px] rounded-md transition px-2
                            ${
                              childActive
                                ? "text-orange-500 font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }
                          `}
                        >
                          <span
                            className={`w-[6px] h-[6px] rounded-full mr-2 mt-[2px] transition
                              ${
                                childActive
                                  ? "bg-orange-500"
                                  : "bg-gray-400 opacity-40"
                              }
                            `}
                          ></span>
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </nav>
    </aside>
  );
}
