import { VariantAttribute } from "../types/variant-attribute";


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

export function exportVariantsToCSV(rows: VariantAttribute[], filename = "variants.csv") {
  const headers = ["Variant", "Values", "Created Date", "Status"];
  const data = rows.map((r) => [r.name, r.values.join(", "), r.createdAt, r.status]);

  const csv = [headers, ...data].map((r) => r.map(csvEscape).join(",")).join("\n");
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

/** Excel opens TSV fine; naming it .xls is a common lightweight option */
export function exportVariantsToXLS(rows: VariantAttribute[], filename = "variants.xls") {
  const headers = ["Variant", "Values", "Created Date", "Status"];
  const data = rows.map((r) => [r.name, r.values.join(", "), r.createdAt, r.status]);

  const tsv = [headers, ...data].map((r) => r.join("\t")).join("\n");
  downloadBlob(filename, new Blob([tsv], { type: "application/vnd.ms-excel;charset=utf-8" }));
}