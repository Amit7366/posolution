"use client";

import { AppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { persistor } from "@/redux/persistor";
import Cookies from "js-cookie";

export const logoutUser = async (dispatch: AppDispatch, redirect?: () => void) => {
  try {
    // Remove token from localStorage or cookies
    // deleteFromLocalStorage("accessToken");
    // Cookies.remove("accessToken");

    // Purge Redux persist store (if used)
    await persistor.purge();

    // Dispatch Redux logout
    dispatch(logout());

    // Feedback
    toast.success("লগ আউট সফল!");

    // Redirect (optional)
    if (redirect) redirect();
  } catch (err) {
    toast.error("Logout failed.");
    console.error("Logout error:", err);
  }
};
