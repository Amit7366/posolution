"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ChevronDown,
  Bell,
  Mail,
  Settings,
  PlusCircle,
  Monitor,
  LogOut,
  UserRound,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NavbarLanguageSwitcher from "@/components/NavbarLanguageSwitcher";
import NavbarSearch from "@/components/NavbarSearch";
import UserAvatar from "@/components/UserAvatar";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAuth } from "@/redux/hook/useAuth";
import { logoutUser } from "@/services/actions/logoutUser";
import type { AppDispatch } from "@/redux/store";
import { useGetMyProfileQuery, useGetStoresQuery } from "@/redux/api/baseApi";

export default function DashboardNavbar() {
  const [openStore, setOpenStore] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data: profileRes } = useGetMyProfileQuery(undefined, {
    skip: !user,
  });
  const { data: storesRes } = useGetStoresQuery(
    { page: 1, limit: 1 },
    { skip: !user }
  );

  const profile = profileRes?.data;
  const displayName =
    profile?.name || user?.userName || user?.email || "posulation";
  const displayEmail = profile?.email || user?.email || "";
  const profileImg = profile?.profileImg || "";

  const primaryStore = useMemo(() => {
    const raw = storesRes?.data;
    const list = Array.isArray(raw) ? raw : [];
    return list[0] as { name?: string } | undefined;
  }, [storesRes]);

  const shopName =
    (typeof primaryStore?.name === "string" && primaryStore.name.trim()) ||
    "posulation";
  const shopInitial = (shopName.trim().charAt(0) || "S").toUpperCase();

  useEffect(() => {
    if (!openProfile) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) {
        setOpenProfile(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenProfile(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openProfile]);

  return (
    <nav className="flex w-full items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-2 text-gray-900 md:px-6 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex flex-1 items-center gap-4">
        <NavbarSearch />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpenStore(!openStore)}
          className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-3 py-1.5 md:flex dark:border-gray-700 dark:bg-gray-800"
        >
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">
            {shopInitial}
          </span>
          <span className="max-w-[140px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {shopName}
          </span>
          <ChevronDown size={16} />
        </button>

        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl bg-orange-400 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 md:flex"
        >
          <PlusCircle size={18} /> {t("nav.addNew")}
        </button>

        <Link
          href="/pos"
          className="hidden items-center gap-2 rounded-xl bg-[#0d1b3e] px-4 py-2 text-sm font-medium text-white hover:opacity-90 md:flex dark:bg-slate-800 dark:ring-1 dark:ring-slate-600"
        >
          <Monitor size={18} className="shrink-0" /> {t("nav.pos")}
        </Link>

        <NavbarLanguageSwitcher />

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
        >
          <Mail size={18} className="text-gray-700 dark:text-gray-200" />
        </button>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
        >
          <Bell size={18} className="text-gray-700 dark:text-gray-200" />
          <span
            className="absolute right-1 top-1 h-3 w-3 rounded-full border border-white bg-red-500 dark:border-gray-800"
            aria-hidden
          />
        </button>

        <button
          type="button"
          className="hidden h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 md:flex dark:border-gray-700 dark:bg-gray-800"
        >
          <Settings size={18} className="text-gray-700 dark:text-gray-200" />
        </button>

        <ThemeToggle variant="icon" />

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setOpenProfile((v) => !v)}
            aria-expanded={openProfile}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-xl border border-transparent p-0.5 transition hover:border-gray-200 dark:hover:border-gray-700"
          >
            <UserAvatar
              name={displayName}
              email={displayEmail}
              src={profileImg || null}
              size={36}
            />
            <ChevronDown
              size={14}
              className={`hidden text-gray-500 transition sm:block ${openProfile ? "rotate-180" : ""}`}
            />
          </button>

          {openProfile && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </p>
                {displayEmail ? (
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {displayEmail}
                  </p>
                ) : null}
              </div>

              <Link
                href="/dashboard/profile"
                role="menuitem"
                onClick={() => setOpenProfile(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <UserRound size={16} />
                {t("nav.myProfile")}
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenProfile(false);
                  void logoutUser(dispatch, () => router.replace("/login"));
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <LogOut size={16} />
                {t("sidebar.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
