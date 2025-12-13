"use client";

import { useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  X,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EditExpiredModal from "./EditExpiredModal";

/**
 * Industry‑grade, self‑contained Expired Products page
 * Tech: Next.js 14 (App Router), React, TailwindCSS, TypeScript
 * Notes:
 * - Pure Tailwind (no UI libraries)
 * - Accessible, scalable layout
 * - Modal‑driven edit flow
 * - Replace mock data with API / RTK Query easily
 */

// -----------------------------
// Types
// -----------------------------

type Product = {
  id: number;
  sku: string;
  name: string;
  manufacturedAt: string;
  expiredAt: string;
  image: string;
};

// -----------------------------
// Mock Data (replace with API)
// -----------------------------

const PRODUCTS: Product[] = [
  {
    id: 1,
    sku: "PT001",
    name: "Lenovo 3rd Generation",
    manufacturedAt: "24 Dec 2024",
    expiredAt: "20 Dec 2026",
    image: "/images/products/laptop.png",
  },
  {
    id: 2,
    sku: "PT002",
    name: "Beats Pro",
    manufacturedAt: "10 Dec 2024",
    expiredAt: "07 Dec 2026",
    image: "/images/products/headphone.png",
  },
  {
    id: 3,
    sku: "PT003",
    name: "Nike Jordan",
    manufacturedAt: "27 Nov 2024",
    expiredAt: "20 Nov 2026",
    image: "/images/products/shoe.png",
  },
  {
    id: 4,
    sku: "PT004",
    name: "Apple Series 5 Watch",
    manufacturedAt: "18 Nov 2024",
    expiredAt: "15 Nov 2026",
    image: "/images/products/watch.png",
  },
  {
    id: 5,
    sku: "PT005",
    name: "Amazon Echo Dot",
    manufacturedAt: "06 Nov 2024",
    expiredAt: "04 Nov 2026",
    image: "/images/products/echo.png",
  },
  {
    id: 6,
    sku: "PT006",
    name: "Sanford Chair Sofa",
    manufacturedAt: "25 Oct 2024",
    expiredAt: "20 Oct 2026",
    image: "/images/products/chair.png",
  },
  {
    id: 7,
    sku: "PT007",
    name: "Red Premium Satchel",
    manufacturedAt: "14 Oct 2024",
    expiredAt: "10 Oct 2026",
    image: "/images/products/bag.png",
  },
  {
    id: 8,
    sku: "PT008",
    name: "iPhone 14 Pro",
    manufacturedAt: "03 Oct 2024",
    expiredAt: "01 Oct 2026",
    image: "/images/products/iphone.png",
  },
  {
    id: 9,
    sku: "PT009",
    name: "Gaming Chair",
    manufacturedAt: "20 Sep 2024",
    expiredAt: "16 Sep 2026",
    image: "/images/products/gaming-chair.png",
  },
  {
    id: 10,
    sku: "PT010",
    name: "Borealis Backpack",
    manufacturedAt: "10 Sep 2024",
    expiredAt: "06 Sep 2026",
    image: "/images/products/backpack.png",
  },
];

// -----------------------------
// Page Component
// -----------------------------

export default function ExpiredPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen  text-slate-200">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Expired Products</h1>
        <p className="text-sm text-slate-400">Manage your expired products</p>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-white/10">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded-md bg-black/60 pl-9 pr-3 py-2 text-sm outline-none border border-white/10 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="icon-btn">
              <FileText />
            </button>
            <button className="icon-btn">
              <FileSpreadsheet />
            </button>
            <button className="icon-btn">
              <RotateCcw />
            </button>
            <select className="select">
              <option>Product</option>
            </select>
            <select className="select">
              <option>Sort By : Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Manufactured Date</th>
                <th className="px-4 py-3 text-left">Expired Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-8 w-8 rounded bg-white/10 object-contain"
                      />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {p.manufacturedAt}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.expiredAt}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="action-btn"
                      >
                        <Pencil />
                      </button>
                      <button className="action-btn danger">
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span>Row Per Page</span>
            <select className="select">
              <option>10</option>
            </select>
            <span>Entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="icon-btn">
              <ChevronLeft />
            </button>
            <span className="h-6 w-6 rounded-full bg-orange-500 text-black flex items-center justify-center text-xs">
              1
            </span>
            <button className="icon-btn">
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditExpiredModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={() => setEditing(null)}
        />
      )}
    </div>
  );
}
