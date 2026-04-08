"use client";

import { useState } from "react";
import BarcodeModal from "./BarcodeModal";
import { Eye, Printer, RefreshCcwIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Product {
  id: number;
  name: string;
  sku: string;
  code: string;
  price: number;
  image: string;
  qty: number;
}

export default function BarcodePage() {
  const { t } = useTranslation();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Nike Jordan",
      sku: "PT002",
      code: "HG3FK",
      price: 400,
      image: "/nike.png",
      qty: 4,
    },
    {
      id: 2,
      name: "Apple Series 5 Watch",
      sku: "PT003",
      code: "TEUIU7",
      price: 300,
      image: "/watch.png",
      qty: 4,
    },
  ]);

  const [showStoreName, setShowStoreName] = useState(true);
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const increaseQty = (id: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: p.qty + 1 } : p
      )
    );
  };

  const decreaseQty = (id: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id && p.qty > 1 ? { ...p, qty: p.qty - 1 } : p
      )
    );
  };

  const removeProduct = (id: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const resetAll = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="p-6 text-gray-900 dark:text-gray-200">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t("dash.barcode.title")}</h1>
      <p className="text-gray-500 dark:text-gray-400">{t("dash.barcode.manage")}</p>

      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">

        {/* Warehouse + Store */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t("dash.barcode.warehouse")}</span>
            <select className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
              <option>{t("dash.barcode.selectPlaceholder")}</option>
            </select>
          </label>

          <label className="block">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t("dash.barcode.store")}</span>
            <select className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
              <option>{t("dash.barcode.selectPlaceholder")}</option>
            </select>
          </label>
        </div>

        {/* Product Search */}
        <div className="mt-6">
          <span className="font-medium text-gray-700 dark:text-gray-300">{t("dash.barcode.product")}</span>
          <input
            placeholder={t("dash.barcode.searchPlaceholder")}
            className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          />
        </div>

        {/* Product Table */}
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="p-3">{t("dash.barcode.colProduct")}</th>
                <th className="p-3">{t("dash.barcode.colSku")}</th>
                <th className="p-3">{t("dash.barcode.colCode")}</th>
                <th className="p-3">{t("dash.barcode.colQty")}</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody>
              {selectedProducts.map((p) => (
                <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-3 flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded" />
                    {p.name}
                  </td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p.code}</td>

                  {/* Qty */}
                  <td className="p-3">
                    <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
                      <button
                        onClick={() => decreaseQty(p.id)}
                        className="px-3 py-1 text-gray-600 dark:text-gray-300"
                      >
                        -
                      </button>
                      <span className="px-3">{p.qty}</span>
                      <button
                        onClick={() => increaseQty(p.id)}
                        className="px-3 py-1 text-gray-600 dark:text-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => removeProduct(p.id)}
                      className="text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paper Size + Toggles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <label className="block">
            <span className="font-medium text-gray-700 dark:text-gray-300">{t("dash.barcode.paperSize")}</span>
            <select className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
              <option>{t("dash.barcode.selectPlaceholder")}</option>
              <option>A4</option>
              <option>50x25</option>
            </select>
          </label>

          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <span>{t("dash.barcode.showStore")}</span>
            <input
              type="checkbox"
              checked={showStoreName}
              onChange={() => setShowStoreName(!showStoreName)}
            />
          </div>

          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <span>{t("dash.barcode.showProduct")}</span>
            <input
              type="checkbox"
              checked={showProductName}
              onChange={() => setShowProductName(!showProductName)}
            />
          </div>

          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <span>{t("dash.barcode.showPrice")}</span>
            <input
              type="checkbox"
              checked={showPrice}
              onChange={() => setShowPrice(!showPrice)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 text-white rounded dark:bg-yellow-600 dark:hover:bg-yellow-500"
            onClick={() => setModalOpen(true)}
          >
            <Eye/> {t("dash.barcode.generate")}
          </button>

          <button
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white rounded dark:bg-blue-700 dark:hover:bg-blue-600"
            onClick={resetAll}
          >
           <RefreshCcwIcon/> {t("dash.barcode.reset")}
          </button>

          <button
            className="bg-red-500 hover:bg-red-600 px-5 py-2 text-white rounded"
            onClick={() => setModalOpen(true)}
          >
            <Printer/> {t("dash.barcode.print")}
          </button>
        </div>
      </div>

      {modalOpen && (
        <BarcodeModal
          products={selectedProducts}
          showStoreName={showStoreName}
          showProductName={showProductName}
          showPrice={showPrice}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
