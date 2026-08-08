"use client";

import StatusToggle from "./StatusToggle";

type BaseModalFormProps = {
  title: string;
  submitText: string;
  status: boolean;
  setStatus: (v: boolean) => void;
  onClose: () => void;
  children: React.ReactNode;
  onSubmit?: () => void | Promise<void>;
  submitting?: boolean;
};

export function BaseModalForm({
  title,
  submitText,
  status,
  setStatus,
  onClose,
  children,
  onSubmit,
  submitting = false,
}: BaseModalFormProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 animate-fadeIn">
      <div className="w-full max-w-xl rounded-xl border border-gray-200 bg-white animate-scaleIn dark:border-gray-700 dark:bg-gray-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
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
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm">Status</span>
            <StatusToggle enabled={status} setEnabled={setStatus} />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!status || submitting}
              onClick={() => {
                if (!onSubmit || !status || submitting) return;
                void onSubmit();
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition
                ${
                  status && !submitting
                    ? "bg-gradient-to-r from-orange-500 to-orange-400 text-black"
                    : "cursor-not-allowed bg-gray-700 text-gray-400"
                }`}
            >
              {submitting ? "Saving..." : submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
