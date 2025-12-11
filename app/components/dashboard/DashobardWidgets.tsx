"use client";
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";

// -----------------------------------------------------------------------------
// Dashboard Widgets - 3 components in one file
// - TopCustomers
// - TopCategories
// - OrderStatistics (heatmap)
// Meant for Next.js + Tailwind CSS (dark mode ready)
// Put this file in your components/ folder and import the components you need.
// -----------------------------------------------------------------------------

// ----------------------------- Utilities ------------------------------------
const classNames = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

// tiny currency formatter
const fmt = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ----------------------------- TopCustomers ---------------------------------
export const TopCustomers: React.FC = () => {
  const customers = [
    {
      id: 1,
      name: "Carlos Curran",
      country: "USA",
      orders: 24,
      revenue: 89645,
      avatar: "CC",
    },
    {
      id: 2,
      name: "Stan Gaunter",
      country: "UAE",
      orders: 22,
      revenue: 16985,
      avatar: "SG",
    },
    {
      id: 3,
      name: "Richard Wilson",
      country: "Germany",
      orders: 14,
      revenue: 5366,
      avatar: "RW",
    },
    {
      id: 4,
      name: "Mary Bronson",
      country: "Belgium",
      orders: 8,
      revenue: 4569,
      avatar: "MB",
    },
    {
      id: 5,
      name: "Annie Tremblay",
      country: "Greenland",
      orders: 14,
      revenue: 35698,
      avatar: "AT",
    },
  ];

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-900/20">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1 1 0 011 1v1h-2V4a1 1 0 011-1zM5 6h10v8H5V6z" />
            </svg>
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 font-medium">Top Customers</h3>
        </div>
        <a className="text-sm text-slate-500 hover:underline dark:text-slate-300" href="#">View All</a>
      </div>

      <ul className="space-y-4">
        {customers.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-2 border-t last:border-b-0 border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 font-semibold">
                {c.avatar}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{c.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-300 flex items-center gap-2">
                  <span className="inline-flex items-center">{c.country}</span>
                  <span className="h-1 w-1 rounded-full bg-orange-400 inline-block" />
                  <span>{c.orders} Orders</span>
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{fmt(c.revenue)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ----------------------------- TopCategories --------------------------------
export const TopCategories: React.FC = () => {
  // pie data
  const pieData = [
    { name: "Electronics", value: 698 },
    { name: "Sports", value: 545 },
    { name: "Lifestyles", value: 456 },
  ];

  const COLORS = ["#F59E0B", "#EF4444", "#0F172A"]; // orange, red, dark-navy

  const stats = [
    { label: "Total Number Of Categories", value: 698 },
    { label: "Total Number Of Products", value: 7899 },
  ];

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-900/20">
            <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 font-medium">Top Categories</h3>
        </div>
        <div className="text-sm">
          <select className="border px-3 py-1 rounded bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-100">
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={48} outerRadius={80} paddingAngle={4}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-1/2">
          <div className="space-y-4">
            {pieData.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ background: COLORS[i] }} className="w-3 h-3 rounded-full" />
                  <div className="text-sm text-slate-600 dark:text-slate-300">{p.name}</div>
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{p.value} Sales</div>
              </div>
            ))}

            <div className="mt-2 rounded-md border border-slate-100 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/20">
              {stats.map((s, idx) => (
                <div key={s.label} className={classNames("flex items-center justify-between py-2", idx === 0 ? "border-b border-slate-100 dark:border-slate-700" : "")}>
                  <div className="text-sm text-slate-600 dark:text-slate-300">{s.label}</div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------- OrderStatistics --------------------------------
export const OrderStatistics: React.FC = () => {
  // generate heatmap-style data (days x timeslots)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["2 Am", "4 Am", "6 Am", "8 Am", "10 Am", "12 Pm", "14 Pm", "16 Pm", "18 Am"];

  // matrix of numbers (0 - 10 intensity)
  const heatmap: number[][] = [
    [3, 4, 5, 2, 1, 0, 0], // 2am
    [4, 5, 4, 3, 2, 2, 1],
    [2, 3, 2, 1, 1, 3, 4],
    [6, 6, 6, 4, 2, 1, 2],
    [8, 8, 7, 7, 4, 3, 5],
    [1, 1, 2, 1, 1, 2, 1],
    [0, 0, 1, 0, 0, 2, 3],
    [0, 1, 3, 2, 5, 4, 2],
    [2, 1, 0, 0, 3, 5, 6],
  ];

  // color scale: 0 -> light, 8+ -> deep orange
  const intensityToBg = (v: number) => {
    if (v >= 8) return "bg-orange-600";
    if (v >= 5) return "bg-orange-400";
    if (v >= 3) return "bg-orange-200";
    if (v >= 1) return "bg-orange-100";
    return "bg-transparent";
  };

  return (
    <div className="rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-900/20">
            <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h16v16H4z" />
            </svg>
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 font-medium">Order Statistics</h3>
        </div>
        <div className="text-sm">
          <select className="border px-3 py-1 rounded bg-white dark:bg-slate-700 dark:border-slate-600 text-slate-700 dark:text-slate-100">
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 items-center">
          <div className="col-span-1" />
          {days.map((d) => (
            <div key={d} className="text-xs text-slate-500 dark:text-slate-300 text-center">{d}</div>
          ))}

          {hours.map((hour, r) => (
            <React.Fragment key={hour}>
              <div className="text-xs text-slate-500 dark:text-slate-300">{hour}</div>
              {heatmap[r].map((cell, c) => (
                <div key={`${r}-${c}`} className={classNames("w-12 h-8 rounded-sm border border-transparent flex items-center justify-center", intensityToBg(cell), "dark:opacity-90")}>
                  {/* optional small dot or number */}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// ----------------------------- Wrapper Dashboard (optional) -------------------
export default function DashboardWidgetsDemo() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <TopCustomers />
      </div>
      <div className="md:col-span-1">
        <TopCategories />
      </div>
      <div className="md:col-span-1">
        <OrderStatistics />
      </div>
    </div>
  );
}
