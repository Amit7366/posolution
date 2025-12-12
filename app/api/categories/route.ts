// app/api/categories/route.ts (Next 13+ app router)
import { NextResponse } from "next/server";

const categories = [
  { id: "c1", name: "Electronics" },
  { id: "c2", name: "Accessories" },
];

const subcategories: Record<string, any[]> = {
  c1: [
    { id: "sc1", name: "Mobile Phones" },
    { id: "sc2", name: "Laptops" },
  ],
  c2: [
    { id: "sc3", name: "Chargers" },
    { id: "sc4", name: "Cables" },
  ],
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId");

  if (categoryId) {
    return NextResponse.json(subcategories[categoryId] || []);
  }
  return NextResponse.json(categories);
}
