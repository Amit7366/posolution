"use client";
import React, { useState } from "react";
import { X, Plus } from "lucide-react";

type Uploaded = {
  url: string;
  public_id?: string;
};

export default function ImageUploader() {
  const [images, setImages] = useState<Uploaded[]>([]);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", uploadPreset);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        setImages((prev) => [...prev, { url: data.secure_url, public_id: data.public_id }]);
      } catch (err) {
        console.error("upload error", err);
      }
    }
  }

  const removeImage = (i: number) => {
    // client-side remove only. If you need to delete from Cloudinary, implement a server-side signed delete.
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <div className="flex gap-4 items-center">
        <label className="w-32 h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-50">
          <Plus />
          <span className="text-xs">Add Images</span>
          <input multiple type="file" onChange={handleFiles} className="hidden" />
        </label>

        {images.map((img, i) => (
          <div key={i} className="relative w-32 h-32 border rounded-md overflow-hidden">
            <img src={img.url} className="w-full h-full object-cover" alt={`img-${i}`} />
            <button
              onClick={() => removeImage(i)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
