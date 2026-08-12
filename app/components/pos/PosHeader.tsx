"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeftRight,
  ChevronDown,
  CloudOff,
  LayoutDashboard,
  LogOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Store,
  User,
} from "lucide-react";
import { useGetStoresQuery } from "@/redux/api/baseApi";
import type { RootState } from "@/redux/store";
import { logoutUser } from "@/services/actions/logoutUser";
import type { AppDispatch } from "@/redux/store";
import ThemeToggle from "@/components/ThemeToggle";
import { getAllCachedStores } from "./offline/posCache";
import { usePosOffline } from "./offline/PosOfflineProvider";

type Props = {
  onOpenTransactions: () => void;
};

export default function PosHeader({ onOpenTransactions }: Props) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [fullscreen, setFullscreen] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [cachedStores, setCachedStores] = useState<{ _id: string; name: string }[]>([]);
  const { online, pending, syncing, syncNow } = usePosOffline();

  const { data: storesPayload } = useGetStoresQuery(
    { page: 1, limit: 50 },
    { skip: !online }
  );

  useEffect(() => {
    void getAllCachedStores().then((rows) =>
      setCachedStores(rows.map((s) => ({ _id: s.id, name: s.name })))
    );
  }, [online, storesPayload]);

  const stores = useMemo(() => {
    const raw = (storesPayload as { data?: unknown[] } | undefined)?.data;
    const api = Array.isArray(raw) ? (raw as { _id: string; name: string }[]) : [];
    return api.length > 0 ? api : cachedStores;
  }, [storesPayload, cachedStores]);

  const selectedStore =
    stores.find((s) => s._id === storeId) ?? stores[0] ?? null;

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      /* ignore */
    }
  }

  const statusLabel = !online
    ? "Offline"
    : syncing
      ? "Syncing…"
      : pending > 0
        ? `${pending} pending`
        : null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 bg-gray-900 px-3 text-white sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/10"
          title="Dashboard"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 text-sm font-bold text-white">
            S
          </span>
          <span className="hidden font-semibold tracking-wide sm:inline">posulation</span>
        </Link>

        <Link
          href="/dashboard"
          className="hidden rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white md:inline-flex"
          title="Dashboard"
        >
          <LayoutDashboard size={18} />
        </Link>

        <div className="hidden items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-sm sm:flex">
          <User size={14} className="text-orange-400" />
          <span className="max-w-[120px] truncate">
            {user?.userName || user?.email || "User"}
          </span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div className="relative hidden items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-sm md:flex">
          <Store size={14} className="text-orange-400" />
          <select
            className="max-w-[140px] cursor-pointer appearance-none bg-transparent text-white outline-none"
            value={selectedStore?._id ?? ""}
            onChange={(e) => setStoreId(e.target.value)}
          >
            {stores.length === 0 ? (
              <option value="">Demo Shop</option>
            ) : (
              stores.map((s) => (
                <option key={s._id} value={s._id} className="text-gray-900">
                  {s.name}
                </option>
              ))
            )}
          </select>
          <ChevronDown size={14} className="pointer-events-none text-gray-400" />
        </div>

        {statusLabel && (
          <button
            type="button"
            onClick={() => void syncNow()}
            disabled={!online || syncing}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium ${
              !online
                ? "bg-amber-500/20 text-amber-300"
                : "bg-sky-500/20 text-sky-300"
            }`}
            title={online ? "Sync now" : "You are offline"}
          >
            {!online ? <CloudOff size={14} /> : <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />}
            <span className="hidden sm:inline">{statusLabel}</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenTransactions}
        className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/15"
      >
        <ArrowLeftRight size={16} />
        <span className="hidden sm:inline">Transactions</span>
        {pending > 0 && (
          <span className="rounded-full bg-orange-500 px-1.5 text-[10px] font-bold leading-4">
            {pending}
          </span>
        )}
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle
          variant="icon"
          className="!h-9 !w-9 !rounded-md !border-transparent !bg-white/10 !text-gray-200 hover:!bg-white/15 dark:!border-transparent dark:!bg-white/10 dark:!text-gray-200 dark:hover:!bg-white/15"
        />
        <button
          type="button"
          onClick={toggleFullscreen}
          className="rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white"
          title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <button
          type="button"
          onClick={() => logoutUser(dispatch, () => router.replace("/login"))}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
