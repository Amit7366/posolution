import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, message: "Missing file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, message: "File too large (max 8MB)" }, { status: 400 });
    }
    const type = file.type || "application/octet-stream";
    if (!ALLOWED.has(type)) {
      return NextResponse.json({ success: false, message: "Unsupported image type" }, { status: 400 });
    }

    const ext =
      type === "image/png"
        ? "png"
        : type === "image/webp"
          ? "webp"
          : type === "image/gif"
            ? "gif"
            : "jpg";

    const buf = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(dir, { recursive: true });
    const fsPath = path.join(dir, name);
    await writeFile(fsPath, buf);

    const url = `/uploads/products/${name}`;
    return NextResponse.json({ success: true, url }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
