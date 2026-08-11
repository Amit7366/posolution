"use client";

import { formatTaka } from "./formatTaka";

export type ReceiptInvoice = {
  invoiceNo?: string;
  customerName?: string;
  customerPhone?: string;
  createdAt?: string;
  status?: string;
  items?: Array<{
    productName?: string;
    qty?: number;
    unitPrice?: number;
    lineTotal?: number;
    discount?: number;
  }>;
  subTotal?: number;
  discountTotal?: number;
  vatAmount?: number;
  totalAmount?: number;
  paid?: number;
  paymentType?: string;
  cashAmount?: number;
  changeAmount?: number;
  customerNote?: string;
  notes?: string;
  fromParty?: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
};

type StoreInfo = {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  logo?: string;
};

type Props = {
  detail: ReceiptInvoice;
  store?: StoreInfo | null;
  /** screen = styled preview; print = plain thermal markup */
  mode?: "screen" | "print";
};

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function moneyPlain(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString("en-BD", { maximumFractionDigits: 2 });
}

function paymentLabel(type?: string) {
  const t = (type || "cash").toLowerCase();
  if (t === "bkash") return "bKash";
  if (t === "nagad") return "Nagad";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Narrow thermal receipt (58–80mm). High-contrast, compact, dashed separators.
 */
export default function PosReceipt({ detail, store, mode = "screen" }: Props) {
  const items = Array.isArray(detail.items) ? detail.items : [];
  const shopName =
    store?.name || detail.fromParty?.name || "posulation";
  const shopAddress =
    store?.address || detail.fromParty?.address || "";
  const shopEmail =
    store?.email || detail.fromParty?.email || "";
  const shopPhone =
    store?.phone || detail.fromParty?.phone || "";
  const logo = store?.logo;

  const headerLine = shopAddress
    ? `${shopName} | ${shopAddress}`
    : shopName;

  const subTotal = Number(detail.subTotal ?? 0);
  const discount = Number(detail.discountTotal ?? 0);
  const tax = Number(detail.vatAmount ?? 0);
  const total = Number(detail.totalAmount ?? 0);
  const cash = Number(detail.cashAmount ?? detail.paid ?? 0);
  const change = Number(detail.changeAmount ?? 0);

  return (
    <div
      className={
        mode === "screen"
          ? "mx-auto w-full max-w-[300px] bg-white px-3 py-4 font-mono text-[11px] leading-snug text-black shadow-sm ring-1 ring-gray-200"
          : "pos-receipt"
      }
      style={
        mode === "print"
          ? {
              width: "72mm",
              maxWidth: "72mm",
              margin: "0 auto",
              padding: "2mm 3mm",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "11px",
              lineHeight: 1.35,
              color: "#000",
              background: "#fff",
            }
          : undefined
      }
    >
      {/* Logo */}
      <div className="mb-2 flex justify-center">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            style={{ maxWidth: 56, maxHeight: 56, objectFit: "contain" }}
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center border border-dashed border-gray-400 text-[10px] text-gray-500"
            style={mode === "print" ? { width: 48, height: 48 } : undefined}
          >
            LOGO
          </div>
        )}
      </div>

      <p className="text-center text-[12px] font-bold">{headerLine}</p>
      {(shopPhone || shopEmail) && (
        <p className="mt-0.5 text-center text-[10px] text-gray-700">
          {[shopPhone, shopEmail].filter(Boolean).join(" · ")}
        </p>
      )}

      <p className="mt-2 text-center text-[12px] font-bold tracking-wide">
        RETAIL INVOICE
      </p>

      <Dash />

      <MetaRow label="Invoice No" value={detail.invoiceNo || "—"} />
      <MetaRow label="Name" value={detail.customerName || "Walking Customer"} />
      <MetaRow label="Date" value={formatDateTime(detail.createdAt)} />
      <MetaRow label="Phone" value={detail.customerPhone || "—"} />
      <MetaRow
        label="Status"
        value={detail.status === "paid" ? "Paid" : "Unpaid"}
      />

      <Dash />

      {/* Items header */}
      <div className="grid grid-cols-[1fr_28px_40px_44px] gap-0.5 text-[10px] font-bold">
        <span># Item</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Price</span>
        <span className="text-right">Total</span>
      </div>
      <Dash />

      {items.length === 0 ? (
        <p className="py-1 text-center text-gray-500">No items</p>
      ) : (
        items.map((it, idx) => (
          <div key={idx} className="mb-1.5">
            <p className="font-medium">
              {idx + 1}. {it.productName || "Item"}
            </p>
            <div className="grid grid-cols-[1fr_28px_40px_44px] gap-0.5 text-[10px]">
              <span />
              <span className="text-right">{it.qty ?? 0} Pc</span>
              <span className="text-right">{moneyPlain(Number(it.unitPrice) || 0)}</span>
              <span className="text-right">{moneyPlain(Number(it.lineTotal) || 0)}</span>
            </div>
          </div>
        ))
      )}

      <Dash />

      <div className="space-y-0.5 text-[11px]">
        <SumRow label="Sub total" value={`৳${moneyPlain(subTotal)}`} />
        <SumRow label="Shipping Charge" value="৳0" />
        <SumRow label="(-) Discount" value={`৳${moneyPlain(discount)}`} />
        <SumRow label="(+) Tax" value={`৳${moneyPlain(tax)}`} />
      </div>

      <div className="my-1 border-t border-dashed border-black" />

      <SumRow
        label="Net payable"
        value={`৳${moneyPlain(total)}`}
        bold
      />

      <Dash />

      <SumRow label="Paid By" value={paymentLabel(detail.paymentType)} />
      <SumRow label="Cash Amount" value={`৳${moneyPlain(cash)}`} />
      <SumRow label="Change Amount" value={formatTaka(change)} />

      <Dash />

      <p className="px-1 text-center text-[10px] leading-relaxed">
        Thank you for your business!
        {shopEmail
          ? ` Please contact us at ${shopEmail} for any questions.`
          : ""}
      </p>

      <p className="mt-3 text-center text-[10px] tracking-wider">
        ===== Completed =====
      </p>
    </div>
  );
}

