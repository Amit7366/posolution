"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import JsBarcode from "jsbarcode";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Section from "./_components/Section";
import ImageUploader from "./_components/ImageUploader";
import {
  useCreateProductMutation,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductByIdQuery,
  useGetStoresQuery,
  useGetSubCategoriesQuery,
  useGetUnitsQuery,
  useGetVariantAttributesQuery,
  useGetWarehousesQuery,
  useGetWarrantiesQuery,
  useUpdateProductMutation,
} from "@/redux/api/baseApi";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function idOf(ref: unknown): string {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  if (typeof ref === "object" && ref !== null && "_id" in ref) {
    const v = (ref as { _id: unknown })._id;
    if (typeof v === "object" && v !== null && "toString" in v) {
      return String((v as { toString(): string }).toString());
    }
    return String(v);
  }
  return "";
}

/** RTK `data` is the API JSON body; `data` may be the list or nested once more */
function listFromApiPayload(payload: unknown): any[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as { data?: unknown };
  const d = p.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === "object" && "data" in (d as object)) {
    const inner = (d as { data?: unknown }).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

function toastMutationError(e: unknown, fallback: string) {
  const data = (e as { data?: { message?: string; errorSources?: { path: string; message: string }[] } })
    ?.data;
  const msg = data?.message;
  const details = data?.errorSources?.length
    ? data.errorSources.map((s) => `${s.path}: ${s.message}`).join(", ")
    : undefined;
  toast.error(details ? `${msg ?? fallback} (${details})` : msg ?? fallback);
}

type ProductForm = {
  storeId?: string;
  warehouseId?: string;
  productName: string;
  slug: string;
  sku: string;
  sellingType: "single" | "variant";
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  unitId: string;
  barcodeSymbology: "CODE128" | "EAN13" | "UPC" | "QR";
  itemBarcode?: string;
  quantity: string;
  price: string;
  taxType?: string;
  warrantyId?: string;
  manufacturer?: string;
  manufacturedDate?: string;
  expiryOn?: string;
  description?: string;
  status: "active" | "inactive";
  variantAttributeId?: string;
  variantValues?: string;
};

export default function CreateProductPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const productSchema = useMemo(
    () =>
      z.object({
        storeId: z.string().optional(),
        warehouseId: z.string().optional(),
        productName: z.string().min(2, t("dash.common.required")),
        slug: z.string().min(2, t("dash.common.required")),
        sku: z.string().min(2, t("dash.common.required")),
        sellingType: z.enum(["single", "variant"]),
        categoryId: z.string().optional(),
        subCategoryId: z.string().optional(),
        brandId: z.string().optional(),
        unitId: z.string().min(1, t("dash.common.required")),
        barcodeSymbology: z.enum(["CODE128", "EAN13", "UPC", "QR"]),
        itemBarcode: z.string().optional(),
        quantity: z.string().min(1, t("dash.common.required")),
        price: z.string().min(1, t("dash.common.required")),
        taxType: z.string().optional(),
        warrantyId: z.string().optional(),
        manufacturer: z.string().optional(),
        manufacturedDate: z.string().optional(),
        expiryOn: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "inactive"]),
        variantAttributeId: z.string().optional(),
        variantValues: z.string().optional(),
      }),
    [t]
  );

  const queryErrMessage = (err: unknown) => {
    if (!err) return t("dash.common.failedLoadGeneric");
    if (typeof err === "object" && err !== null && "data" in err) {
      const d = (err as { data?: { message?: string } }).data;
      if (d?.message) return String(d.message);
    }
    return t("dash.common.failedLoadGeneric");
  };

  const [barcodeValue, setBarcodeValue] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { data: storePayload } = useGetStoresQuery({ page: 1, limit: 200 });
  const stores = useMemo(() => listFromApiPayload(storePayload), [storePayload]);

  const {
    data: catPayload,
    isError: catError,
    error: catErr,
  } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const categories = useMemo(() => listFromApiPayload(catPayload), [catPayload]);

  const { data: brandPayload } = useGetBrandsQuery({
    page: 1,
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });
  const brands = useMemo(() => listFromApiPayload(brandPayload), [brandPayload]);

  const { data: unitPayload } = useGetUnitsQuery({
    page: 1,
    limit: 200,
    withCounts: false,
    sortBy: "name",
    sortOrder: "asc",
  });
  const units = useMemo(() => listFromApiPayload(unitPayload), [unitPayload]);

  const { data: warrantyPayload } = useGetWarrantiesQuery({
    page: 1,
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });
  const warranties = useMemo(() => listFromApiPayload(warrantyPayload), [warrantyPayload]);

  const { data: vaPayload } = useGetVariantAttributesQuery({
    page: 1,
    limit: 200,
    sortBy: "name",
    sortOrder: "asc",
  });
  const variantAttrs = useMemo(() => listFromApiPayload(vaPayload), [vaPayload]);

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      storeId: "",
      warehouseId: "",
      productName: "",
      slug: "",
      sku: "",
      sellingType: "single",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      unitId: "",
      barcodeSymbology: "CODE128",
      itemBarcode: "",
      quantity: "0",
      price: "0",
      taxType: "",
      warrantyId: "",
      manufacturer: "",
      manufacturedDate: "",
      expiryOn: "",
      description: "",
      status: "active",
      variantAttributeId: "",
      variantValues: "",
    },
  });

  const selectedStore = watch("storeId");
  const selectedCategory = watch("categoryId");
  const itemBarcodeField = register("itemBarcode");

  const { data: whPayload } = useGetWarehousesQuery({
    page: 1,
    limit: 200,
    ...(selectedStore ? { storeId: selectedStore } : {}),
  });
  const warehouses = useMemo(() => listFromApiPayload(whPayload), [whPayload]);

  const {
    data: subPayload,
    isError: subCatError,
    error: subCatErr,
  } = useGetSubCategoriesQuery(
    { page: 1, limit: 200, categoryId: selectedCategory || undefined },
    { skip: !selectedCategory }
  );
  const subcategories = useMemo(() => listFromApiPayload(subPayload), [subPayload]);

  const { data: productApi, isLoading: loadingProduct } = useGetProductByIdQuery(editId!, {
    skip: !editId,
  });
  const existing = (productApi as { data?: Record<string, unknown> } | undefined)?.data as
    | Record<string, unknown>
    | undefined;

  useEffect(() => {
    if (!existing || !editId) return;

    const md =
      existing.manufacturedDate instanceof Date
        ? existing.manufacturedDate.toISOString().slice(0, 10)
        : typeof existing.manufacturedDate === "string"
          ? String(existing.manufacturedDate).slice(0, 10)
          : "";
    const ex =
      existing.expiryOn instanceof Date
        ? existing.expiryOn.toISOString().slice(0, 10)
        : typeof existing.expiryOn === "string"
          ? String(existing.expiryOn).slice(0, 10)
          : "";

    const v0 = Array.isArray(existing.variants) ? (existing.variants as { attributeId?: unknown }[])[0] : null;
    const vAttrId = v0 ? idOf(v0.attributeId) : "";

    reset({
      storeId: idOf(existing.storeId),
      warehouseId: idOf(existing.warehouseId),
      productName: String(existing.name ?? ""),
      slug: String(existing.slug ?? ""),
      sku: String(existing.sku ?? ""),
      sellingType: (existing.sellingType === "variant" ? "variant" : "single") as "single" | "variant",
      categoryId: idOf(existing.categoryId),
      subCategoryId: idOf(existing.subCategoryId) || "",
      brandId: idOf(existing.brandId) || "",
      unitId: idOf(existing.unitId),
      barcodeSymbology: (String(existing.barcodeSymbology || "CODE128") as ProductForm["barcodeSymbology"]),
      itemBarcode: String(existing.itemBarcode ?? ""),
      quantity: String(existing.quantity ?? 0),
      price: String(existing.price ?? 0),
      taxType: String(existing.taxType ?? ""),
      warrantyId: idOf(existing.warrantyId) || "",
      manufacturer: String(existing.manufacturer ?? ""),
      manufacturedDate: md,
      expiryOn: ex,
      description: String(existing.description ?? ""),
      status: (existing.status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      variantAttributeId: vAttrId,
      variantValues: "",
    });

    setBarcodeValue(String(existing.itemBarcode ?? ""));
    const imgs = existing.images;
    if (Array.isArray(imgs)) {
      setImageUrls(
        imgs.filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      );
    } else setImageUrls([]);
  }, [existing, editId, reset]);

  useEffect(() => {
    if (!selectedStore) {
      setValue("warehouseId", "");
    }
  }, [selectedStore, setValue]);

  useEffect(() => {
    if (!selectedCategory) {
      setValue("subCategoryId", "");
    }
  }, [selectedCategory, setValue]);

  const productName = watch("productName");
  useEffect(() => {
    if (editId) return;
    if (productName?.trim()) {
      setValue("slug", slugify(productName), { shouldValidate: true });
    }
  }, [productName, setValue, editId]);

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const submitting = creating || updating;

  const barcodeRef = React.useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!barcodeRef.current) return;
    if (!barcodeValue) {
      barcodeRef.current.innerHTML = "";
      return;
    }
    try {
      JsBarcode(barcodeRef.current, barcodeValue, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
      });
    } catch (e) {
      console.error("barcode render err", e);
    }
  }, [barcodeValue]);

  const generateSKU = (prefix = "PRD") => {
    const sku = `${prefix}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;
    setValue("sku", sku);
    setBarcodeValue(sku);
  };

  const onSubmit = async (data: ProductForm) => {
    const qty = Number(data.quantity);
    const price = Number(data.price);
    if (!Number.isFinite(qty) || qty < 0) {
      toast.error(t("dash.productCreate.invalidQty"));
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error(t("dash.productCreate.invalidPrice"));
      return;
    }

    const safeImages = imageUrls.filter(
      (u): u is string => typeof u === "string" && u.trim().length > 0
    );

    const body: Record<string, unknown> = {
      name: data.productName.trim(),
      slug: data.slug.trim(),
      sku: data.sku.trim(),
      sellingType: data.sellingType,
      unitId: data.unitId,
      barcodeSymbology: data.barcodeSymbology,
      quantity: qty,
      price,
      status: data.status,
      images: safeImages,
    };

    if (data.storeId?.trim()) body.storeId = data.storeId.trim();
    if (data.warehouseId?.trim()) body.warehouseId = data.warehouseId.trim();
    if (data.categoryId?.trim()) body.categoryId = data.categoryId.trim();
    if (data.subCategoryId?.trim()) body.subCategoryId = data.subCategoryId.trim();
    if (data.brandId?.trim()) body.brandId = data.brandId.trim();
    if (data.itemBarcode?.trim()) body.itemBarcode = data.itemBarcode.trim();
    if (data.taxType?.trim()) body.taxType = data.taxType.trim();
    if (data.description?.trim()) body.description = data.description.trim();
    if (data.warrantyId?.trim()) body.warrantyId = data.warrantyId.trim();
    if (data.manufacturer?.trim()) body.manufacturer = data.manufacturer.trim();
    if (data.manufacturedDate) body.manufacturedDate = data.manufacturedDate;
    if (data.expiryOn) body.expiryOn = data.expiryOn;

    if (data.variantAttributeId?.trim() && data.variantValues?.trim()) {
      const values = data.variantValues
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (values.length) {
        body.variants = [{ attributeId: data.variantAttributeId.trim(), values }];
      }
    }

    try {
      if (editId) {
        await updateProduct({ id: editId, body }).unwrap();
        toast.success(t("dash.productCreate.updated"));
      } else {
        await createProduct(body).unwrap();
        toast.success(t("dash.productCreate.created"));
      }
      router.push("/dashboard/products");
    } catch (e) {
      toastMutationError(e, editId ? t("dash.common.updateFailed") : t("dash.common.createFailed"));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editId ? t("dash.productCreate.titleEdit") : t("dash.productCreate.titleCreate")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {editId ? t("dash.productCreate.subtitleEdit") : t("dash.productCreate.subtitleCreate")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
          >
            {t("dash.productCreate.togglePrefix")}{" "}
            {theme === "dark" ? t("dash.productCreate.toggleLight") : t("dash.productCreate.toggleDark")}
          </button>
          <Link href="/dashboard/products" className="px-4 py-2 bg-orange-600 text-white rounded-md">
            {t("dash.productCreate.backToProducts")}
          </Link>
        </div>
      </div>

      {loadingProduct && editId ? (
        <p className="text-sm text-gray-500 mb-4">{t("dash.productCreate.loading")}</p>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title={t("dash.productCreate.sectionInfo")}>
          {catError ? (
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              {t("dash.productCreate.errCategories")}: {queryErrMessage(catErr)}
            </p>
          ) : null}
          {subCatError && selectedCategory ? (
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              {t("dash.productCreate.errSubCategories")}: {queryErrMessage(subCatErr)}
            </p>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelStore")}</span>
                <select {...register("storeId")} className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
                  <option value="">{t("dash.productCreate.none")}</option>
                  {stores.map((s: { _id?: string; name?: string }) => (
                    <option key={String(s._id)} value={String(s._id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.storeId && <p className="text-xs text-red-500">{errors.storeId.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelProductName")}</span>
                <input
                  {...register("productName")}
                  className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                />
                {errors.productName && <p className="text-xs text-red-500">{errors.productName.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelSlug")}</span>
                <input
                  {...register("slug")}
                  className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block">
                    <span className="text-sm font-medium">{t("dash.productCreate.labelSku")}</span>
                    <input
                      {...register("sku")}
                      className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => generateSKU("PRD")}
                  className="px-3 py-2 bg-orange-500 text-white rounded-md mt-6"
                >
                  {t("dash.productCreate.generate")}
                </button>
              </div>
              {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelCategory")}</span>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                    >
                      <option value="">{t("dash.productCreate.none")}</option>
                      {categories.map((c: { _id?: string; name?: string }) => (
                        <option key={String(c._id)} value={String(c._id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelBrand")}</span>
                <select
                  {...register("brandId")}
                  className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="">{t("dash.productCreate.none")}</option>
                  {brands.map((b: { _id?: string; name?: string }) => (
                    <option key={String(b._id)} value={String(b._id)}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelBarcodeSymbology")}</span>
                <select
                  {...register("barcodeSymbology")}
                  className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="CODE128">CODE128</option>
                  <option value="EAN13">EAN13</option>
                  <option value="UPC">UPC</option>
                  <option value="QR">QR</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelWarehouse")}</span>
                <select
                  {...register("warehouseId")}
                  className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="">{t("dash.productCreate.none")}</option>
                  {warehouses.map((w: { _id?: string; name?: string }) => (
                    <option key={String(w._id)} value={String(w._id)}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {errors.warehouseId && <p className="text-xs text-red-500">{errors.warehouseId.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelSellingType")}</span>
                <select
                  {...register("sellingType")}
                  className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="single">{t("dash.productCreate.sellingSingle")}</option>
                  <option value="variant">{t("dash.productCreate.sellingVariant")}</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelSubCategory")}</span>
                <select
                  {...register("subCategoryId")}
                  className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                  disabled={!selectedCategory}
                >
                  <option value="">{t("dash.productCreate.none")}</option>
                  {subcategories.map((s: { _id?: string; subCategoryName?: string; name?: string }) => (
                    <option key={String(s._id)} value={String(s._id)}>
                      {s.subCategoryName || s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelUnit")}</span>
                <select {...register("unitId")} className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
                  <option value="">{t("dash.common.select")}</option>
                  {units.map((u: { _id?: string; name?: string; shortName?: string }) => (
                    <option key={String(u._id)} value={String(u._id)}>
                      {u.name} ({u.shortName})
                    </option>
                  ))}
                </select>
                {errors.unitId && <p className="text-xs text-red-500">{errors.unitId.message}</p>}
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelItemBarcode")}</span>
                <input
                  {...itemBarcodeField}
                  onChange={(e) => {
                    itemBarcodeField.onChange(e);
                    setBarcodeValue(e.target.value);
                  }}
                  className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">{t("dash.productCreate.barcodeHint")}</p>
              </label>

              <label className="block">
                <span className="text-sm font-medium">{t("dash.productCreate.labelStatus")}</span>
                <select {...register("status")} className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600">
                  <option value="active">{t("dash.common.active")}</option>
                  <option value="inactive">{t("dash.common.inactive")}</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-6">
            <div>
              <div className="text-sm font-medium mb-2">{t("dash.productCreate.barcodePreview")}</div>
              <svg ref={barcodeRef} />
            </div>
            <div>
              <button
                type="button"
                onClick={() => setBarcodeValue((prev) => prev || watch("sku"))}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md"
              >
                {t("dash.productCreate.renderFromSku")}
              </button>
            </div>
          </div>
        </Section>

        <Section title={t("dash.productCreate.sectionPricing")}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelQuantity")}</span>
              <input
                {...register("quantity")}
                className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelPrice")}</span>
              <input
                {...register("price")}
                className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelTaxType")}</span>
              <input
                {...register("taxType")}
                className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
                placeholder={t("dash.productCreate.taxPlaceholder")}
              />
            </label>
          </div>
        </Section>

        <Section title={t("dash.productCreate.sectionVariant")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelVariantAttr")}</span>
              <select
                {...register("variantAttributeId")}
                className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="">{t("dash.productCreate.none")}</option>
                {variantAttrs.map((v: { _id?: string; name?: string }) => (
                  <option key={String(v._id)} value={String(v._id)}>
                    {v.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelVariantValues")}</span>
              <input
                {...register("variantValues")}
                placeholder={t("dash.productCreate.variantPlaceholder")}
                className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              />
            </label>
          </div>
        </Section>

        <Section title={t("dash.productCreate.sectionWarranty")}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelWarranty")}</span>
              <select
                {...register("warrantyId")}
                className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="">{t("dash.productCreate.none")}</option>
                {warranties.map(
                  (w: { _id?: string; name?: string; duration?: number; period?: string }) => (
                    <option key={String(w._id)} value={String(w._id)}>
                      {w.name}
                      {typeof w.duration === "number" && w.period
                        ? ` (${w.duration} ${w.period})`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelManufacturer")}</span>
              <input
                {...register("manufacturer")}
                className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelMfgDate")}</span>
              <input type="date" {...register("manufacturedDate")} className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("dash.productCreate.labelExpiry")}</span>
              <input type="date" {...register("expiryOn")} className="mt-1 block w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
            </label>
          </div>
        </Section>

        <Section title={t("dash.productCreate.sectionDescription")}>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-600"
            placeholder={t("dash.productCreate.descPlaceholder")}
          />
        </Section>

        <Section title={t("dash.productCreate.sectionImages")}>
          {(!editId || (existing && !loadingProduct)) && (
            <ImageUploader
              key={`${editId || "new"}-${imageUrls.join("|")}`}
              defaultUrls={imageUrls}
              onImagesChange={setImageUrls}
            />
          )}
        </Section>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/products" className="px-4 py-2 border rounded-md">
            {t("dash.common.cancel")}
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-orange-600 text-white rounded-md disabled:opacity-50"
          >
            {submitting
              ? t("dash.productCreate.saving")
              : editId
                ? t("dash.productCreate.submitUpdate")
                : t("dash.productCreate.submitCreate")}
          </button>
        </div>
      </form>
    </div>
  );
}
