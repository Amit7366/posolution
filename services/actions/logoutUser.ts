"use client";

import { AppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { persistor } from "@/redux/persistor";
import { authKey } from "@/constants/authKey";
import { removeFromLocalStorage } from "@/utils/local-storage";

export const logoutUser = async (
  dispatch: AppDispatch,
  redirect?: () => void
) => {
  try {
    // Clear httpOnly cookies via Next server route.
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => null);

    // Clear client-side token copies.
    removeFromLocalStorage(authKey);

    // Purge Redux persist store (if used)
    await persistor.purge();

    // Dispatch Redux logout
    dispatch(logout());

    toast.success("Logged out successfully.");

    // Redirect (optional)
    if (redirect) redirect();
  } catch (err) {
    toast.error("Logout failed.");
    console.error("Logout error:", err);
  }
};
