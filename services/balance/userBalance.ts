// src/services/balance/useLiveBalance.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { connectSocket, subscribeBalance } from "./balanceClient";

type BalanceResponse = { data?: { currentBalance?: number } };

export function useLiveBalance(
  memberId: string,
  initialBalance: number,
  authToken: string
) {
  const [balance, setBalance] = useState<number>(initialBalance ?? 0);
  const fetchAbortRef = useRef<AbortController | null>(null);

  // 🔁 Keep in sync with RTK Query updates
  useEffect(() => {
    if (typeof initialBalance === "number" && !Number.isNaN(initialBalance)) {
      setBalance((prev) => (prev !== initialBalance ? initialBalance : prev));
    }
  }, [initialBalance]);

  useEffect(() => {
    if (!memberId || !authToken) return;

    const socket = connectSocket(authToken);

    const refreshFromApi = async () => {
      fetchAbortRef.current?.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      try {
        const res = await fetch(`/api/transaction/balance/${memberId}`, {
          headers: {
            // If backend expects "Bearer", change to `Bearer ${authToken}`
            Authorization: `${authToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result: BalanceResponse = await res.json();
        const next = result?.data?.currentBalance ?? 0;
        setBalance(next);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          // keep last known balance on errors
        }
      }
    };

    // Initial + reconnect
    socket.on("connect", refreshFromApi);

    // Live pushes
    const unsub = subscribeBalance(memberId, (bal: string | number) => {
      const n = typeof bal === "number" ? bal : Number(bal);
      if (!Number.isNaN(n)) setBalance(n);
    });

    // 🔁 Refresh when tab is focused/visible again
    const onFocus = () => refreshFromApi();
    const onVis = () => document.visibilityState === "visible" && refreshFromApi();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      socket.off("connect", refreshFromApi);
      unsub?.();
      fetchAbortRef.current?.abort();
    };
  }, [memberId, authToken]);

  return balance;
}
