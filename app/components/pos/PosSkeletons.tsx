"use client";

export function ProductListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="h-14 w-14 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-3 aspect-square rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="mb-2 h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

export function TransactionListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200 p-4 dark:border-gray-700"
        >
          <div className="mb-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}
