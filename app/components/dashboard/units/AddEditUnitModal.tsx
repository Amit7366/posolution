"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Unit } from "recharts/types/cartesian/CartesianAxis";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import type { Unit as UnitModel } from "@/app/types/unit";
import { Toggle } from "../ui/Toggle";

type Mode = "add" | "edit";

export function AddEditUnitModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: Mode;
  initial?: UnitModel | null;   // ✅ use UnitModel
  onClose: () => void;
  onSubmit: (payload: { unit: string; shortName: string; status: boolean }) => void;
}) {
  const [unit, setUnit] = useState("");
  const [shortName, setShortName] = useState("");
  const [status, setStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "add" ? "Add Unit" : "Edit Unit";
  const submitLabel = mode === "add" ? "Add Unit" : "Save Changes";

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
      setError("Unit and Short Name are required.");
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
            Unit <span className="text-orange-400">*</span>
          </label>
          <input
            name="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Short Name <span className="text-orange-400">*</span>
          </label>
          <input
            name="shortName"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="text-sm font-medium text-slate-200">Status</div>
          <Toggle value={status} onChange={setStatus} ariaLabel="Unit status" />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>
    </Modal>
  );
}
