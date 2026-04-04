/**
 * Uploads an image via the Next.js route (Cloudinary credentials stay server-side).
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload/cloudinary", {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success || typeof data.url !== "string") {
    throw new Error(
      (data && typeof data.message === "string" && data.message) ||
        "Image upload failed"
    );
  }
  return data.url;
}
