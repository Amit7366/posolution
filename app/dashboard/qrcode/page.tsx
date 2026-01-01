"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

/* ----------------------------- Types ----------------------------- */

type Warehouse = { id: string; name: string };
type Store = { id: string; warehouseId: string; name: string };

type Product = {
  id: string;
  name: string;
  sku: string;
  code: string;
  referenceNumber: string;
  iconUrl?: string;
};

type PaperSize = "A4" | "A5" | "Sticker 50x30" | "Sticker 40x25";

type LineItem = {
  id: string;
  product: Product;
  qty: number;
  qrDataUrl?: string; // generated
};

/* ----------------------------- Mock Data (replace with API) ----------------------------- */

const warehouses: Warehouse[] = [
  { id: "w1", name: "Main Warehouse" },
  { id: "w2", name: "Secondary Warehouse" },
];

const stores: Store[] = [
  { id: "s1", warehouseId: "w1", name: "Store A" },
  { id: "s2", warehouseId: "w1", name: "Store B" },
  { id: "s3", warehouseId: "w2", name: "Store C" },
];

const products: Product[] = [
  {
    id: "p1",
    name: "Nike Jordan",
    sku: "PT002",
    code: "HG3FK",
    referenceNumber: "32RRR554",
    iconUrl: "https://logo.clearbit.com/nike.com",
  },
  {
    id: "p2",
    name: "Apple Watch",
    sku: "AP110",
    code: "A1B2C",
    referenceNumber: "REF-11821",
    iconUrl: "https://logo.clearbit.com/apple.com",
  },
  {
    id: "p3",
    name: "Lenovo ThinkPad",
    sku: "LN900",
    code: "LNV99",
    referenceNumber: "REF-90001",
    iconUrl: "https://logo.clearbit.com/lenovo.com",
  },
];

/* ----------------------------- Helpers ----------------------------- */

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Payload used to generate QR */
function buildQrPayload(args: {
  warehouseId: string;
  storeId: string;
  product: Product;
  includeRef: boolean;
}) {
  // You can change this to whatever your backend expects:
  // e.g. only product.code, or a URL, or JSON.
  const base = {
    warehouseId: args.warehouseId,
    storeId: args.storeId,
    sku: args.product.sku,
    code: args.product.code,
    ...(args.includeRef ? { referenceNumber: args.product.referenceNumber } : {}),
  };
  return JSON.stringify(base);
}

function paperConfig(size: PaperSize) {
  // Print layout tuning: columns + QR size
  switch (size) {
    case "A4":
      return { cols: 4, qrPx: 160, gap: 14, pad: 18 };
    case "A5":
      return { cols: 3, qrPx: 150, gap: 14, pad: 16 };
    case "Sticker 50x30":
      return { cols: 3, qrPx: 130, gap: 12, pad: 12 };
    case "Sticker 40x25":
      return { cols: 4, qrPx: 120, gap: 10, pad: 10 };
  }
}

/* ----------------------------- Page ----------------------------- */

