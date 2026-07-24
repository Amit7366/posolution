import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base-url";

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
        Cookie: req.headers.get("cookie") || "",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Refresh failed",
        },
        { status: res.status || 500 }
      );
    }

    const response = NextResponse.json(
      { success: true, data: data.data },
      { status: 200 }
    );

    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const line of setCookies) {
      if (line.startsWith("refreshToken=")) {
        const value = line.split(";")[0].split("=").slice(1).join("=");
        if (value) {
          response.cookies.set("refreshToken", decodeURIComponent(value), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
          });
        }
        break;
      }
    }

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Refresh failed",
      },
      { status: 500 }
    );
  }
}
