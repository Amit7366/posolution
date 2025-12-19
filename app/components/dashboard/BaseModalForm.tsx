"use client";

import StatusToggle from "./StatusToggle";

export function BaseModalForm({
  title,
  submitText,
  status,
  setStatus,
  onClose,
  children,
}: {
  title: string;
  submitText: string;
  status: boolean;
  setStatus: (v: boolean) => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
      <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#0b0b0b] animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-5 py-4">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm">Status</span>
            <StatusToggle enabled={status} setEnabled={setStatus} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg bg-blue-900/60 px-4 py-2 text-sm text-white hover:bg-blue-900"
            >
              Cancel
            </button>

            <button
              disabled={!status}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition
                ${
                  status
                    ? "bg-gradient-to-r from-orange-500 to-orange-400 text-black"
                    : "cursor-not-allowed bg-gray-700 text-gray-400"
                }`}
            >
              {submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
