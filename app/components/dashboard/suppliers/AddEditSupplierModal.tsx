"use client";

import { useEffect, useMemo, useState } from "react";
import type { Supplier } from "@/app/types/supplier";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Toggle } from "../ui/Toggle";

export type SupplierFormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  status: boolean;
};

type Props = {
  open: boolean;
  mode: "add" | "edit";
  initial: Supplier | null;
  onClose: () => void;
  onSubmit: (values: SupplierFormValues) => void | Promise<void>;
  submitting: boolean;
};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none ring-orange-500/30 transition focus:border-orange-500 focus:ring-4 dark:border-gray-600 dark:bg-gray-800 dark:text-slate-100";

export function AddEditSupplierModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  submitting,
}: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setPhone(initial?.phone ?? "");
    setEmail(initial?.email ?? "");
    setAddress(initial?.address ?? "");
    setStatus(initial ? initial.status === "Active" : true);
    setError(null);
  }, [initial, open]);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  function submit() {
    if (!name.trim()) {
      setError("Supplier name is required.");
      return;
    }
    setError(null);
    void onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      status,
    });
  }

  return (
    <Modal
      open={open}
      title={mode === "add" ? "Add Supplier" : "Edit Supplier"}
      onClose={onClose}
      initialFocusSelector='input[name="supplierName"]'
      className="max-w-[720px]"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            {t("dash.common.cancel")}
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit || submitting}>
            {submitting
              ? t("dash.common.saving")
              : mode === "add"
                ? "Add Supplier"
                : t("dash.common.saveChanges")}
          </Button>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
            Name <span className="text-red-500">*</span>
          </span>
          <input
            name="supplierName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
            Phone
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-200">
            Address
          </span>
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-white/[0.02] sm:col-span-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Status</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {status ? "Active" : "Inactive"}
            </p>
          </div>
          <Toggle value={status} onChange={setStatus} ariaLabel="Supplier status" />
        </div>

        {error ? <p className="text-sm text-red-500 sm:col-span-2">{error}</p> : null}
      </div>
    </Modal>
  );
}
