"use client";

import { UnitStatus } from "@/app/types/unit";
import React from "react";
import { Dropdown } from "../ui/Dropdown";
import { Button } from "../ui/Button";


export type UnitStatusFilter = "All" | UnitStatus;

export function UnitToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  onAdd,
  onExportPDF,
  onExportXLS,
  onRefresh,
  onCollapse,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  statusFilter: UnitStatusFilter;
  onStatusFilterChange: (v: UnitStatusFilter) => void;

  onAdd: () => void;
  onExportPDF: () => void;
  onExportXLS: () => void;
  onRefresh: () => void;
  onCollapse: () => void;
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

      <div className="flex flex-wrap items-center gap-2">
        <IconButton title="Export PDF (Print)" onClick={onExportPDF}>
          <PdfIcon />
        </IconButton>
        <IconButton title="Export XLS" onClick={onExportXLS}>
          <XlsIcon />
        </IconButton>
        <IconButton title="Refresh" onClick={onRefresh}>
          <RefreshIcon />
        </IconButton>
        <IconButton title="Collapse" onClick={onCollapse}>
          <ChevronUpIcon />
        </IconButton>

        <Dropdown
          label="Status"
          value={statusFilter}
          options={["All", "Active", "Inactive"] as const}
          onChange={onStatusFilterChange}
        />

        <Button variant="primary" onClick={onAdd} className="ml-1">
          <PlusIcon />
          Add Unit
        </Button>
      </div>
    </div>
  );
}

function IconButton({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.06] active:translate-y-[1px]"
    >
      {children}
    </button>
  );
}

/* icons */
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 16.8v-4h1.6a1.4 1.4 0 0 1 0 2.8H7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16.8v-4h1.4a2 2 0 0 1 0 4H12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 16.8v-4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function XlsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M14 3v4a2 2 0 0 0 2 2h4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 17l3-4M11 17l-3-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 13h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 12a8 8 0 1 1-2.34-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
