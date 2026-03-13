import { NextRequest, NextResponse } from "next/server";

const SOHOJ_BASE_URL = "https://sohoj-server.vercel.app/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${SOHOJ_BASE_URL}/users/create-User`, {
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
          message: data?.message || "Registration failed",
        },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: data.data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}

