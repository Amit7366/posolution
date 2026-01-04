import { Warranty } from "../types/warranty";


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
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function displayDuration(w: Warranty) {
  const unit = w.period + (w.duration === 1 ? "" : "s");
  return `${w.duration} ${unit}`;
}

export function exportWarrantiesToCSV(rows: Warranty[], filename = "warranties.csv") {
  const headers = ["Warranty", "Description", "Duration", "Created Date", "Status"];
  const data = rows.map((r) => [r.name, r.description, displayDuration(r), r.createdAt, r.status]);
  const csv = [headers, ...data].map((r) => r.map(csvEscape).join(",")).join("\n");
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

export function exportWarrantiesToXLS(rows: Warranty[], filename = "warranties.xls") {
  const headers = ["Warranty", "Description", "Duration", "Created Date", "Status"];
  const data = rows.map((r) => [r.name, r.description, displayDuration(r), r.createdAt, r.status]);
  const tsv = [headers, ...data].map((r) => r.map((x) => String(x ?? "")).join("\t")).join("\n");
  downloadBlob(filename, new Blob([tsv], { type: "application/vnd.ms-excel;charset=utf-8" }));
}