"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import JsBarcode from "jsbarcode";
import { useTheme } from "next-themes";
import Section from "./_components/Section";
import ImageUploader from "./_components/ImageUploader";

type Role = "admin" | "user";

const ProductSchema = z.object({
  store: z.string().min(1, "Required"),
  productName: z.string().min(1, "Required"),
  sku: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  subcategory: z.string().min(1, "Required"),
  price: z.string().optional(),
  quantity: z.string().optional(),
});

type ProductForm = z.infer<typeof ProductSchema>;

export default function CreateProduct({ role }: { role?: Role }) {
  const { theme, setTheme } = useTheme();
  const [subcategories, setSubcategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [barcodeValue, setBarcodeValue] = useState<string>("");
  const barcodeRef = useRef<SVGSVGElement | null>(null);

  const {
    control,
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      store: "",
      productName: "",
      sku: "",
      category: "",
      subcategory: "",
      price: "",
      quantity: "",
    },
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    // fetch subcategories when category changes
    if (!selectedCategory) {
      setSubcategories([]);
      setValue("subcategory", "");
      return;
    }
    fetch(`/api/categories?categoryId=${selectedCategory}`)
      .then((r) => r.json())
      .then((data) => {
        setSubcategories(data);
        if (data.length === 0) setValue("subcategory", "");
      })
      .catch(() => setSubcategories([]));
  }, [selectedCategory, setValue]);

  // render barcode when barcodeValue changes
  useEffect(() => {
    if (!barcodeRef.current) return;
    if (!barcodeValue) {
      // clear
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

  const generateSKU = (prefix = "SKU") => {
    // Simple SKU: PREFIX + timestamp base36 + random(2)
    const sku = `${prefix}-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;
    setValue("sku", sku);
    setBarcodeValue(sku);
  };

  const onSubmit = (data: ProductForm) => {
    console.log("submit", data);
    // TODO: send to backend
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Product
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create new product
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
          >
            Toggle {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-md">
            Back to Product
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Product Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Store *</span>
                <select
                  {...register("store")}
                  className="mt-1 block w-full rounded border px-3 py-2"
                >
                  <option value="">Select</option>
                  <option value="s1">Main Store</option>
                </select>
                {errors.store && (
                  <p className="text-xs text-red-500">{errors.store.message}</p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium">Product Name *</span>
                <input
                  {...register("productName")}
                  className="mt-1 block w-full rounded border px-3 py-2"
                />
                {errors.productName && (
                  <p className="text-xs text-red-500">
                    {errors.productName.message}
                  </p>
                )}
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block">
                    <span className="text-sm font-medium">SKU *</span>
                    <input
                      {...register("sku")}
                      className="mt-1 block w-full rounded border px-3 py-2"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => generateSKU("PRD")}
                  className="px-3 py-2 bg-orange-500 text-white rounded-md"
                >
                  Generate
                </button>
              </div>

              <label className="block">
                <span className="text-sm font-medium">Category *</span>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full rounded border px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option value="c1">Electronics</option>
                      <option value="c2">Accessories</option>
                    </select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium">Brand *</span>
                <select className="mt-1 block w-full rounded border px-3 py-2">
                  <option>Select</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Barcode Symbology *</span>
                <select className="mt-1 block w-full rounded border px-3 py-2">
                  <option>CODE128</option>
                  <option>EAN13</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Warehouse *</span>
                <select className="mt-1 block w-full rounded border px-3 py-2">
                  <option>Select</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Slug *</span>
                <input className="mt-1 block w-full rounded border px-3 py-2" />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Selling Type *</span>
                <select className="mt-1 block w-full rounded border px-3 py-2">
                  <option>Select</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Sub Category *</span>
                <select
                  {...register("subcategory")}
                  className="mt-1 block w-full rounded border px-3 py-2"
                >
                  <option value="">Select</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.subcategory && (
                  <p className="text-xs text-red-500">
                    {errors.subcategory.message}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium">Unit *</span>
                <select className="mt-1 block w-full rounded border px-3 py-2">
                  <option>Select</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Item Barcode *</span>
                <input
                  onChange={(e) => setBarcodeValue(e.target.value)}
                  className="mt-1 block w-full rounded border px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Or generate using SKU
                </p>
              </label>
            </div>
          </div>

          {/* barcode preview */}
          <div className="mt-4 flex items-center gap-6">
            <div>
              <div className="text-sm font-medium mb-2">Barcode Preview</div>
              <svg ref={barcodeRef} />
            </div>
            <div>
              <button
                type="button"
                onClick={() =>
                  setBarcodeValue((prev) => prev || (watch("sku") as string))
                }
                className="px-3 py-2 bg-gray-100 rounded-md"
              >
                Render from SKU
              </button>
            </div>
          </div>
        </Section>

        <Section title="Pricing & Stocks">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="block">
              <span className="text-sm font-medium">Quantity *</span>
              <input
                {...register("quantity")}
                className="mt-1 block w-full rounded border px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Price *</span>
              <input
                {...register("price")}
                className="mt-1 block w-full rounded border px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Tax Type *</span>
              <select className="mt-1 block w-full rounded border px-3 py-2">
                <option>Select</option>
              </select>
            </label>
          </div>
        </Section>

        <Section title="Images">
          <ImageUploader />
        </Section>

        <Section title="Custom Fields">
          {/* Toggle Checkboxes */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-900 rounded-md p-4 border dark:border-gray-700">
            <div className="flex items-center gap-8 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                Warranties
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                Manufacturer
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                Expiry
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warranty */}
            <label className="block">
              <span className="text-sm font-medium">Warranty *</span>
              <select className="mt-1 block w-full rounded border px-3 py-2">
                <option>Select</option>
                <option>6 Months</option>
                <option>1 Year</option>
                <option>2 Years</option>
              </select>
            </label>

            {/* Manufacturer */}
            <label className="block">
              <span className="text-sm font-medium">Manufacturer *</span>
              <input
                type="text"
                className="mt-1 block w-full rounded border px-3 py-2"
                placeholder="Brand / Company Name"
              />
            </label>

            {/* Manufactured Date */}
            <label className="block">
              <span className="text-sm font-medium">Manufactured Date *</span>
              <div className="relative">
                <input
                  type="date"
                  className="mt-1 block w-full rounded border px-3 py-2"
                />
              </div>
            </label>

            {/* Expiry Date */}
            <label className="block">
              <span className="text-sm font-medium">Expiry On *</span>
              <div className="relative">
                <input
                  type="date"
                  className="mt-1 block w-full rounded border px-3 py-2"
                />
              </div>
            </label>
          </div>

          {/* Footer Buttons */}
          {/* <div className="flex justify-end mt-6 gap-3">
            <button type="button" className="px-4 py-2 border rounded-md">
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-md"
            >
              Add Product
            </button>
          </div> */}
        </Section>

        <div className="flex justify-end gap-3">
          <button type="button" className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-orange-600 text-white rounded-md"
          >
            Submit Product
          </button>
        </div>
      </form>
    </div>
  );
}
