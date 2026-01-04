"use client";

import { Warranty, WarrantyPeriod } from "@/app/types/warranty";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../dashboard/ui/Button";
import { Modal } from "../dashboard/ui/Modal";
import { Toggle } from "../dashboard/ui/Toggle";

type Mode = "add" | "edit";

export function AddEditWarrantyModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: Mode;
  initial?: Warranty | null;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    duration: number;
    period: WarrantyPeriod;
    description: string;
    status: boolean;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(1);
  const [period, setPeriod] = useState<WarrantyPeriod | "">("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(false); // screenshot shows toggle off by default
  const [error, setError] = useState<string | null>(null);

  const title = mode === "add" ? "Add Warranty" : "Edit Warranty";
  const submitLabel = mode === "add" ? "Add Warranty" : "Save Changes";

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (mode === "edit" && initial) {
      setName(initial.name);
      setDuration(initial.duration);
      setPeriod(initial.period);
      setDescription(initial.description);
      setStatus(initial.status === "Active");
    } else {
      setName("");
      setDuration(1);
      setPeriod("");
      setDescription("");
      setStatus(false);
    }
  }, [open, mode, initial]);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && description.trim().length > 0 && duration > 0 && period !== "";
  }, [name, description, duration, period]);

  function submit() {
    if (!name.trim()) return setError("Warranty is required.");
    if (!duration || duration <= 0) return setError("Duration must be greater than 0.");
    if (!period) return setError("Period is required.");
    if (!description.trim()) return setError("Description is required.");

    setError(null);
    onSubmit({
      name: name.trim(),
      duration: Number(duration),
      period: period as WarrantyPeriod,
      description: description.trim(),
      status,
    });
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      initialFocusSelector='input[name="warrantyName"]'
      className="max-w-[760px]"
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
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Warranty <span className="text-orange-400">*</span>
          </label>
          <input
            name="warrantyName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Duration <span className="text-orange-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Number(e.target.value || 1)))}
              className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Period <span className="text-orange-400">*</span>
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as WarrantyPeriod)}
              className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
            >
              <option value="">Select</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Description <span className="text-orange-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="text-sm font-medium text-slate-200">Status</div>
          <Toggle value={status} onChange={setStatus} ariaLabel="Warranty status" />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>
    </Modal>
  );
}
