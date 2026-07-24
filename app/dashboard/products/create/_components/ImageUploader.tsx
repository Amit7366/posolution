"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Uploaded = {
  url: string;
  public_id?: string;
};

function cloudinaryConfigured() {
  const c = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const p = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
  return Boolean(c && p);
}

export default function ImageUploader({
  onImagesChange,
  defaultUrls = [],
}: {
  onImagesChange?: (urls: string[]) => void;
  defaultUrls?: string[];
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const [images, setImages] = useState<Uploaded[]>(() =>
    defaultUrls
      .filter((url): url is string => typeof url === "string" && url.trim().length > 0)
      .map((url) => ({ url }))
  );
  const cbRef = useRef(onImagesChange);
  cbRef.current = onImagesChange;

  useEffect(() => {
    const urls = images
      .map((i) => i.url)
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    cbRef.current?.(urls);
  }, [images]);

  async function uploadViaLocalApi(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload/product-image", { method: "POST", body: form });
    const data = (await res.json().catch(() => null)) as { success?: boolean; url?: string; message?: string } | null;
    if (!res.ok || !data?.success || !data.url) {
      toast.error(data?.message || t("dash.productCreate.imgUploadFailed"));
      return null;
    }
    return data.url;
  }

  async function uploadViaCloudinary(file: File): Promise<string | null> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!.trim();
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!.trim();
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };
    if (!res.ok || !data.secure_url) {
      toast.error(data?.error?.message || t("dash.productCreate.cloudinaryFailed"));
      return null;
    }
    return data.secure_url;
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        let url: string | null = null;
        if (cloudinaryConfigured()) {
          url = await uploadViaCloudinary(file);
        }
        if (!url) {
          url = await uploadViaLocalApi(file);
        }
        if (url) {
          setImages((prev) => [...prev, { url }]);
        }
      } catch (err) {
        console.error("upload error", err);
        toast.error(t("dash.productCreate.couldNotUpload"));
      }
    }
    e.target.value = "";
  }

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {cloudinaryConfigured()
          ? t("dash.productCreate.imgCloudinaryNote")
          : t("dash.productCreate.imgLocalNote")}
      </p>
      <div className="flex flex-wrap gap-4 items-center">
        <label
          htmlFor={inputId}
          className="w-32 h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-600"
        >
          <Plus />
          <span className="text-xs">{t("dash.productCreate.addImages")}</span>
        </label>
        <input
          id={inputId}
          multiple
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFiles}
          className="sr-only"
        />

        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="relative w-32 h-32 border rounded-md overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              className="w-full h-full object-cover"
              alt={t("dash.productCreate.productImageAlt", { n: i + 1 })}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow"
              aria-label={t("dash.productCreate.removeImageAria")}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
