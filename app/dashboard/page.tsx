"use client";

import {
  TrendingUp,
  TrendingDown,
  Gift,
  Shield,
  RotateCcw,
  DollarSign,
  Receipt,
  Clock,
  X,
  Calendar,
  Settings,
} from "lucide-react";
import { useState } from "react";
import SalesPurchaseCard from "../components/dashboard/SalesPurchaseCard";
import OverallInformationCard from "../components/dashboard/OverallInformationCard";
import CustomersOverviewCard from "../components/dashboard/CustomersOverviewCard";
import TopSellingProducts from "../components/dashboard/TopSellingProducts";
import LowStockProducts from "../components/dashboard/LowStockProducts";
import RecentSales from "../components/dashboard/RecentSales";
import DashboardWidgetsDemo from "../components/dashboard/DashobardWidgets";

export default function DashboardPage() {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Welcome, Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            You have <span className="text-orange-600 font-semibold">200+</span>{" "}
            Orders, Today
          </p>
        </div>

        {/* Date Range */}
        <button className="flex items-center gap-2 border px-4 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-sm">
          <Calendar size={18} />
          12/05/2025 - 12/11/2025
        </button>
      </div>

      {/* Alert Banner */}
      {showAlert && (
        <div className="relative bg-orange-50 border border-orange-200 text-orange-700 px-5 py-3 rounded-md flex items-center">
          <span className="text-sm">
            🔔 Your Product <strong>Apple iPhone 15</strong> is running Low,
            already below 5 Pcs.
            <a href="#" className="text-blue-600 font-semibold ml-1">
              Add Stock
            </a>
          </span>
          <button
            onClick={() => setShowAlert(false)}
            className="absolute right-4 text-gray-600 hover:text-gray-900"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="rounded-xl p-5 bg-orange-500 text-white shadow-sm">
          <div className="flex items-center gap-3 text-white/90">
            <DollarSign size={24} />
            <span className="font-medium text-sm">Total Sales</span>
          </div>
          <div className="text-3xl font-bold mt-2">$48,988,078</div>
          <div className="bg-white/20 inline-block px-2 py-[2px] rounded text-xs mt-3">
            +22%
          </div>
        </div>

        {/* Total Sales Return */}
        <div className="rounded-xl p-5 bg-[#0C274E] text-white shadow-sm">
          <div className="flex items-center gap-3 text-white/90">
            <RotateCcw size={24} />
            <span className="font-medium text-sm">Total Sales Return</span>
          </div>
          <div className="text-3xl font-bold mt-2">$16,478,145</div>
          <div className="bg-red-500 inline-block px-2 py-[2px] rounded text-xs mt-3">
            -22%
          </div>
        </div>

        {/* Total Purchase */}
        <div className="rounded-xl p-5 bg-teal-600 text-white shadow-sm">
          <div className="flex items-center gap-3 text-white/90">
            <Gift size={24} />
            <span className="font-medium text-sm">Total Purchase</span>
          </div>
          <div className="text-3xl font-bold mt-2">$24,145,789</div>
          <div className="bg-white/20 inline-block px-2 py-[2px] rounded text-xs mt-3">
            +22%
          </div>
        </div>

        {/* Total Purchase Return */}
        <div className="rounded-xl p-5 bg-blue-600 text-white shadow-sm relative">
          <div className="flex items-center gap-3 text-white/90">
            <Shield size={24} />
            <span className="font-medium text-sm">Total Purchase Return</span>
          </div>
          <div className="text-3xl font-bold mt-2">$18,458,747</div>
          <div className="bg-white/20 inline-block px-2 py-[2px] rounded text-xs mt-3">
            +22%
          </div>

          {/* Settings Badge */}
          <div className="absolute -right-3 -top-3 bg-orange-500 p-2 rounded-full shadow">
            <Settings size={18} className="text-white" />
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-4 gap-5">
        {/* Profit */}
        <div className="p-5 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold">$8,458,798</h3>
          <p className="text-gray-600 text-sm mt-1">Profit</p>
          <p className="text-green-500 text-sm mt-3 font-medium">
            +35% vs Last Month
          </p>
          <a
            href="#"
            className="text-blue-600 font-medium text-sm mt-3 inline-block"
          >
            View All
          </a>
        </div>

        {/* Invoice Due */}
        <div className="p-5 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold">$48,988,78</h3>
          <p className="text-gray-600 text-sm mt-1">Invoice Due</p>
          <p className="text-green-500 text-sm mt-3 font-medium">
            +35% vs Last Month
          </p>
          <a
            href="#"
            className="text-blue-600 font-medium text-sm mt-3 inline-block"
          >
            View All
          </a>
        </div>

        {/* Total Expense */}
        <div className="p-5 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold">$8,980,097</h3>
          <p className="text-gray-600 text-sm mt-1">Total Expenses</p>
          <p className="text-green-500 text-sm mt-3 font-medium">
            +41% vs Last Month
          </p>
          <a
            href="#"
            className="text-blue-600 font-medium text-sm mt-3 inline-block"
          >
            View All
          </a>
        </div>

        {/* Total Payment Returns */}
        <div className="p-5 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold">$78,458,798</h3>
          <p className="text-gray-600 text-sm mt-1">Total Payment Returns</p>
          <p className="text-red-500 text-sm mt-3 font-medium">
            -20% vs Last Month
          </p>
          <a
            href="#"
            className="text-blue-600 font-medium text-sm mt-3 inline-block"
          >
            View All
          </a>
        </div>
      </div>
      {/* Info cards  */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <SalesPurchaseCard />
        </div>

        <OverallInformationCard />
      </div>
      {/* selling info  */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopSellingProducts />
        <LowStockProducts />
        <RecentSales />
      </div>
      <DashboardWidgetsDemo />
    </div>
  );
}
