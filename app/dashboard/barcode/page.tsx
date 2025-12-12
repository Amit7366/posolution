"use client";

import { useState } from "react";
import BarcodeModal from "./BarcodeModal";
import { Eye, Printer, RefreshCcwIcon } from "lucide-react";

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
    <div className="p-6 text-gray-200">
      <h1 className="text-xl font-semibold">Print Barcode</h1>
      <p className="text-gray-400">Manage your barcodes</p>

      <div className="bg-gray-800 mt-5 p-6 rounded-xl shadow-xl border border-gray-700">

        {/* Warehouse + Store */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="font-medium">Warehouse *</span>
            <select className="mt-1 w-full bg-gray-900 border border-gray-700 p-2 rounded text-gray-200">
              <option>Select</option>
            </select>
          </label>

          <label className="block">
            <span className="font-medium">Store *</span>
            <select className="mt-1 w-full bg-gray-900 border border-gray-700 p-2 rounded text-gray-200">
              <option>Select</option>
            </select>
          </label>
        </div>

        {/* Product Search */}
        <div className="mt-6">
          <span className="font-medium">Product *</span>
          <input
            placeholder="Search Product by Code"
            className="mt-1 w-full bg-gray-900 border border-gray-700 p-2 rounded text-gray-200"
          />
        </div>

        {/* Product Table */}
        <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-700/40 text-gray-300">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Code</th>
                <th className="p-3">Qty</th>
                <th className="p-3"></th>
              </tr>
            </thead>

            <tbody>
              {selectedProducts.map((p) => (
                <tr key={p.id} className="border-t border-gray-700">
                  <td className="p-3 flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded" />
                    {p.name}
                  </td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p.code}</td>

                  {/* Qty */}
                  <td className="p-3">
                    <div className="flex items-center border border-gray-700 rounded-lg bg-gray-900">
                      <button
                        onClick={() => decreaseQty(p.id)}
                        className="px-3 py-1 text-gray-300"
                      >
                        -
                      </button>
                      <span className="px-3">{p.qty}</span>
                      <button
                        onClick={() => increaseQty(p.id)}
                        className="px-3 py-1 text-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => removeProduct(p.id)}
                      className="text-red-400 hover:text-red-300"
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
            <span className="font-medium">Paper Size *</span>
            <select className="mt-1 w-full bg-gray-900 border border-gray-700 p-2 rounded text-gray-200">
              <option>Select</option>
              <option>A4</option>
              <option>50x25</option>
            </select>
          </label>

          <div className="flex items-center gap-3">
            <span>Show Store Name</span>
            <input
              type="checkbox"
              checked={showStoreName}
              onChange={() => setShowStoreName(!showStoreName)}
            />
          </div>

          <div className="flex items-center gap-3">
            <span>Show Product Name</span>
            <input
              type="checkbox"
              checked={showProductName}
              onChange={() => setShowProductName(!showProductName)}
            />
          </div>

          <div className="flex items-center gap-3">
            <span>Show Price</span>
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
            className="bg-yellow-600 hover:bg-yellow-500 px-5 py-2 text-white rounded"
            onClick={() => setModalOpen(true)}
          >
            <Eye/> Generate Barcode
          </button>

          <button
            className="bg-blue-900 hover:bg-blue-800 px-5 py-2 text-white rounded"
            onClick={resetAll}
          >
           <RefreshCcwIcon/> Reset Barcode
          </button>

          <button
            className="bg-red-600 hover:bg-red-500 px-5 py-2 text-white rounded"
            onClick={() => setModalOpen(true)}
          >
            <Printer/> Print Barcode
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
