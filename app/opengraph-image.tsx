import { ImageResponse } from "next/og";

export const alt = "posulation — Smart POS for modern retail";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background:
            "linear-gradient(145deg, #0B1224 0%, #0d1b3e 45%, #1e1b4b 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(37,99,235,0.45) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -60,
            width: 420,
            height: 420,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%)",
          }}
        />

        {/* Brand mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
              color: "white",
              fontSize: 34,
              fontWeight: 800,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            P
          </div>
          <div
            style={{
              display: "flex",
              color: "white",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: -1,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            posulation
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              color: "white",
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
              color: "#94A3B8",
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

        {/* Footer accent bar */}
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
              background: "rgba(37,99,235,0.2)",
              border: "1px solid rgba(96,165,250,0.35)",
              color: "#93C5FD",
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
              color: "#64748B",
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
