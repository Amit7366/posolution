"use client";

import { Brand } from "@/app/types/brand";
import { useTranslation } from "@/lib/i18n/useTranslation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Toggle } from "../ui/Toggle";

type Mode = "add" | "edit";

export function AddEditBrandModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  submitting = false,
}: {
  open: boolean;
  mode: Mode;
  initial?: Brand | null;
  onClose: () => void;
  onSubmit: (payload: { name: string; status: boolean; logoDataUrl?: string }) => void | Promise<void>;
  submitting?: boolean;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const title = mode === "add" ? t("dash.brands.modalAdd") : t("dash.brands.modalEdit");
  const submitLabel = mode === "add" ? t("dash.brands.modalAdd") : t("dash.common.saveChanges");

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (mode === "edit" && initial) {
      setName(initial.name);
      setStatus(initial.status === "Active");
      setLogoDataUrl(initial.logoUrl);
    } else {
      setName("");
      setStatus(true);
      setLogoDataUrl(undefined);
    }
  }, [open, mode, initial]);

  function handlePickFile() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError(t("dash.brands.fileTypeError"));
      e.currentTarget.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(t("dash.brands.fileTooLarge"));
      e.currentTarget.value = "";
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!canSubmit) {
      setError(t("dash.brands.brandNameRequired"));
      return;
    }
    setError(null);
    await onSubmit({ name: name.trim(), status, logoDataUrl });
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      initialFocusSelector='input[name="brand"]'
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("dash.common.cancel")}
          </Button>
          <Button variant="primary" disabled={!canSubmit || submitting} onClick={() => void submit()}>
            {submitting ? t("dash.common.saving") : submitLabel}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="flex flex-col gap-3">
          <div className="relative grid h-[170px] w-full place-items-center rounded-xl border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/[0.02]">
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDataUrl} alt={t("dash.brands.logoAlt")} className="h-full w-full rounded-xl object-contain p-3" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-slate-400">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/[0.03]">
                  <PlusIcon />
                </div>
                <div className="text-sm font-medium">{t("dash.brands.addImage")}</div>
              </div>
            )}
          </div>

          <Button variant="primary" onClick={handlePickFile} className="rounded-lg">
            {t("dash.brands.uploadImage")}
          </Button>
          <p className="text-xs text-gray-500 dark:text-slate-400">{t("dash.brands.jpegHint2mb")}</p>

          <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
              {t("dash.brands.brandFieldStar")} <span className="text-orange-400">*</span>
            </label>
            <input
              name="brand"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
            />
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.02] px-4 py-3">
            <div className="text-sm font-medium text-gray-700 dark:text-slate-200">{t("dash.common.status")}</div>
            <Toggle value={status} onChange={setStatus} ariaLabel={t("dash.common.status")} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
