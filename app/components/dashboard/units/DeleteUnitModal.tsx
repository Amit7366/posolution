"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function DeleteUnitModal({
  open,
  unitName,
  onClose,
  onConfirm,
  deleting = false,
}: {
  open: boolean;
  unitName?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  deleting?: boolean;
}) {
  const { t } = useTranslation();
  const body = unitName
    ? t("dash.units.deletePromptNamed", { name: unitName })
    : t("dash.units.deletePromptPlain");
  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-[760px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("dash.common.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={deleting}
            onClick={() => void onConfirm()}
          >
            {deleting ? t("dash.common.deleting") : t("dash.units.yesDelete")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-300">
          <TrashIcon />
        </div>
        <h3 className="text-2xl font-semibold text-slate-100">{t("dash.units.deleteTitle")}</h3>
        <p className="text-sm text-slate-300">{body}</p>
      </div>
    </Modal>
  );
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6l1 15h8l1-15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
