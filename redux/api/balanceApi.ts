// src/redux/api/balanceApi.ts
import { baseApi } from "./baseApi";

export const balanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserBalance: builder.query<any, string>({
      query: (objectId) => `/transaction/balance/${objectId}`,
      providesTags: (_res, _err, objectId) => [{ type: "UserBalance", id: objectId }],
      // optional polling if you want another safety net:
      // pollInterval: 30000,
    }),
  }),
});

export const { useGetUserBalanceQuery } = balanceApi;
