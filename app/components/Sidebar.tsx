"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { sidebarMenus } from "../lib/menus";
import type { AppDispatch } from "@/redux/store";
import { logoutUser } from "@/services/actions/logoutUser";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { MenuItem } from "../lib/menus";

function sidebarItemVisible(
  itemRole: MenuItem["role"],
  viewer: "admin" | "user"
) {
  if (itemRole === "all" || itemRole === undefined) return true;
  return itemRole === viewer;
}

export default function Sidebar({
  role,
  variant = "desktop",
}: {
  role: "admin" | "user";
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState<string | null>(null);
  const { t } = useTranslation();

  const toggle = (key: string) => {
    setOpen((prev) => (prev === key ? null : key));
  };

  const visibleMenus = useMemo(
    () => sidebarMenus.filter((m) => sidebarItemVisible(m.role, role)),
    [role]
  );

  return (
    <aside
      className={`fixed flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900
  ${variant === "desktop" ? "hidden md:flex" : "flex"}
`}
    >
      <div className="border-b border-gray-200 bg-white p-4 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
        {t("sidebar.appTitle")}
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {visibleMenus.map((menu, index) => {
          const isActive = pathname.startsWith(menu.link || "");
          const isOpen = open === menu.titleKey;
          const Icon = menu.icon;

          return (
            <div key={index} className="mb-1">
              {menu.sectionKey && (
                <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t(menu.sectionKey)}
                </p>
              )}

              {menu.children ? (
                <button
                  type="button"
                  onClick={() => toggle(menu.titleKey)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  } `}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`${
                        isActive
                          ? "text-orange-500 dark:text-orange-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    {t(menu.titleKey)}
                  </span>

                  <ChevronDown
                    size={17}
                    className={`text-gray-500 transition-transform duration-300 dark:text-gray-400 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={menu.link!}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  } `}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={`${
                        isActive
                          ? "text-orange-500 dark:text-orange-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    {t(menu.titleKey)}
                  </span>
                </Link>
              )}

              {menu.children && (
                <div
                  className={`ml-9 space-y-1 overflow-hidden transition-all duration-300 ${
                    isOpen ? "mt-1 max-h-60" : "max-h-0"
                  }`}
                >
                  {menu.children
                    .filter((c) => sidebarItemVisible(c.role, role))
                    .map((child, i) => {
                    const childActive = pathname === child.link;
                    return (
                      <Link
                        key={i}
                        href={child.link!}
                        className={`flex items-center rounded-md px-2 py-[6px] text-[13px] transition ${
                          childActive
                            ? "font-medium text-orange-500"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        }`}
                      >
                        <span
                          className={`mr-2 mt-[2px] h-[6px] w-[6px] rounded-full transition ${
                            childActive ? "bg-orange-500" : "bg-gray-400 opacity-40"
                          }`}
                        />
                        {t(child.titleKey)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <button
          type="button"
          onClick={() => logoutUser(dispatch, () => router.replace("/login"))}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut size={18} />
          {t("sidebar.logout")}
        </button>
      </div>
    </aside>
  );
}
