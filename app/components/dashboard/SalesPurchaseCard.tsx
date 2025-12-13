"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingBag } from "lucide-react";

const FILTERS = ["1D", "1W", "1M", "3M", "6M", "1Y"] as const;
type FilterType = (typeof FILTERS)[number];

const chartData: Record<FilterType, any[]> = {
  "1D": [
    { time: "2 am", sales: 12, purchase: 45 },
    { time: "4 am", sales: 16, purchase: 38 },
    { time: "6 am", sales: 10, purchase: 35 },
    { time: "8 am", sales: 18, purchase: 48 },
    { time: "10 am", sales: 22, purchase: 60 },
    { time: "12 pm", sales: 10, purchase: 30 },
    { time: "14 pm", sales: 8, purchase: 25 },
    { time: "16 pm", sales: 15, purchase: 38 },
    { time: "18 pm", sales: 30, purchase: 70 },
    { time: "20 pm", sales: 12, purchase: 33 },
    { time: "22 pm", sales: 20, purchase: 55 },
    { time: "24 pm", sales: 14, purchase: 28 },
  ],
  "1W": [],
  "1M": [],
  "3M": [],
  "6M": [],
  "1Y": [],
};

export default function SalesPurchaseCard() {
  const [selected, setSelected] = useState<FilterType>("1D");

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-orange-500" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-200">
            Sales & Purchase
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setSelected(f)}
              className={`px-3 py-1 text-sm rounded-md border transition ${
                selected === f
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mt-4">
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-300 rounded-full" />
            Total Purchase
          </div>
          <p className="text-xl font-bold">3K</p>
        </div>

        <div className="text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full" />
            Total Sales
          </div>
          <p className="text-xl font-bold">1K</p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData[selected]}>
            <XAxis dataKey="time" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip cursor={{ fill: "#f2f2f2" }} />
            <Bar dataKey="purchase" stackId="a" fill="#fed7aa" />
            <Bar dataKey="sales" stackId="a" fill="#fb923c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
