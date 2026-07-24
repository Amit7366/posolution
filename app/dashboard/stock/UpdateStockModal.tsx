"use client";

import { Button } from "@/app/components/dashboard/ui/Button";
import { Modal } from "@/app/components/dashboard/ui/Modal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useEffect, useState } from "react";

export type StockRow = {
  id: string;
  warehouse: string;
  store: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  imageUrl?: string;
  updatedLabel: string;
};

export function UpdateStockModal({
  open,
  row,
  onClose,
  onSave,
}: {
  open: boolean;
  row: StockRow | null;
  onClose: () => void;
  onSave: (payload: { id: string; quantity: number }) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [qty, setQty] = useState("0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !row) return;
    setQty(String(row.quantity));
    setError(null);
    setBusy(false);
  }, [open, row]);

  if (!row) return null;

  async function submit() {
    if (!row) return;
    const n = Number(qty);
    if (!Number.isFinite(n) || n < 0) {
      setError(t("dash.stock.qtyError"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSave({ id: row.id, quantity: Math.floor(n) });
      onClose();
    } catch {
      setError(t("dash.stock.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title={t("dash.stock.modalTitle")}
      onClose={onClose}
      className="max-w-lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {t("dash.common.cancel")}
          </Button>
          <Button variant="primary" onClick={() => void submit()} disabled={busy}>
            {busy ? t("dash.common.saving") : t("dash.common.save")}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3 text-slate-200">
          <div>
            <div className="text-xs text-slate-400">{t("dash.stock.colWarehouse")}</div>
            <div className="font-medium">{row.warehouse}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">{t("dash.stock.colStore")}</div>
            <div className="font-medium">{row.store}</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400">{t("dash.stock.colProduct")}</div>
          <div className="mt-1 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 text-xs font-bold">
              {row.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={row.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                row.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-100">{row.name}</div>
              <div className="text-xs text-slate-400">
                {row.sku} · {row.category}
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {t("dash.stock.lastUpdated")} {row.updatedLabel}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-300">{t("dash.stock.quantityLabel")}</label>
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            disabled={busy}
            className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-slate-100 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/20"
          />
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>
    </Modal>
  );
}
