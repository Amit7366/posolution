import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api", // <-- proxy
  prepareHeaders: (headers, { getState }) => {
    const token =
      (typeof window !== "undefined" && localStorage.getItem("accessToken")) ||
      (getState() as RootState).auth?.accessToken;

    // backend expects just the token (no 'Bearer ')
    if (token) headers.set("Authorization", token);
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: retry(rawBaseQuery, { maxRetries: 2 }),
  tagTypes: [
    "UserBalance",
    "GroupedGames",
    "GamesByProvider",
    "GamesByCategory",
    "Category",
    "SubCategory",
    "Brand",
    "Unit",
    "VariantAttribute",
    "Product",
    "Store",
    "Warehouse",
    "Warranty",
    "Invoice",
    "SalesReturn",
    "Dashboard",
    "Payment",
    "Subscription",
  ],
  endpoints: (builder) => ({
    // Example dashboard endpoint (keep if used elsewhere)
    getDashboard: builder.query({
      query: (id: string) => `/dashboard/${id}`,
      providesTags: ["UserBalance"],
    }),

    getDashboardSummary: builder.query<
      unknown,
      { chartRange?: "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" }
    >({
      query: ({ chartRange = "1W" }) => ({
        url: "/dashboard/summary",
        params: { chartRange },
      }),
      providesTags: ["Dashboard"],
    }),

    // Category endpoints
    getCategories: builder.query<
      any,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: ({ page = 1, limit = 20, search = "", status = "" }) => ({
        url: "/category",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["Category"],
    }),

    getCategoryById: builder.query<any, string>({
      query: (id) => `/category/${id}`,
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<any, any>({
      query: (body) => ({
        url: "/category",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/category/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),

    getSubCategories: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        categoryId?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 20,
        search = "",
        status = "",
        categoryId = "",
      }) => ({
        url: "/sub-category",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(categoryId ? { categoryId } : {}),
        },
      }),
      providesTags: ["SubCategory"],
    }),

    getSubCategoryById: builder.query<any, string>({
      query: (id) => `/sub-category/${id}`,
      providesTags: ["SubCategory"],
    }),

    createSubCategory: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/sub-category",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SubCategory"],
    }),

    updateSubCategory: builder.mutation<
      any,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `/sub-category/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SubCategory"],
    }),

    deleteSubCategory: builder.mutation<any, string>({
      query: (id) => ({
        url: `/sub-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubCategory"],
    }),

    getBrands: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortBy?: "createdAt" | "name";
        sortOrder?: "asc" | "desc";
      }
    >({
      query: ({
        page = 1,
        limit = 20,
        search = "",
        status = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      }) => ({
        url: "/brand",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          sortBy,
          sortOrder,
        },
      }),
      providesTags: ["Brand"],
    }),

    getBrandById: builder.query<any, string>({
      query: (id) => `/brand/${id}`,
      providesTags: ["Brand"],
    }),

    createBrand: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/brand",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Brand"],
    }),

    updateBrand: builder.mutation<any, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/brand/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Brand"],
    }),

    deleteBrand: builder.mutation<any, string>({
      query: (id) => ({
        url: `/brand/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Brand"],
    }),

    getUnits: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortBy?: "createdAt" | "name" | "shortName";
        sortOrder?: "asc" | "desc";
        withCounts?: boolean;
      }
    >({
      query: ({
        page = 1,
        limit = 20,
        search = "",
        status = "",
        sortBy = "createdAt",
        sortOrder = "desc",
        withCounts = true,
      }) => ({
        url: "/unit",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          sortBy,
          sortOrder,
          ...(withCounts ? { withCounts: true } : {}),
        },
      }),
      providesTags: ["Unit"],
    }),

    getUnitById: builder.query<any, string>({
      query: (id) => `/unit/${id}`,
      providesTags: ["Unit"],
    }),

    createUnit: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/unit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Unit"],
    }),

    updateUnit: builder.mutation<any, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/unit/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Unit"],
    }),

    deleteUnit: builder.mutation<any, string>({
      query: (id) => ({
        url: `/unit/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Unit"],
    }),

    // Variant Attribute endpoints
    getVariantAttributes: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortBy?: "createdAt" | "name";
        sortOrder?: "asc" | "desc";
      }
    >({
      query: ({
        page = 1,
        limit = 20,
        search = "",
        status = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      }) => ({
        url: "/variant-attribute",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          sortBy,
          sortOrder,
        },
      }),
      providesTags: ["VariantAttribute"],
    }),

    getVariantAttributeById: builder.query<any, string>({
      query: (id) => `/variant-attribute/${id}`,
      providesTags: ["VariantAttribute"],
    }),

    createVariantAttribute: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/variant-attribute",
        method: "POST",
        body,
      }),
      invalidatesTags: ["VariantAttribute"],
    }),

    updateVariantAttribute: builder.mutation<
      any,
      { id: string; body: Record<string, unknown> }
    >({
      query: ({ id, body }) => ({
        url: `/variant-attribute/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["VariantAttribute"],
    }),

    deleteVariantAttribute: builder.mutation<any, string>({
      query: (id) => ({
        url: `/variant-attribute/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VariantAttribute"],
    }),

    getStores: builder.query<
      any,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: ({ page = 1, limit = 200, search = "", status = "" }) => ({
        url: "/store",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: ["Store"],
    }),

    getWarehouses: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        storeId?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 200,
        search = "",
        status = "",
        storeId = "",
      }) => ({
        url: "/warehouse",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(storeId ? { storeId } : {}),
        },
      }),
      providesTags: ["Warehouse"],
    }),

    getWarranties: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortBy?: "createdAt" | "name" | "duration";
        sortOrder?: "asc" | "desc";
      }
    >({
      query: ({
        page = 1,
        limit = 200,
        search = "",
        status = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      }) => ({
        url: "/warranty",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          sortBy,
          sortOrder,
        },
      }),
      providesTags: ["Warranty"],
    }),

    getWarrantyById: builder.query<any, string>({
      query: (id) => `/warranty/${id}`,
      providesTags: ["Warranty"],
    }),

    createWarranty: builder.mutation<
      any,
      {
        name: string;
        duration: number;
        period: "day" | "week" | "month" | "year";
        description: string;
        status?: "active" | "inactive";
      }
    >({
      query: (body) => ({
        url: "/warranty",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warranty"],
    }),

    updateWarranty: builder.mutation<
      any,
      {
        id: string;
        body: Partial<{
          name: string;
          duration: number;
          period: "day" | "week" | "month" | "year";
          description: string;
          status: "active" | "inactive";
        }>;
      }
    >({
      query: ({ id, body }) => ({
        url: `/warranty/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Warranty"],
    }),

    deleteWarranty: builder.mutation<any, string>({
      query: (id) => ({
        url: `/warranty/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warranty"],
    }),

    getProducts: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        storeId?: string;
        warehouseId?: string;
        categoryId?: string;
        subCategoryId?: string;
        brandId?: string;
        unitId?: string;
        productId?: string;
        sortBy?: "createdAt" | "name" | "price" | "expiryOn" | "quantity";
        sortOrder?: "asc" | "desc";
        /** Server: only products past expiryOn */
        expiredOnly?: boolean;
        /** Server: quantity at or below threshold */
        lowStockOnly?: boolean;
        /** Default threshold when product has no lowStockThreshold (server default 10) */
        stockThreshold?: number;
      }
    >({
      query: ({
        page = 1,
        limit = 20,
        search = "",
        status = "",
        storeId = "",
        warehouseId = "",
        categoryId = "",
        subCategoryId = "",
        brandId = "",
        unitId = "",
        productId = "",
        sortBy = "createdAt",
        sortOrder = "desc",
        expiredOnly = false,
        lowStockOnly = false,
        stockThreshold,
      }) => ({
        url: "/product",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(storeId ? { storeId } : {}),
          ...(warehouseId ? { warehouseId } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(subCategoryId ? { subCategoryId } : {}),
          ...(brandId ? { brandId } : {}),
          ...(unitId ? { unitId } : {}),
          ...(productId ? { productId } : {}),
          sortBy,
          sortOrder,
          ...(expiredOnly ? { expiredOnly: "true" } : {}),
          ...(lowStockOnly ? { lowStockOnly: "true" } : {}),
          ...(typeof stockThreshold === "number" ? { stockThreshold } : {}),
        },
      }),
      providesTags: ["Product"],
    }),

    getProductById: builder.query<any, string>({
      query: (id) => `/product/${id}`,
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/product",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),

    updateProduct: builder.mutation<any, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/product/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),

    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),

    getInvoices: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: "all" | "paid" | "unpaid" | "overdue";
        since?: string;
        customer?: string;
      }
    >({
      query: ({ page = 1, limit = 20, search = "", status = "all", since, customer }) => ({
        url: "/invoice",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status && status !== "all" ? { status } : {}),
          ...(since ? { since } : {}),
          ...(customer ? { customer } : {}),
        },
      }),
      providesTags: ["Invoice"],
    }),

    getInvoiceById: builder.query<any, string>({
      query: (id) => `/invoice/${id}`,
      providesTags: ["Invoice"],
    }),

    createInvoice: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/invoice",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invoice", "Product", "Dashboard"],
    }),

    updateInvoice: builder.mutation<any, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/invoice/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Invoice", "Product"],
    }),

    deleteInvoice: builder.mutation<any, string>({
      query: (id) => ({
        url: `/invoice/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Invoice", "Product", "Dashboard"],
    }),

    getSalesReturns: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        returnStatus?: "all" | "pending" | "received";
        paymentStatus?: "all" | "paid" | "unpaid" | "overdue";
        since?: string;
        customer?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 20,
        search = "",
        returnStatus = "all",
        paymentStatus = "all",
        since,
        customer,
      }) => ({
        url: "/sales-return",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(returnStatus !== "all" ? { returnStatus } : {}),
          ...(paymentStatus !== "all" ? { paymentStatus } : {}),
          ...(since ? { since } : {}),
          ...(customer ? { customer } : {}),
        },
      }),
      providesTags: ["SalesReturn"],
    }),

    getSalesReturnById: builder.query<any, string>({
      query: (id) => `/sales-return/${id}`,
      providesTags: ["SalesReturn"],
    }),

    createSalesReturn: builder.mutation<any, Record<string, unknown>>({
      query: (body) => ({
        url: "/sales-return",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SalesReturn", "Product", "Dashboard"],
    }),

    updateSalesReturn: builder.mutation<any, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({
        url: `/sales-return/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SalesReturn", "Product", "Dashboard"],
    }),

    deleteSalesReturn: builder.mutation<any, string>({
      query: (id) => ({
        url: `/sales-return/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesReturn", "Product", "Dashboard"],
    }),

    // ── Subscription ─────────────────────────────────────────────────────────
    getSubscriptionStatus: builder.query<any, void>({
      query: () => "/subscription",
      providesTags: ["Subscription"],
    }),

    // ── Payment (user) ────────────────────────────────────────────────────────
    submitPayment: builder.mutation<any, {
      paymentMedium: "bkash" | "nagad" | "rocket" | "bank";
      amount: number;
      transactionId: string;
      senderNumber?: string;
      bankAccountName?: string;
      bankAccountNumber?: string;
      bankName?: string;
      bankBranchName?: string;
    }>({
      query: (body) => ({
        url: "/payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment", "Subscription"],
    }),

    getMyPayments: builder.query<any, void>({
      query: () => "/payment",
      providesTags: ["Payment"],
    }),

    // ── Payment (admin) ───────────────────────────────────────────────────────
    getAllPayments: builder.query<
      any,
      { page?: number; limit?: number; status?: string; tenantId?: string }
    >({
      query: ({ page = 1, limit = 20, status, tenantId } = {}) => ({
        url: "/payment/all",
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
          ...(tenantId ? { tenantId } : {}),
        },
      }),
      providesTags: ["Payment"],
    }),

    approvePayment: builder.mutation<any, { id: string; note?: string; subscriptionDays?: number }>({
      query: ({ id, ...body }) => ({
        url: `/payment/${id}/approve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Payment", "Subscription"],
    }),

    rejectPayment: builder.mutation<any, { id: string; note?: string }>({
      query: ({ id, ...body }) => ({
        url: `/payment/${id}/reject`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetDashboardSummaryQuery,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSubCategoriesQuery,
  useGetSubCategoryByIdQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetUnitsQuery,
  useGetUnitByIdQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,

  useGetVariantAttributesQuery,
  useGetVariantAttributeByIdQuery,
  useCreateVariantAttributeMutation,
  useUpdateVariantAttributeMutation,
  useDeleteVariantAttributeMutation,

  useGetStoresQuery,
  useGetWarehousesQuery,
  useGetWarrantiesQuery,
  useGetWarrantyByIdQuery,
  useCreateWarrantyMutation,
  useUpdateWarrantyMutation,
  useDeleteWarrantyMutation,
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,

  useGetSalesReturnsQuery,
  useGetSalesReturnByIdQuery,
  useCreateSalesReturnMutation,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,

  useGetSubscriptionStatusQuery,
  useSubmitPaymentMutation,
  useGetMyPaymentsQuery,
  useGetAllPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
} = baseApi;
