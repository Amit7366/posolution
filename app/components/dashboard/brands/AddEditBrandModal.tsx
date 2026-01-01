"use client";

import { Brand } from "@/app/types/brand";
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
}: {
  open: boolean;
  mode: Mode;
  initial?: Brand | null;
  onClose: () => void;
  onSubmit: (payload: { name: string; status: boolean; logoDataUrl?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const title = mode === "add" ? "Add Brand" : "Edit Brand";
  const submitLabel = mode === "add" ? "Add Brand" : "Save Changes";

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
      setError("Only PNG or JPEG is allowed.");
      e.currentTarget.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("File too large. Max 2MB.");
      e.currentTarget.value = "";
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit() {
    if (!canSubmit) {
      setError("Brand name is required.");
      return;
    }
    setError(null);
    onSubmit({ name: name.trim(), status, logoDataUrl });
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
            Cancel
          </Button>
          <Button variant="primary" disabled={!canSubmit} onClick={submit}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        {/* image */}
        <div className="flex flex-col gap-3">
          <div className="relative grid h-[170px] w-full place-items-center rounded-xl border border-dashed border-white/20 bg-white/[0.02]">
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDataUrl} alt="Brand logo" className="h-full w-full rounded-xl object-contain p-3" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.03]">
                  <PlusIcon />
                </div>
                <div className="text-sm font-medium">Add Image</div>
              </div>
            )}
          </div>

          <Button variant="primary" onClick={handlePickFile} className="rounded-lg">
            Upload Image
          </Button>
          <p className="text-xs text-slate-400">JPEG, PNG up to 2 MB</p>

          <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
        </div>

        {/* form */}
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Brand <span className="text-orange-400">*</span>
            </label>
            <input
              name="brand"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
            />
            {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <div className="text-sm font-medium text-slate-200">Status</div>
            <Toggle value={status} onChange={setStatus} ariaLabel="Brand status" />
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
