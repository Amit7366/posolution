"use client";

import { X } from "lucide-react";
import { Product } from "./types";
import { ui } from "./styles";

type Props = {
  product: Product;
  onClose: () => void;
  onSave: (product: Product) => void;
};

export default function EditExpiredModal({
  product,
  onClose,
  onSave,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur">
      <div className="w-full max-w-md rounded-xl bg-[#0b0b0b] border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Edit Expired Product</h3>
          <button onClick={onClose} className={ui.dangerBtn}>
            <X size={16} />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(product);
          }}
        >
          <div>
            <label className={ui.label}>SKU *</label>
            <input defaultValue={product.sku} className={ui.input} />
          </div>

          <div>
            <label className={ui.label}>Product Name *</label>
            <select defaultValue={product.name} className={ui.input}>
              <option>{product.name}</option>
            </select>
          </div>

          <div>
            <label className={ui.label}>Manufacturer Date *</label>
            <input defaultValue={product.manufacturedAt} className={ui.input} />
          </div>

          <div>
            <label className={ui.label}>Expiry Date *</label>
            <input defaultValue={product.expiredAt} className={ui.input} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
