"use client";

import { X } from "lucide-react";
import { LowStockProduct } from "./types";
import { ui } from "./styles";

type Props = {
  product: LowStockProduct;
  onClose: () => void;
  onSave: (updated: LowStockProduct) => void;
};

export default function EditLowStockModal({
  product,
  onClose,
  onSave,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur">
      <div className="w-full max-w-lg rounded-xl bg-[#0b0b0b] border border-white/10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base">Edit Low Stock Product</h3>
          <button onClick={onClose} className={ui.dangerBtn}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(product);
          }}
        >
          {/* Row 1: Warehouse | Store */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Warehouse *</label>
              <input
                defaultValue={product.warehouse}
                className={ui.input}
              />
            </div>
            <div>
              <label className={ui.label}>Store *</label>
              <input
                defaultValue={product.store}
                className={ui.input}
              />
            </div>
          </div>

          {/* Row 2: Product | Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Product *</label>
              <input
                defaultValue={product.name}
                className={ui.input}
              />
            </div>
            <div>
              <label className={ui.label}>Category *</label>
              <input
                defaultValue={product.category}
                className={ui.input}
              />
            </div>
          </div>

          {/* Row 3: SKU (full width) */}
          <div>
            <label className={ui.label}>SKU *</label>
            <input
              defaultValue={product.sku}
              className={ui.input}
            />
          </div>

          {/* Row 4: Qty | Qty Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>Quantity *</label>
              <input
                type="number"
                defaultValue={product.qty}
                className={ui.input}
              />
            </div>
            <div>
              <label className={ui.label}>Quantity Alert *</label>
              <input
                type="number"
                defaultValue={product.qtyAlert}
                className={ui.input}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={ui.btnSecondary}
            >
              Cancel
            </button>
            <button type="submit" className={ui.btnPrimary}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