function Dash() {
  return (
    <div
      className="my-2 overflow-hidden text-center text-[10px] leading-none text-black"
      aria-hidden
    >
      - - - - - - - - - - - - - - - - - - - - - -
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[11px]">
      <span className="w-[72px] shrink-0 font-semibold">{label}:</span>
      <span className="min-w-0 break-words">{value}</span>
    </div>
  );
}

function SumRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-2 ${bold ? "text-[12px] font-bold" : ""}`}
    >
      <span>{label}:</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

/** Opens a dedicated print window sized for 80mm thermal paper. */
export function printPosReceipt(detail: ReceiptInvoice, store?: StoreInfo | null) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=320,height=720");
  if (!w) return false;

  const shopName = store?.name || detail.fromParty?.name || "posulation";
  const shopAddress = store?.address || detail.fromParty?.address || "";
  const shopEmail = store?.email || detail.fromParty?.email || "";
  const shopPhone = store?.phone || detail.fromParty?.phone || "";
  const headerLine = shopAddress ? `${escapeHtml(shopName)} | ${escapeHtml(shopAddress)}` : escapeHtml(shopName);
  const items = Array.isArray(detail.items) ? detail.items : [];

  const itemRows = items
    .map((it, idx) => {
      return `
        <div class="item">
          <div class="item-name">${idx + 1}. ${escapeHtml(it.productName || "Item")}</div>
          <div class="item-cols">
            <span></span>
            <span class="r">${Number(it.qty) || 0} Pc</span>
            <span class="r">${moneyPlain(Number(it.unitPrice) || 0)}</span>
            <span class="r">${moneyPlain(Number(it.lineTotal) || 0)}</span>
          </div>
        </div>`;
    })
    .join("");

  const logoHtml = store?.logo
    ? `<img class="logo" src="${escapeHtml(store.logo)}" alt="" />`
    : `<div class="logo-ph">LOGO</div>`;

  const contactLine = [shopPhone, shopEmail].filter(Boolean).map(escapeHtml).join(" · ");

  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(detail.invoiceNo || "Receipt")}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 80mm;
      background: #fff;
      color: #000;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .receipt {
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      padding: 3mm 2mm 6mm;
    }
    .center { text-align: center; }
    .bold { font-weight: 700; }
    .logo { display: block; max-width: 56px; max-height: 56px; margin: 0 auto 4px; object-fit: contain; }
    .logo-ph {
      width: 48px; height: 48px; margin: 0 auto 4px;
      border: 1px dashed #666; display: flex; align-items: center; justify-content: center;
      font-size: 9px; color: #666;
    }
    .dash {
      margin: 6px 0;
      border-top: 1px dashed #000;
      height: 0;
    }
    .meta { display: flex; gap: 6px; margin: 1px 0; }
    .meta .k { width: 72px; flex-shrink: 0; font-weight: 700; }
    .meta .v { flex: 1; word-break: break-word; }
    .cols {
      display: grid;
      grid-template-columns: 1fr 28px 40px 44px;
      gap: 2px;
      font-size: 10px;
      font-weight: 700;
    }
    .item { margin-bottom: 6px; }
    .item-name { font-weight: 600; }
    .item-cols {
      display: grid;
      grid-template-columns: 1fr 28px 40px 44px;
      gap: 2px;
      font-size: 10px;
    }
    .r { text-align: right; }
    .sum { display: flex; justify-content: space-between; gap: 8px; margin: 1px 0; }
    .sum.total { font-weight: 700; font-size: 12px; margin-top: 2px; }
    .tiny { font-size: 10px; }
    .footer { margin-top: 8px; text-align: center; font-size: 10px; line-height: 1.4; }
    .done { margin-top: 10px; text-align: center; letter-spacing: 1px; font-size: 10px; }
  </style>
</head>
<body>
  <div class="receipt">
    ${logoHtml}
    <p class="center bold">${headerLine}</p>
    ${contactLine ? `<p class="center tiny">${contactLine}</p>` : ""}
    <p class="center bold" style="margin-top:6px">RETAIL INVOICE</p>
    <div class="dash"></div>
    <div class="meta"><span class="k">Invoice No:</span><span class="v">${escapeHtml(detail.invoiceNo || "—")}</span></div>
    <div class="meta"><span class="k">Name:</span><span class="v">${escapeHtml(detail.customerName || "Walking Customer")}</span></div>
    <div class="meta"><span class="k">Date:</span><span class="v">${escapeHtml(formatDateTime(detail.createdAt))}</span></div>
    <div class="meta"><span class="k">Phone:</span><span class="v">${escapeHtml(detail.customerPhone || "—")}</span></div>
    <div class="meta"><span class="k">Status:</span><span class="v">${detail.status === "paid" ? "Paid" : "Unpaid"}</span></div>
    <div class="dash"></div>
    <div class="cols"><span># Item</span><span class="r">Qty</span><span class="r">Price</span><span class="r">Total</span></div>
    <div class="dash"></div>
    ${itemRows || `<p class="center">No items</p>`}
    <div class="dash"></div>
    <div class="sum"><span>Sub total:</span><span>৳${moneyPlain(Number(detail.subTotal) || 0)}</span></div>
    <div class="sum"><span>Shipping Charge:</span><span>৳0</span></div>
    <div class="sum"><span>(-) Discount:</span><span>৳${moneyPlain(Number(detail.discountTotal) || 0)}</span></div>
    <div class="sum"><span>(+) Tax:</span><span>৳${moneyPlain(Number(detail.vatAmount) || 0)}</span></div>
    <div class="dash"></div>
    <div class="sum total"><span>Net payable:</span><span>৳${moneyPlain(Number(detail.totalAmount) || 0)}</span></div>
    <div class="dash"></div>
    <div class="sum"><span>Paid By:</span><span>${escapeHtml(paymentLabel(detail.paymentType))}</span></div>
    <div class="sum"><span>Cash Amount:</span><span>৳${moneyPlain(Number(detail.cashAmount ?? detail.paid) || 0)}</span></div>
    <div class="sum"><span>Change Amount:</span><span>${escapeHtml(formatTaka(Number(detail.changeAmount) || 0))}</span></div>
    <div class="dash"></div>
    <p class="footer">Thank you for your business!${
      shopEmail
        ? ` Please contact us at ${escapeHtml(shopEmail)} for any questions.`
        : ""
    }</p>
    <p class="done">===== Completed =====</p>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 150);
    };
  </script>
</body>
</html>`);
  w.document.close();
  return true;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
