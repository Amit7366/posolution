"use client";
import React from "react";

const TopCategories = () => {
  const categories = [
    { name: "Electronics", sales: 698, color: "bg-orange-400" },
    { name: "Sports", sales: 545, color: "bg-blue-500" },
    { name: "Lifestyles", sales: 456, color: "bg-purple-500" },
  ];

  const stats = {
    totalCategories: 698,
    totalProducts: 7899,
  };

  return (
    <div className="w-full rounded-xl border bg-white p-5 dark:bg-neutral-900 dark:border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-xl">📊</span>
          <h2 className="text-lg font-semibold">Top Categories</h2>
        </div>
        <div className="text-sm border rounded-lg px-2 py-1 dark:border-neutral-700">
          Weekly ▼
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Fake donut chart */}
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 opacity-90" />

        {/* Labels */}
        <div className="space-y-3">
          {categories.map((c, i) => (
            <p className="font-medium" key={i}>
              {c.name} —{" "}
              <span className="font-semibold">{c.sales} Sales</span>
            </p>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 space-y-2 text-sm">
        <p>
          Total Number Of Categories:{" "}
          <span className="font-semibold">{stats.totalCategories}</span>
        </p>
        <p>
          Total Number Of Products:{" "}
          <span className="font-semibold">{stats.totalProducts}</span>
        </p>
      </div>
    </div>
  );
};

export default TopCategories;
