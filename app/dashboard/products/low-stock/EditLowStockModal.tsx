"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { LowStockProduct } from "./types";
import { ui } from "./styles";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Props = {
  product: LowStockProduct;
  defaultThreshold: number;
  onClose: () => void;
  onSave: (payload: { id: string; quantity: number; lowStockThreshold: number }) => Promise<void>;
};

export default function EditLowStockModal({ product, defaultThreshold, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [alertQty, setAlertQty] = useState(
    String(product.lowStockThreshold ?? defaultThreshold)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuantity(String(product.quantity));
    setAlertQty(String(product.lowStockThreshold ?? defaultThreshold));
    setError(null);
  }, [product, defaultThreshold]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const q = Number(quantity);
    const alert = Number(alertQty);
    if (!Number.isFinite(q) || q < 0) {
      setError(t("dash.lowStock.errQuantity"));
      return;
    }
    if (!Number.isFinite(alert) || alert < 0) {
      setError(t("dash.lowStock.errAlertLevel"));
      return;
    }
    setBusy(true);
    try {
      await onSave({ id: product.id, quantity: q, lowStockThreshold: alert });
      onClose();
    } catch {
      setError(t("dash.lowStock.saveCouldNot"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur p-4">
      <div className="w-full max-w-lg rounded-xl bg-[#0b0b0b] border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base text-slate-100">{t("dash.lowStock.updateModalTitle")}</h3>
          <button type="button" onClick={onClose} className={ui.dangerBtn} disabled={busy} aria-label={t("dash.common.close")}>
            <X size={16} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>{t("dash.stock.colWarehouse")}</label>
              <input value={product.warehouse} readOnly className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>{t("dash.stock.colStore")}</label>
              <input value={product.store} readOnly className={ui.input} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>{t("dash.stock.colProduct")}</label>
              <input value={product.name} readOnly className={ui.input} />
            </div>
            <div>
              <label className={ui.label}>{t("dash.stock.colCategory")}</label>
              <input value={product.category} readOnly className={ui.input} />
            </div>
          </div>

          <div>
            <label className={ui.label}>{t("dash.stock.colSku")}</label>
            <input value={product.sku} readOnly className={ui.input} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={ui.label}>{t("dash.lowStock.quantityStar")}</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={ui.input}
                disabled={busy}
              />
            </div>
            <div>
              <label className={ui.label}>{t("dash.lowStock.alertAtStar")}</label>
              <input
                type="number"
                min={0}
                value={alertQty}
                onChange={(e) => setAlertQty(e.target.value)}
                className={ui.input}
                disabled={busy}
              />
              <p className="mt-1 text-xs text-slate-500">
                {t("dash.lowStock.alertHint", { defaultThreshold })}
              </p>
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className={ui.btnSecondary} disabled={busy}>
              {t("dash.common.cancel")}
            </button>
            <button type="submit" className={ui.btnPrimary} disabled={busy}>
              {busy ? t("dash.common.saving") : t("dash.common.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