export default function PrintQrCodePage() {
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [storeId, setStoreId] = useState<string>("");
  const [productQuery, setProductQuery] = useState("");
  const [paperSize, setPaperSize] = useState<PaperSize | "">("");
  const [includeRef, setIncludeRef] = useState(true);

  const [items, setItems] = useState<LineItem[]>([
    // matches your screenshot row example
    { id: uid(), product: products[0], qty: 4 },
  ]);

  const [collapsed, setCollapsed] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const storeOptions = useMemo(() => stores.filter((s) => s.warehouseId === warehouseId), [warehouseId]);

  useEffect(() => {
    // if warehouse changes, ensure store belongs to it
    if (storeId && !storeOptions.some((s) => s.id === storeId)) setStoreId("");
  }, [warehouseId, storeId, storeOptions]);

  const previewItem = useMemo(
    () => items.find((x) => x.id === previewItemId) ?? null,
    [items, previewItemId]
  );

  function addProductByCode(code: string) {
    const clean = code.trim();
    if (!clean) return;

    const p = products.find((x) => x.code.toLowerCase() === clean.toLowerCase());
    if (!p) {
      setFormError("Product not found for this code.");
      return;
    }

    setFormError(null);

    setItems((prev) => {
      const existing = prev.find((it) => it.product.id === p.id);
      if (existing) {
        return prev.map((it) => (it.product.id === p.id ? { ...it, qty: it.qty + 1 } : it));
      }
      return [...prev, { id: uid(), product: p, qty: 1 }];
    });
    setProductQuery("");
  }

  async function generateQrForItems(openPreview = true) {
    // Validate required fields (like screenshot red *)
    if (!warehouseId) return setFormError("Warehouse is required.");
    if (!storeId) return setFormError("Store is required.");
    if (!paperSize) return setFormError("Paper size is required.");
    if (items.length === 0) return setFormError("Please add at least one product.");

    setFormError(null);
    setBusy(true);

    try {
      const next = await Promise.all(
        items.map(async (it) => {
          const payload = buildQrPayload({
            warehouseId,
            storeId,
            product: it.product,
            includeRef,
          });

          const dataUrl = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: "M",
            margin: 1,
            width: 220, // higher for crisp print; we scale in print grid
          });

          return { ...it, qrDataUrl: dataUrl };
        })
      );

      setItems(next);

      if (openPreview) {
        const first = next[0];
        setPreviewItemId(first?.id ?? null);
        setPreviewOpen(true);
      }
    } finally {
      setBusy(false);
    }
  }

  function resetAll() {
    setWarehouseId("");
    setStoreId("");
    setProductQuery("");
    setPaperSize("");
    setIncludeRef(true);
    setItems([]);
    setFormError(null);
    setPreviewOpen(false);
    setPreviewItemId(null);
  }

  function printAllQrs() {
    if (!paperSize) return setFormError("Paper size is required.");
    if (items.length === 0) return setFormError("No items to print.");
    if (items.some((x) => !x.qrDataUrl)) return setFormError("Please generate QR code first.");

    setFormError(null);

    const cfg = paperConfig(paperSize);
    const printWindow = window.open("", "_blank", "width=900,height=650");
    if (!printWindow) return;

    // Build repeated labels by qty
    const labels: Array<{ name: string; ref: string; qr: string }> = [];
    for (const it of items) {
      for (let i = 0; i < it.qty; i++) {
        labels.push({
          name: it.product.name,
          ref: it.product.referenceNumber,
          qr: it.qrDataUrl!,
        });
      }
    }

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Print QR Code</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: ${cfg.pad}px; font-family: Arial, sans-serif; }
    .grid {
      display: grid;
      grid-template-columns: repeat(${cfg.cols}, 1fr);
      gap: ${cfg.gap}px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
      page-break-inside: avoid;
    }
    .name { font-size: 12px; font-weight: 700; margin-bottom: 8px; }
    .ref { font-size: 11px; color: #111827; margin-top: 8px; }
    img { width: ${cfg.qrPx}px; height: ${cfg.qrPx}px; object-fit: contain; }
    @media print {
      @page { margin: 0; }
      body { padding: ${cfg.pad}px; }
    }
  </style>
</head>
<body>
  <div class="grid">
    ${labels
      .map(
        (l) => `
      <div class="card">
        <div class="name">${escapeHtml(l.name)}</div>
        <img src="${l.qr}" />
        ${includeRef ? `<div class="ref">Ref No : ${escapeHtml(l.ref)}</div>` : ""}
      </div>
    `
      )
      .join("")}
  </div>
  <script>
    window.onload = () => {
      window.focus();
      window.print();
      window.onafterprint = () => window.close();
    }
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  function printSingle(item: LineItem) {
    if (!paperSize) return setFormError("Paper size is required.");
    if (!item.qrDataUrl) return setFormError("Please generate QR code first.");

    const cfg = paperConfig(paperSize);
    const w = window.open("", "_blank", "width=600,height=600");
    if (!w) return;

    const labels = Array.from({ length: item.qty }).map(() => ({
      name: item.product.name,
      ref: item.product.referenceNumber,
      qr: item.qrDataUrl!,
    }));

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Print QR Code</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: ${cfg.pad}px; font-family: Arial, sans-serif; }
    .grid {
      display: grid;
      grid-template-columns: repeat(${cfg.cols}, 1fr);
      gap: ${cfg.gap}px;
    }
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 10px;
      text-align: center;
      page-break-inside: avoid;
    }
    .name { font-size: 12px; font-weight: 700; margin-bottom: 8px; }
    .ref { font-size: 11px; color: #111827; margin-top: 8px; }
    img { width: ${cfg.qrPx}px; height: ${cfg.qrPx}px; object-fit: contain; }
  </style>
</head>
<body>
  <div class="grid">
    ${labels
      .map(
        (l) => `
      <div class="card">
        <div class="name">${escapeHtml(l.name)}</div>
        <img src="${l.qr}" />
        ${includeRef ? `<div class="ref">Ref No : ${escapeHtml(l.ref)}</div>` : ""}
      </div>
    `
      )
      .join("")}
  </div>
  <script>
    window.onload = () => {
      window.focus();
      window.print();
      window.onafterprint = () => window.close();
    }
  </script>
</body>
</html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(60%_40%_at_50%_0%,rgba(249,115,22,0.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-[1600px] px-6 py-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Print QR Code</h1>
            <p className="mt-1 text-sm text-slate-400">Manage your QR code</p>
          </div>

          <div className="flex items-center gap-2">
            <IconButton title="Refresh" onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
            <IconButton title="Collapse" onClick={() => setCollapsed((s) => !s)}>
              <ChevronUpIcon />
            </IconButton>
          </div>
        </div>

        {/* Card */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
          {!collapsed && (
            <div className="px-6 py-6">
              {/* Warehouse + Store */}
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Warehouse" required>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Store" required>
                  <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className={selectClass}>
                    <option value="">Select</option>
                    {storeOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Product search */}
              <div className="mt-7">
                <Field label="Product" required>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <SearchIcon />
                    </span>
                    <input
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addProductByCode(productQuery);
                      }}
                      placeholder="Search Product by Code"
                      className={cn(inputClass, "pl-10")}
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Tip: type product code (e.g. <span className="text-slate-300">HG3FK</span>) then press Enter.
                  </div>
                </Field>
              </div>

              {/* Items table */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px]">
                    <thead>
                      <tr className="text-left text-sm text-slate-300">
                        <th className="px-4 py-4 font-semibold text-slate-100">Product</th>
                        <th className="px-4 py-4 font-semibold text-slate-100">SKU</th>
                        <th className="px-4 py-4 font-semibold text-slate-100">Code</th>
                        <th className="px-4 py-4 font-semibold text-slate-100">Reference Number</th>
                        <th className="px-4 py-4 font-semibold text-slate-100">Qty</th>
                        <th className="px-4 py-4 font-semibold text-slate-100"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/10">
                      {items.map((it) => (
                        <tr key={it.id} className="hover:bg-white/[0.03]">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <ProductIcon name={it.product.name} iconUrl={it.product.iconUrl} />
                              <div className="text-sm font-semibold text-slate-100">{it.product.name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-400">{it.product.sku}</td>
                          <td className="px-4 py-4 text-sm text-slate-400">{it.product.code}</td>
                          <td className="px-4 py-4 text-sm text-slate-400">{it.product.referenceNumber}</td>
                          <td className="px-4 py-4">
                            <QtyStepper
                              value={it.qty}
                              onChange={(v) =>
                                setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, qty: v } : x)))
                              }
                            />
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              title="Remove"
                              onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                              className="grid h-10 w-10 place-items-center rounded-lg bg-[#133b68] text-white transition hover:brightness-110 active:translate-y-[1px]"
                            >
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {items.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                            No products added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paper size + ref toggle */}
              <div className="mt-7 grid gap-6 md:grid-cols-[1fr_260px]">
                <Field label="Paper Size" required>
                  <select value={paperSize} onChange={(e) => setPaperSize(e.target.value as any)} className={selectClass}>
                    <option value="">Select</option>
                    {(["A4", "A5", "Sticker 50x30", "Sticker 40x25"] as PaperSize[]).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="flex items-end justify-start">
                  <div className="flex items-center gap-3 pb-1">
                    <div className="text-sm font-medium text-slate-200">Reference Number</div>
                    <Toggle value={includeRef} onChange={setIncludeRef} />
                  </div>
                </div>
              </div>

              {formError && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {formError}
                </div>
              )}

              <div className="mt-7 border-t border-white/10 pt-5">
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => generateQrForItems(true)}
                    disabled={busy}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition active:translate-y-[1px]",
                      busy
                        ? "cursor-not-allowed bg-orange-500/45"
                        : "bg-orange-500 shadow-[0_12px_30px_-16px_rgba(249,115,22,0.95)] hover:bg-orange-400"
                    )}
                  >
                    <TargetIcon />
                    Generate QR Code
                  </button>

                  <button
                    type="button"
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0f2f52] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:translate-y-[1px]"
                  >
                    <PowerIcon />
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // Ensure QR exists; if not, generate then print
                      if (items.some((x) => !x.qrDataUrl)) {
                        generateQrForItems(false).then(() => printAllQrs());
                      } else {
                        printAllQrs();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 active:translate-y-[1px]"
                  >
                    <PrintIcon />
                    Print QRcode
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="QR Code" size="md">
        {previewItem ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-lg font-semibold text-slate-100">{previewItem.product.name}</div>
              <button
                type="button"
                onClick={() => printSingle(previewItem)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 active:translate-y-[1px]"
              >
                <PrintIcon />
                Print QR Code
              </button>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-4">
                <div className="grid h-[110px] w-[170px] place-items-center rounded-xl border border-white/10 bg-white/5">
                  {previewItem.qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewItem.qrDataUrl} alt="QR" className="h-[85px] w-[85px] object-contain" />
                  ) : (
                    <div className="text-sm text-slate-400">Not generated</div>
                  )}
                </div>

                <div className="text-sm text-slate-400">
                  {includeRef && (
                    <div className="mt-1">
                      Ref No : <span className="text-slate-200">{previewItem.product.referenceNumber}</span>
                    </div>
                  )}
                  <div className="mt-1">
                    Code : <span className="text-slate-200">{previewItem.product.code}</span>
                  </div>
                  <div className="mt-1">
                    Qty : <span className="text-slate-200">{previewItem.qty}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* quick navigation if multiple */}
            {items.length > 1 && (
              <div className="flex flex-wrap items-center gap-2">
                {items.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => setPreviewItemId(x.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition",
                      x.id === previewItem.id
                        ? "border-orange-500/40 bg-orange-500/10 text-slate-100"
                        : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.06]"
                    )}
                  >
                    {x.product.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-400">No preview item.</div>
        )}
      </Modal>
    </div>
  );
}

