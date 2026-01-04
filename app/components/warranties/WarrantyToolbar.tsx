"use client";

import { WarrantyStatus } from "@/app/types/warranty";
import React from "react";
import { Dropdown } from "../dashboard/ui/Dropdown";

export type WarrantyStatusFilter = "All" | WarrantyStatus;

export function WarrantyToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  statusFilter: WarrantyStatusFilter;
  onStatusFilterChange: (v: WarrantyStatusFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div className="relative w-full max-w-xs">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search"
          className="w-full rounded-xl border border-white/10 bg-[#0b0f14] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4"
        />
      </div>

      <Dropdown
        label="Status"
        value={statusFilter}
        options={["All", "Active", "Inactive"] as const}
        onChange={onStatusFilterChange}
      />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
