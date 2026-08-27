import { ImageResponse } from "next/og";
import { getBrandIconDataUri } from "@/lib/brand-icon";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          borderRadius: 40,
        }}
      >
        <img src={src} width={156} height={156} alt="" style={{ objectFit: "contain" }} />
      </div>
    ),
    { ...size }
  );
}