/* ----------------------------- UI Components ----------------------------- */

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0b0f14] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4";

const selectClass =
  "w-full appearance-none rounded-xl border border-white/10 bg-[#0b0f14] px-4 py-3 text-sm text-slate-100 outline-none ring-orange-500/30 transition focus:border-orange-500/30 focus:ring-4";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function IconButton({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "relative h-6 w-11 rounded-full border border-white/10 transition",
        value ? "bg-emerald-500/40" : "bg-white/10"
      )}
      aria-label="Toggle"
      title="Toggle"
    >
      <span
        className={cn(
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition",
          value ? "left-5" : "left-1"
        )}
      />
    </button>
  );
}

function QtyStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-black/20 px-3 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-slate-200 hover:bg-white/10"
        title="Decrease"
      >
        <MinusIcon />
      </button>
      <div className="min-w-6 text-center text-sm font-semibold text-slate-100">{value}</div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-slate-200 hover:bg-white/10"
        title="Increase"
      >
        <PlusIconSmall />
      </button>
    </div>
  );
}

function ProductIcon({ name, iconUrl }: { name: string; iconUrl?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-white text-xs font-bold text-slate-900 ring-1 ring-white/10">
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={iconUrl} alt={name} className="h-full w-full object-contain bg-white" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

/* ----------------------------- Modal ----------------------------- */

function Modal({
  open,
  onClose,
  title,
  size = "lg",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // focus
    setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        className={cn(
          "relative w-full rounded-2xl border border-white/10 bg-[#0b0f14] shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)]",
          size === "md" ? "max-w-[700px]" : "max-w-[860px]"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-red-500/15 text-red-400 transition hover:bg-red-500/25"
            aria-label="Close"
            title="Close"
          >
            <XIcon />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ----------------------------- Print safety ----------------------------- */

function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ----------------------------- Icons ----------------------------- */

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6l1 15h8l1-15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M6 12h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
function PlusIconSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
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
function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 22a10 10 0 1 0-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 12A10 10 0 0 0 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 8a4 4 0 1 0 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12 21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PowerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M7 4.8A9 9 0 1 0 17 4.8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M7 7V3h10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M7 17H6a3 3 0 0 1-3-3v-3a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M7 14h10v7H7v-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
