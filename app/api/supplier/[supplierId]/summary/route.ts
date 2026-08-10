import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base-url";

type Params = { params: Promise<{ supplierId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { supplierId } = await params;

  try {
    const res = await fetch(`${getApiBaseUrl()}/supplier/${supplierId}/summary`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to fetch supplier summary" },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
