"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Product {
  id: number;
  name: string;
  sku: string;
  code: string;
  price: number;
  qty: number;
}

export default function BarcodeModal({
  products,
  showStoreName,
  showProductName,
  showPrice,
  onClose,
}: {
  products: Product[];
  showStoreName: boolean;
  showProductName: boolean;
  showPrice: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.querySelectorAll("svg.barcode").forEach((svg: any) => {
      JsBarcode(svg, svg.dataset.code ?? "", {
        displayValue: false,
        height: 60,
      });
    });
  }, [products]);

  const printNow = () => {
    const printContents = printRef.current?.innerHTML;
    const w = window.open("", "_blank", "width=800,height=600");
    w?.document.write(printContents || "");
    w?.document.close();
    w?.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 dark:bg-black/70">

      {/* MODAL BOX */}
      <div className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xl relative overflow-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("dash.barcode.modalTitle")}</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={printNow}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white font-medium transition"
            >
              🖨 {t("dash.barcode.print")}
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl font-bold px-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div
          ref={printRef}
          className="max-h-[70vh] overflow-y-auto p-6 space-y-8"
        >
          {products.map((p) => (
            <div key={p.id}>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{p.name}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">
                {Array.from({ length: p.qty }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    {showStoreName && (
                      <p className="font-semibold text-sm text-blue-600 dark:text-blue-300">
                        Grocery Alpha
                      </p>
                    )}

                    {showProductName && (
                      <p className="text-gray-900 dark:text-gray-100">{p.name}</p>
                    )}

                    {showPrice && (
                      <p className="text-gray-500 dark:text-gray-400">
                        {t("dash.barcode.modalPricePrefix")}: ${p.price}
                      </p>
                    )}

                    {/* Barcode */}
                    <svg
                      className="barcode mx-auto mt-3"
                      data-code={p.code}
                    ></svg>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{p.code}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
