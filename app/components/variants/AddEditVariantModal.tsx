"use client";

import { VariantAttribute } from "@/app/types/variant-attribute";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../dashboard/ui/Modal";
import { Button } from "../dashboard/ui/Button";
import { Toggle } from "../dashboard/ui/Toggle";
import { cn } from "@/app/lib/cn";

type Mode = "add" | "edit";

export function AddEditVariantModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: Mode;
  initial?: VariantAttribute | null;
  onClose: () => void;
  onSubmit: (payload: { name: string; values: string[]; status: boolean }) => void;
}) {
  const [name, setName] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [status, setStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = mode === "add" ? "Add Variant" : "Edit Variant";
  const submitLabel = mode === "add" ? "Add Variant" : "Save Changes";

  useEffect(() => {
    if (!open) return;
    setError(null);

    if (mode === "edit" && initial) {
      setName(initial.name);
      setValues(initial.values);
      setStatus(initial.status === "Active");
    } else {
      setName("");
      setValues([]);
      setStatus(true);
    }
  }, [open, mode, initial]);

  const canSubmit = useMemo(() => name.trim().length > 0 && values.length > 0, [name, values]);

  function submit() {
    if (!name.trim()) return setError("Variant is required.");
    if (values.length === 0) return setError("Values are required.");
    setError(null);
    onSubmit({ name: name.trim(), values, status });
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      initialFocusSelector='input[name="variantName"]'
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
            Variant <span className="text-orange-400">*</span>
          </label>
          <input
            name="variantName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#070a0f] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Values <span className="text-orange-400">*</span>
          </label>

          <TagInput
            values={values}
            onChange={setValues}
            placeholder="Enter value separated by comma"
          />

          <p className="mt-2 text-sm text-slate-400">Enter value separated by comma</p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="text-sm font-medium text-slate-200">Status</div>
          <Toggle value={status} onChange={setStatus} ariaLabel="Variant status" />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>
    </Modal>
  );
}

/** Chip-style input like screenshot: type "XS, S, M" + comma/enter to add chips */
function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  function normalizeAdd(raw: string) {
    const parts = raw
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const set = new Set(values.map((v) => v.toLowerCase()));
    const next = [...values];

    for (const p of parts) {
      const key = p.toLowerCase();
      if (!set.has(key)) {
        set.add(key);
        next.push(p);
      }
    }

    onChange(next);
  }

  function removeAt(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }

  return (
    <div
      className={cn(
        "min-h-[54px] w-full rounded-xl border border-white/10 bg-[#070a0f] px-3 py-2",
        "outline-none ring-orange-500/30 transition focus-within:border-orange-500/30 focus-within:ring-4"
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex flex-wrap items-center gap-2">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900"
          >
            {v}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeAt(i);
              }}
              className="grid h-4 w-4 place-items-center rounded bg-black/10 text-slate-900 hover:bg-black/20"
              aria-label={`Remove ${v}`}
              title="Remove"
            >
              <XSmall />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[180px] flex-1 bg-transparent px-2 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              normalizeAdd(draft);
              setDraft("");
            } else if (e.key === "Backspace" && draft.length === 0 && values.length > 0) {
              // backspace removes last chip
              removeAt(values.length - 1);
            }
          }}
          onBlur={() => {
            // Add remaining draft on blur
            if (draft.trim()) {
              normalizeAdd(draft);
              setDraft("");
            }
          }}
        />
      </div>
    </div>
  );
}

function XSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
