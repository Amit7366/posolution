"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { countPendingOutbox } from "./posOutbox";
import { isOnline, runPosSync } from "./posSync";
import PosOfflineBootstrap from "./PosOfflineBootstrap";

type PosOfflineContextValue = {
  online: boolean;
  pending: number;
  syncing: boolean;
  refreshPending: () => Promise<void>;
  syncNow: () => Promise<void>;
};

const PosOfflineContext = createContext<PosOfflineContextValue | null>(null);

export function PosOfflineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = useCallback(async () => {
    try {
      setPending(await countPendingOutbox());
    } catch {
      /* ignore */
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!isOnline()) {
      await refreshPending();
      return;
    }
    setSyncing(true);
    try {
      const result = await runPosSync();
      await refreshPending();
      if (result.synced > 0) {
        const heldNote =
          result.held > 0
            ? ` (${result.held} held due to stock — confirm later)`
            : "";
        toast.success(`Synced ${result.synced} offline sale(s)${heldNote}`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} offline sale(s) failed to sync — check Transactions`);
      }
      if (result.synced === 0 && result.failed === 0 && result.pendingLeft > 0) {
        // Still pending (e.g. network blip) — nudge user
        toast.message(`${result.pendingLeft} sale(s) waiting to sync`);
      }
    } catch {
      /* network mid-sync */
    } finally {
      setSyncing(false);
      await refreshPending();
    }
  }, [refreshPending]);

  useEffect(() => {
    setOnline(isOnline());
    void refreshPending();

    const onOnline = () => {
      setOnline(true);
      void syncNow();
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const interval = window.setInterval(() => {
      if (isOnline()) void syncNow();
      else void refreshPending();
    }, 30000);

    const onFocus = () => {
      if (isOnline()) void syncNow();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(interval);
    };
  }, [refreshPending, syncNow]);

  const value = useMemo(
    () => ({ online, pending, syncing, refreshPending, syncNow }),
    [online, pending, syncing, refreshPending, syncNow]
  );

  return (
    <PosOfflineContext.Provider value={value}>
      <PosOfflineBootstrap />
      {children}
    </PosOfflineContext.Provider>
  );
}

export function usePosOffline() {
  const ctx = useContext(PosOfflineContext);
  if (!ctx) {
    return {
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      pending: 0,
      syncing: false,
      refreshPending: async () => {},
      syncNow: async () => {},
    };
  }
  return ctx;
}
