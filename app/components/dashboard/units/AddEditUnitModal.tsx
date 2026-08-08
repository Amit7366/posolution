"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import type { Unit as UnitModel } from "@/app/types/unit";
import { Toggle } from "../ui/Toggle";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Mode = "add" | "edit";

export function AddEditUnitModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  submitting = false,
}: {
  open: boolean;
  mode: Mode;
  initial?: UnitModel | null;
  onClose: () => void;
  onSubmit: (payload: {
    unit: string;
    shortName: string;
    status: boolean;
  }) => void | Promise<void>;
  submitting?: boolean;
}) {
  const { t } = useTranslation();
  const [unit, setUnit] = useState("");
  const [shortName, setShortName] = useState("");
  const [status, setStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "add" ? t("dash.units.addTitle") : t("dash.units.editTitle");
  const submitLabel = mode === "add" ? t("dash.units.add") : t("dash.common.saveChanges");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setUnit(initial.unit);
      setShortName(initial.shortName);
      setStatus(initial.status === "Active");
    } else {
      setUnit("");
      setShortName("");
      setStatus(true);
    }
  }, [open, mode, initial]);

  const canSubmit = useMemo(() => unit.trim() && shortName.trim(), [unit, shortName]);

  function submit() {
    if (!unit.trim() || !shortName.trim()) {
      setError(t("dash.units.unitFieldsRequired"));
      return;
    }
    setError(null);
    onSubmit({ unit: unit.trim(), shortName: shortName.trim(), status });
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      initialFocusSelector='input[name="unit"]'
      className="max-w-[720px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("dash.common.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit || submitting}
            onClick={() => void submit()}
          >
            {submitting ? t("dash.common.saving") : submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("dash.units.unitLabel")}</label>
          <input
            name="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">{t("dash.units.shortNameLabel")}</label>
          <input
            name="shortName"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.02] px-4 py-3">
          <div className="text-sm font-medium text-gray-700 dark:text-slate-200">{t("dash.units.statusLabel")}</div>
          <Toggle value={status} onChange={setStatus} ariaLabel={t("dash.units.statusLabel")} />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>
    </Modal>
  );
}
