"use client";
import React, { useMemo, useState } from "react";

// Product List - Single-file Next.js + Tailwind component
// - Production-ready UI (client-side) with search, filters, pagination, row actions, view modal
// - No external libraries
// - Drop into components/ and use <ProductList /> in a page

type User = { name: string; avatar?: string };
type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  unit: string;
  qty: number;
  createdBy: User;
  img?: string; // optional small image url (base64 or external)
  description?: string;
};

const currency = (n: number) => `$${n.toLocaleString()}`;

const sampleProducts: Product[] = [
  { id: "1", sku: "PT001", name: "Lenovo IdeaPad 3", category: "Computers", brand: "Lenovo", price: 600, unit: "Pc", qty: 100, createdBy: { name: "James Kirwin", avatar: undefined }, img: undefined, description: "14 inch laptop" },
  { id: "2", sku: "PT002", name: "Beats Pro", category: "Electronics", brand: "Beats", price: 160, unit: "Pc", qty: 140, createdBy: { name: "Francis Chang" }, description: "Wireless headphones" },
  { id: "3", sku: "PT003", name: "Nike Jordan", category: "Shoe", brand: "Nike", price: 110, unit: "Pc", qty: 300, createdBy: { name: "Antonio Engle" } },
  { id: "4", sku: "PT004", name: "Apple Series 5 Watch", category: "Electronics", brand: "Apple", price: 120, unit: "Pc", qty: 450, createdBy: { name: "Leo Kelly" } },
  { id: "5", sku: "PT005", name: "Amazon Echo Dot", category: "Electronics", brand: "Amazon", price: 80, unit: "Pc", qty: 320, createdBy: { name: "Annette Walker" } },
  { id: "6", sku: "PT006", name: "Sanford Chair Sofa", category: "Furnitures", brand: "Modern Wave", price: 320, unit: "Pc", qty: 650, createdBy: { name: "John Weaver" } },
  { id: "7", sku: "PT007", name: "Red Premium Satchel", category: "Bags", brand: "Dior", price: 60, unit: "Pc", qty: 700, createdBy: { name: "Gary Hennessy" } },
  { id: "8", sku: "PT008", name: "iPhone 14 Pro", category: "Phone", brand: "Apple", price: 540, unit: "Pc", qty: 630, createdBy: { name: "Eleanor Panek" } },
  { id: "9", sku: "PT009", name: "Gaming Chair", category: "Furniture", brand: "Arlime", price: 200, unit: "Pc", qty: 410, createdBy: { name: "William Levy" } },
  { id: "10", sku: "PT010", name: "Borealis Backpack", category: "Bags", brand: "The North Face", price: 45, unit: "Pc", qty: 550, createdBy: { name: "Charlotte Klotz" } },
];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [viewing, setViewing] = useState<Product | null>(null);

  // derive unique categories and brands from products
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const brands = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.brand)))], [products]);

  // filtering
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = query.trim().toLowerCase();
      if (q) {
        const match = [p.sku, p.name, p.brand, p.category].join(" ").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (brandFilter !== "All" && p.brand !== brandFilter) return false;
      return true;
    });
  }, [products, query, categoryFilter, brandFilter]);

  // pagination
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // handlers
  function toggleSelectAll(checked: boolean) {
    const newSel: Record<string, boolean> = {};
    if (checked) {
      pageItems.forEach((p) => (newSel[p.id] = true));
    }
    setSelectedIds(newSel);
  }

  function toggleRow(id: string) {
    setSelectedIds((s) => ({ ...s, [id]: !s[id] }));
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleBulkDelete() {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) return alert("No rows selected");
    if (!confirm(`Delete ${ids.length} selected products?`)) return;
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelectedIds({});
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    // very small placeholder: parse CSV would be implemented in prod
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Importing file: ${file.name} (parsing not implemented in this demo)`);
    e.currentTarget.value = "";
  }

  function handleExportCSV() {
    // simple CSV export
    const header = ["sku", "name", "category", "brand", "price", "unit", "qty", "createdBy"].join(",");
    const rows = products.map((p) => [p.sku, p.name, p.category, p.brand, p.price, p.unit, p.qty, p.createdBy.name].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // responsive page controls
  const gotoPage = (p: number) => setPage(Math.min(Math.max(1, p), pages));

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Product List</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">Manage your products</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded text-sm shadow-sm hover:shadow focus:outline-none dark:bg-slate-700 dark:border-slate-600">
            <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8 17l-4-4h3V7h2v6h3l-4 4z"/></svg>
            <span className="hidden sm:inline">Export</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded text-sm shadow-sm cursor-pointer hover:shadow dark:bg-slate-700 dark:border-slate-600">
            <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v10l3-3 5 5V2z"/></svg>
            <input type="file" accept=".csv,.xlsx" onChange={handleImport} className="hidden" />
            <span className="hidden sm:inline">Import Product</span>
          </label>

          <button className="px-4 py-2 bg-orange-500 text-white rounded text-sm shadow-sm hover:bg-orange-600">Add Product</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 border rounded p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 w-full md:w-1/2">
            <div className="relative w-full">
              <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search" className="w-full border rounded px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
              <svg className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M21 21l-4.35-4.35"/><path d="M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"/></svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="border px-3 py-2 rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }} className="border px-3 py-2 rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-auto border-collapse">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-300">
                <th className="p-3 pr-6 w-12">
                  <input type="checkbox" onChange={(e) => toggleSelectAll(e.target.checked)} checked={pageItems.every((p) => selectedIds[p.id]) && pageItems.length > 0} />
                </th>
                <th className="p-3">SKU</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Price</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Created By</th>
                <th className="p-3 w-40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-500 dark:text-slate-300">No products found</td>
                </tr>
              ) : (
                pageItems.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="p-3 pr-6">
                      <input type="checkbox" checked={!!selectedIds[p.id]} onChange={() => toggleRow(p.id)} />
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-100">{p.sku}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-700 dark:text-slate-100">{p.name.split(" ").slice(0,2).map(s=>s[0]).join("")}</div>
                        <div className="text-slate-700 dark:text-slate-100">{p.name}</div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{p.brand}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-100">{currency(p.price)}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{p.unit}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-100">{p.qty}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs">{p.createdBy.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                        <div className="text-slate-700 dark:text-slate-100">{p.createdBy.name}</div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => setViewing(p)} className="p-2 rounded border bg-white dark:bg-slate-700 dark:border-slate-600" title="View">
                          <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7z"/><path d="M12 9a3 3 0 100 6 3 3 0 000-6z"/></svg>
                        </button>
                        <button onClick={() => alert('Edit not implemented in demo')} className="p-2 rounded border bg-white dark:bg-slate-700 dark:border-slate-600" title="Edit">
                          <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded border bg-white dark:bg-slate-700 dark:border-slate-600" title="Delete">
                          <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">Row Per Page</div>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border px-2 py-1 rounded text-sm bg-white dark:bg-slate-700 dark:border-slate-600">
              {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <div className="text-sm text-slate-600 dark:text-slate-300">Entries</div>

            <div className="ml-4">
              <button onClick={handleBulkDelete} className="px-3 py-1 border rounded text-sm bg-white dark:bg-slate-700">Delete Selected</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-300">{(page-1)*perPage + 1} - {Math.min(page*perPage, total)} of {total}</div>

            <nav className="inline-flex items-center gap-1">
              <button onClick={() => gotoPage(page-1)} className="p-2 rounded border bg-white dark:bg-slate-700" disabled={page===1}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6l-6 6 6 6"/></svg>
              </button>
              {/* simple numbered pagination (show up to 5 pages) */}
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const start = Math.max(1, Math.min(pages-4, page-2));
                return start + i;
              }).map((pNum) => (
                <button key={pNum} onClick={() => gotoPage(pNum)} className={`px-3 py-1 rounded ${pNum===page? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 border'}`}>
                  {pNum}
                </button>
              ))}
              <button onClick={() => gotoPage(page+1)} className="p-2 rounded border bg-white dark:bg-slate-700" disabled={page===pages}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 6l6 6-6 6"/></svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewing(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded shadow-lg overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{viewing.name}</h3>
                <div className="text-sm text-slate-500 dark:text-slate-300">SKU: {viewing.sku}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewing(null)} className="p-2 rounded bg-white border dark:bg-slate-700">Close</button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="w-full h-40 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">Image</div>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-slate-700 dark:text-slate-100 font-semibold">{currency(viewing.price)}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Stock: {viewing.qty} {viewing.unit}</div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">Category: {viewing.category} • Brand: {viewing.brand}</div>
                <div className="text-sm text-slate-700 dark:text-slate-200">{viewing.description || 'No description provided.'}</div>

                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-2 bg-orange-500 text-white rounded">Edit</button>
                  <button onClick={() => { handleDelete(viewing.id); setViewing(null); }} className="px-3 py-2 border rounded">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
