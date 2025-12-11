"use client";

const products = [
  { id: 1, name: "Coca Cola", price: 40 },
  { id: 2, name: "Pepsi", price: 35 },
  { id: 3, name: "Chips", price: 20 },
];

export default function PosProductGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((p) => (
        <button
          key={p.id}
          className="bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700 p-4 rounded-xl hover:shadow-md transition text-left"
        >
          <p className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</p>
          <p className="text-orange-600 font-bold mt-1">{p.price} ৳</p>
        </button>
      ))}
    </div>
  );
}
