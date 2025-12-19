"use client";

export default function StatusToggle({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      tabIndex={0}
      onClick={() => setEnabled(!enabled)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEnabled(!enabled);
        }
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500
        ${enabled ? "bg-emerald-500" : "bg-gray-600"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform duration-300 ease-out
          ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
