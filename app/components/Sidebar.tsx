"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { sidebarMenus } from "../lib/menus";
import type { AppDispatch } from "@/redux/store";
import { logoutUser } from "@/services/actions/logoutUser";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { MenuItem } from "../lib/menus";

const OPEN_KEYS_STORAGE = "sohoj.sidebar.openKeys";
const SCROLL_STORAGE = "sohoj.sidebar.scrollTop";

function sidebarItemVisible(
  itemRole: MenuItem["role"],
  viewer: "admin" | "user"
) {
  if (itemRole === "all" || itemRole === undefined) return true;
  return itemRole === viewer;
}

function pathMatches(pathname: string, link?: string) {
  if (!link) return false;
  if (pathname === link) return true;
  // Home dashboard must not match every /dashboard/* route
  if (link === "/dashboard") return false;
  // Nested pages under the same prefix (e.g. /products/create)
  return pathname.startsWith(`${link}/`);
}

function menuContainsPath(menu: MenuItem, pathname: string): boolean {
  if (menu.link && pathMatches(pathname, menu.link)) return true;
  return Boolean(menu.children?.some((c) => c.link && pathMatches(pathname, c.link)));
}

function readStoredOpenKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OPEN_KEYS_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}

function writeStoredOpenKeys(keys: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OPEN_KEYS_STORAGE, JSON.stringify(keys));
  } catch {
    /* ignore quota */
  }
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
  const { t } = useTranslation();
  const navRef = useRef<HTMLElement | null>(null);
  const activeRef = useRef<HTMLElement | null>(null);
  const restoreScrollDone = useRef(false);

  const visibleMenus = useMemo(
    () => sidebarMenus.filter((m) => sidebarItemVisible(m.role, role)),
    [role]
  );

  const activeParentKey = useMemo(() => {
    const match = visibleMenus.find(
      (m) => m.children && menuContainsPath(m, pathname)
    );
    return match?.titleKey ?? null;
  }, [visibleMenus, pathname]);

  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const stored = readStoredOpenKeys();
    // Merge in active parent so current page's dropdown starts open
    if (typeof window === "undefined") return stored;
    const path = window.location.pathname;
    const parent = sidebarMenus.find(
      (m) => m.children && menuContainsPath(m, path)
    )?.titleKey;
    if (parent && !stored.includes(parent)) return [...stored, parent];
    return stored;
  });

  // Keep active section open when route changes; persist
  useEffect(() => {
    setOpenKeys((prev) => {
      let next = prev;
      if (activeParentKey && !prev.includes(activeParentKey)) {
        next = [...prev, activeParentKey];
      }
      writeStoredOpenKeys(next);
      return next;
    });
  }, [activeParentKey]);

  const toggle = useCallback((key: string) => {
    setOpenKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      writeStoredOpenKeys(next);
      return next;
    });
  }, []);

  // Restore scroll position once after mount
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || restoreScrollDone.current) return;
    try {
      const saved = sessionStorage.getItem(SCROLL_STORAGE);
      if (saved != null) {
        const top = Number(saved);
        if (Number.isFinite(top)) nav.scrollTop = top;
      }
    } catch {
      /* ignore */
    }
    restoreScrollDone.current = true;
  }, []);

  // Persist scroll while user scrolls
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      try {
        sessionStorage.setItem(SCROLL_STORAGE, String(nav.scrollTop));
      } catch {
        /* ignore */
      }
    };
    nav.addEventListener("scroll", onScroll, { passive: true });
    return () => nav.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll active item into view (covers lower menu pages after refresh/navigation)
  useEffect(() => {
    const el = activeRef.current;
    const nav = navRef.current;
    if (!el || !nav) return;

    const frame = window.requestAnimationFrame(() => {
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      // Persist after scroll settles
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(SCROLL_STORAGE, String(nav.scrollTop));
        } catch {
          /* ignore */
        }
      }, 350);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, openKeys]);

  return (
    <aside
      className={`fixed flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900
  ${variant === "desktop" ? "hidden md:flex" : "flex"}
`}
    >
      <div className="border-b border-gray-200 bg-white p-4 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
        {t("sidebar.appTitle")}
      </div>

      <nav ref={navRef} className="flex-1 overflow-y-auto p-3">
        {visibleMenus.map((menu, index) => {
          const isActive = menuContainsPath(menu, pathname);
          const isOpen = openKeys.includes(menu.titleKey);
          const Icon = menu.icon;
          const parentIsExactActive =
            Boolean(menu.link) && pathMatches(pathname, menu.link) && !menu.children;

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
                  ref={parentIsExactActive ? (activeRef as React.RefObject<HTMLAnchorElement>) : undefined}
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
                    isOpen ? "mt-1 max-h-96" : "max-h-0"
                  }`}
                >
                  {menu.children
                    .filter((c) => sidebarItemVisible(c.role, role))
                    .map((child, i) => {
                      const childActive =
                        Boolean(child.link) && pathMatches(pathname, child.link);
                      return (
                        <Link
                          key={i}
                          ref={
                            childActive
                              ? (activeRef as React.RefObject<HTMLAnchorElement>)
                              : undefined
                          }
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
