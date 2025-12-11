"use client";

import { useState } from "react";

export default function PosCart() {
  const [items] = useState([
    { id: 1, name: "Coca Cola", qty: 2, price: 40 },
  ]);

  const total = items.reduce((t, i) => t + i.qty * i.price, 0);

  return (
    <div className="flex flex-col h-full p-4 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
        Cart
      </h2>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
          >
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="text-sm text-gray-500">{i.qty} × {i.price}</p>
            </div>
            <p className="font-bold text-gray-800 dark:text-gray-100">
              {i.qty * i.price} ৳
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Total: {total} ৳
        </p>

        <button className="w-full bg-orange-600 text-white py-3 rounded-lg mt-3 text-lg font-semibold">
          Checkout
        </button>
      </div>
    </div>
  );
}
