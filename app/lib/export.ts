import { Brand } from "../types/brand";
import { Unit } from "../types/unit";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(v: string) {
  // Excel-safe basic escaping
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportBrandsToCSV(brands: Brand[], filename = "brands.csv") {
  const headers = ["Brand", "Created Date", "Status"];
  const rows = brands.map((b) => [b.name, b.createdAt, b.status]);
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

/**
 * Simple “XLS” export: Excel opens CSV fine; we just name it .xls.
 * If you need true XLSX, integrate SheetJS (xlsx) later.
 */
export function exportBrandsToXLS(brands: Brand[], filename = "brands.xls") {
  const headers = ["Brand", "Created Date", "Status"];
  const rows = brands.map((b) => [b.name, b.createdAt, b.status]);
  const tsv = [headers, ...rows].map((r) => r.map((x) => String(x ?? "")).join("\t")).join("\n");
  downloadBlob(filename, new Blob([tsv], { type: "application/vnd.ms-excel;charset=utf-8" }));
}


export function exportUnitsToCSV(units: Unit[], filename = "units.csv") {
  const headers = ["Unit", "Short name", "No of Products", "Created Date", "Status"];
  const rows = units.map((u) => [u.unit, u.shortName, String(u.productsCount), u.createdAt, u.status]);
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

/** Excel opens TSV fine; we name it .xls for convenience. For true XLSX later, use SheetJS. */
export function exportUnitsToXLS(units: Unit[], filename = "units.xls") {
  const headers = ["Unit", "Short name", "No of Products", "Created Date", "Status"];
  const rows = units.map((u) => [u.unit, u.shortName, String(u.productsCount), u.createdAt, u.status]);
  const tsv = [headers, ...rows].map((r) => r.map((x) => String(x ?? "")).join("\t")).join("\n");
  downloadBlob(filename, new Blob([tsv], { type: "application/vnd.ms-excel;charset=utf-8" }));
}