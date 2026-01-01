"use client";

import { cn } from "@/app/lib/cn";
import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  initialFocusSelector?: string; // e.g. 'input[name="brand"]'
};

export function Modal({ open, title, onClose, children, footer, className, initialFocusSelector }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const titleId = useMemo(() => `modal-title-${Math.random().toString(36).slice(2)}`, []);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // prevent background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus
    setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const el =
        (initialFocusSelector ? (panel.querySelector(initialFocusSelector) as HTMLElement | null) : null) ??
        (panel.querySelector("[data-initial-focus]") as HTMLElement | null) ??
        (panel.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") as
          | HTMLElement
          | null);

      el?.focus();
    }, 0);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();

      // basic focus trap
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = Array.from(
          panel.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")
        ).filter((x) => !x.hasAttribute("disabled") && x.tabIndex !== -1);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose, initialFocusSelector]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          "relative w-full max-w-[760px] rounded-2xl border border-white/10 bg-[#0b0f14] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)]",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-red-500/15 text-red-400 transition hover:bg-red-500/25"
              aria-label="Close"
              title="Close"
            >
              <XIcon />
            </button>
          </div>
        )}

        <div className="px-6 py-6">{children}</div>

        {footer && <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
