import { baseApi } from "./baseApi";


export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPromotionSummary: builder.query<any, string>({
      query: (adminId) => `/admins/promotion-summary/${adminId}`,
    }),
  }),
});

export const { useGetAdminPromotionSummaryQuery } = adminApi;
