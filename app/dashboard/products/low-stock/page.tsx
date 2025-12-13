"use client";

import { useState } from "react";
import { Pencil, AlertTriangle } from "lucide-react";
import { LOW_STOCK_PRODUCTS } from "./data";
import { LowStockProduct } from "./types";
import EditLowStockModal from "./EditLowStockModal";
import { ui } from "./styles";
import Image from "next/image";

export default function LowStockPage() {
  const [editing, setEditing] = useState<LowStockProduct | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0c0c0c] to-black p-6 text-slate-200">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <AlertTriangle className="text-orange-500" />
          Low Stock Products
        </h1>
        <p className="text-sm text-slate-400">
          Monitor products running below alert quantity
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Warehouse</th>
              <th className="px-4 py-3 text-left">Store</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Qty Alert</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {LOW_STOCK_PRODUCTS.map((p) => (
              <tr
                key={p.id}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-3">{p.warehouse}</td>
                <td className="px-4 py-3">{p.store}</td>
                <td className="px-4 py-3 font-medium flex items-center gap-1">
                    <Image 
                        src={p.image}
                        alt={p.name}
                        height={25}
                        width={25}
                    />
                    {p.name}
                    </td>
                <td className="px-4 py-3 text-slate-400">{p.category}</td>
                <td className="px-4 py-3 text-slate-400">{p.sku}</td>
                <td className="px-4 py-3">
                  <span className="text-red-400 font-semibold">{p.qty}</span>
                </td>
                <td className="px-4 py-3 text-orange-400">{p.qtyAlert}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setEditing(p)}
                    className={ui.actionBtn}
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditLowStockModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={() => setEditing(null)}
        />
      )}
    </div>
  );
}
