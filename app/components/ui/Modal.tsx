"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cx } from "@/app/lib/cx";


type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  widthClassName?: string; // e.g. "max-w-6xl"
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  className,
  widthClassName = "max-w-5xl",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6">
        <div
          className={cx(
            "relative mx-auto w-full",
            widthClassName,
            "rounded-xl border border-white/10 bg-[#0b0f14] shadow-[0_20px_70px_rgba(0,0,0,.65)]",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="text-lg font-semibold text-white">
              {title ?? ""}
            </div>
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-500"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
