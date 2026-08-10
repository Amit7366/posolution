"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

type Props = {
  open: boolean;
  supplierName?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  deleting?: boolean;
};

export function DeleteSupplierModal({
  open,
  supplierName,
  onClose,
  onConfirm,
  deleting = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-[620px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={deleting}>
            {t("dash.common.cancel")}
          </Button>
          <Button variant="danger" onClick={() => void onConfirm()} disabled={deleting}>
            {deleting ? t("dash.common.deleting") : "Delete Supplier"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-red-500/15 text-red-500">
          <TrashIcon />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Delete supplier?
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
            {supplierName
              ? `Are you sure you want to delete “${supplierName}”?`
              : "Are you sure you want to delete this supplier?"}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M8 6V4h8v2M7 6l1 15h8l1-15M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
