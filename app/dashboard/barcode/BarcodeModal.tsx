"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

      {/* MODAL BOX */}
      <div className="bg-gray-800 text-gray-100 w-full max-w-4xl rounded-xl shadow-2xl border border-gray-700 relative overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Barcode</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={printNow}
              className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-md text-white font-medium transition"
            >
              🖨 Print Barcode
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl font-bold px-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT BUT MODAL FIXED */}
        <div
          ref={printRef}
          className="max-h-[70vh] overflow-y-auto p-6 space-y-8"
        >
          {products.map((p) => (
            <div key={p.id}>
              <h3 className="font-semibold text-lg">{p.name}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3">
                {Array.from({ length: p.qty }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center shadow-sm"
                  >
                    {showStoreName && (
                      <p className="font-semibold text-sm text-blue-300">
                        Grocery Alpha
                      </p>
                    )}

                    {showProductName && (
                      <p className="text-gray-100">{p.name}</p>
                    )}

                    {showPrice && (
                      <p className="text-gray-400">Price: ${p.price}</p>
                    )}

                    {/* Barcode */}
                    <svg
                      className="barcode mx-auto mt-3"
                      data-code={p.code}
                    ></svg>

                    <p className="text-sm text-gray-400 mt-1">{p.code}</p>
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
