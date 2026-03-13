import { NextRequest, NextResponse } from "next/server";

const SOHOJ_BASE_URL = "https://sohoj-server.vercel.app/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${SOHOJ_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Login failed",
        },
        { status: res.status || 500 }
      );
    }

    const token = data?.data?.accessToken;

    const response = NextResponse.json(
      {
        success: true,
        data: data.data,
      },
      { status: 200 }
    );

    if (token) {
      response.cookies.set("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
