"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";

const COLORS = ["#16a34a", "#f97316"];

const chartData = [
  { name: "Return", value: 3500 },
  { name: "First Time", value: 5500 },
];

export default function CustomersOverviewCard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-full">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-gray-200">
          Customers Overview
        </h2>

        <button
          onClick={() => setOpen(!open)}
          className="border px-3 py-1 rounded-md text-sm flex items-center gap-1"
        >
          Today <ChevronDown size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={5}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-row gap-2">
          <div>
            <h3 className="text-2xl font-bold">5.5K</h3>
            <p className="text-sm text-gray-500">First Time</p>
            <span className="text-green-500 text-sm">⬆ 25%</span>
          </div>

          <div>
            <h3 className="text-2xl font-bold">3.5K</h3>
            <p className="text-sm text-gray-500">Return</p>
            <span className="text-green-500 text-sm">⬆ 21%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
