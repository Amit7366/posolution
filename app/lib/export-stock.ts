import { Person, Product, Stock, Store, Warehouse } from "../types/stock";


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

export function exportStockToCSV(args: {
  rows: Stock[];
  warehouses: Warehouse[];
  stores: Store[];
  products: Product[];
  people: Person[];
  filename?: string;
}) {
  const { rows, warehouses, stores, products, people, filename = "stock.csv" } = args;

  const wMap = new Map(warehouses.map((w) => [w.id, w.name]));
  const sMap = new Map(stores.map((s) => [s.id, s.name]));
  const pMap = new Map(products.map((p) => [p.id, p.name]));
  const peMap = new Map(people.map((p) => [p.id, p.name]));

  const headers = ["Warehouse", "Store", "Product", "Date", "Person", "Qty"];
  const data = rows.map((r) => [
    wMap.get(r.warehouseId) ?? "",
    sMap.get(r.storeId) ?? "",
    pMap.get(r.productId) ?? "",
    r.date,
    peMap.get(r.personId) ?? "",
    String(r.qty),
  ]);

  const csv = [headers, ...data].map((row) => row.map(csvEscape).join(",")).join("\n");
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

export function exportStockToXLS(args: {
  rows: Stock[];
  warehouses: Warehouse[];
  stores: Store[];
  products: Product[];
  people: Person[];
  filename?: string;
}) {
  const { rows, warehouses, stores, products, people, filename = "stock.xls" } = args;

  const wMap = new Map(warehouses.map((w) => [w.id, w.name]));
  const sMap = new Map(stores.map((s) => [s.id, s.name]));
  const pMap = new Map(products.map((p) => [p.id, p.name]));
  const peMap = new Map(people.map((p) => [p.id, p.name]));

  const headers = ["Warehouse", "Store", "Product", "Date", "Person", "Qty"];
  const data = rows.map((r) => [
    wMap.get(r.warehouseId) ?? "",
    sMap.get(r.storeId) ?? "",
    pMap.get(r.productId) ?? "",
    r.date,
    peMap.get(r.personId) ?? "",
    String(r.qty),
  ]);

  const tsv = [headers, ...data].map((row) => row.join("\t")).join("\n");
  downloadBlob(filename, new Blob([tsv], { type: "application/vnd.ms-excel;charset=utf-8" }));
}