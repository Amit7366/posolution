"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ExpiredProductRow } from "./types";
import { ui } from "./styles";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Props = {
  product: ExpiredProductRow;
  onClose: () => void;
  onSave: (
    payload: {
      id: string;
      name: string;
      sku: string;
      manufacturedDate: string;
      expiryOn: string;
    }
  ) => Promise<void>;
};

export default function EditExpiredModal({ product, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku);
  const [manufacturedDate, setManufacturedDate] = useState(product.manufacturedDate);
  const [expiryOn, setExpiryOn] = useState(product.expiryOn);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(product.name);
    setSku(product.sku);
    setManufacturedDate(product.manufacturedDate);
    setExpiryOn(product.expiryOn);
    setError(null);
  }, [product]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || name.trim().length < 2) {
      setError(t("dash.expired.errNameMin"));
      return;
    }
    if (!sku.trim() || sku.trim().length < 2) {
      setError(t("dash.expired.errSkuMin"));
      return;
    }
    if (!expiryOn) {
      setError(t("dash.expired.errExpiryRequired"));
      return;
    }
    setBusy(true);
    try {
      await onSave({
        id: product.id,
        name: name.trim(),
        sku: sku.trim(),
        manufacturedDate: manufacturedDate.trim(),
        expiryOn: expiryOn.trim(),
      });
      onClose();
    } catch {
      setError(t("dash.expired.saveCouldNot"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 backdrop-blur p-4 dark:bg-black/70">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{t("dash.expired.editModalTitle")}</h3>
          <button type="button" onClick={onClose} className={ui.dangerBtn} disabled={busy} aria-label={t("dash.common.close")}>
            <X size={16} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <label className={ui.label}>{t("dash.expired.skuStar")}</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={ui.input}
              disabled={busy}
            />
          </div>

          <div>
            <label className={ui.label}>{t("dash.expired.productNameStar")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={ui.input}
              disabled={busy}
            />
          </div>

          <div>
            <label className={ui.label}>{t("dash.expired.manufacturedLabel")}</label>
            <input
              type="date"
              value={manufacturedDate}
              onChange={(e) => setManufacturedDate(e.target.value)}
              className={ui.input}
              disabled={busy}
            />
          </div>

          <div>
            <label className={ui.label}>{t("dash.expired.expiryStar")}</label>
            <input
              type="date"
              value={expiryOn}
              onChange={(e) => setExpiryOn(e.target.value)}
              className={ui.input}
              disabled={busy}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("dash.expired.expiryHint")}</p>
          </div>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
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
