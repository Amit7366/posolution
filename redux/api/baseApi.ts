import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api", // <-- proxy
  prepareHeaders: (headers, { getState }) => {
    const token =
      (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
      (getState() as RootState).auth?.accessToken;

    // your backend expects just the token (no 'Bearer ')
    if (token) headers.set("Authorization", token);
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: retry(rawBaseQuery, { maxRetries: 2 }),
  tagTypes: ["UserBalance", "GroupedGames", "GamesByProvider", "GamesByCategory"],
   endpoints: (builder) => ({
    // ✅ Fetch dashboard data for TopNav (auto-refetch on invalidation)
    getDashboard: builder.query({
      query: (id: string) => `/dashboard/${id}`,
      providesTags: ["UserBalance"], // 🔹 attaches this data to the "UserBalance" tag
    }),
  }),
});

export const { useGetDashboardQuery } = baseApi;
