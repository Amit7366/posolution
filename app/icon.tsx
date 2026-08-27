import { ImageResponse } from "next/og";
import { getBrandIconDataUri } from "@/lib/brand-icon";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const src = await getBrandIconDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderRadius: 8,
        }}
      >
        <img src={src} width={28} height={28} alt="" style={{ objectFit: "contain" }} />
      </div>
    ),
    { ...size }
  );
}
