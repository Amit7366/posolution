import { ImageResponse } from "next/og";
import { BRAND, getBrandIconDataUri } from "@/lib/brand-icon";

export const runtime = "nodejs";
export const alt = "posulation — Smart POS for modern retail";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  const src = await getBrandIconDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: `linear-gradient(145deg, ${BRAND.white} 0%, ${BRAND.mist} 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(0,74,242,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -40,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(4,198,9,0.16) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 180,
            right: 220,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(1,167,188,0.14) 0%, transparent 70%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img src={src} width={88} height={88} alt="" style={{ objectFit: "contain" }} />
          <div
            style={{
              display: "flex",
              color: BRAND.blue,
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: -1,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            posulation
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              color: BRAND.navy,
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 900,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            The smartest POS for your business
          </div>
          <div
            style={{
              display: "flex",
              color: "#5B6B82",
              fontSize: 28,
              fontWeight: 500,
              maxWidth: 820,
              lineHeight: 1.4,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Sales, inventory, invoices & reports — one modern platform.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              borderRadius: 999,
              background: "rgba(0,74,242,0.08)",
              border: "1px solid rgba(0,74,242,0.22)",
              color: BRAND.blue,
              fontSize: 20,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Trusted by 10,000+ businesses
          </div>
          <div
            style={{
              display: "flex",
              color: BRAND.teal,
              fontSize: 22,
              fontWeight: 600,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            posulation.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
