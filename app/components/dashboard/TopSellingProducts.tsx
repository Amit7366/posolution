"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Product {
  name: string;
  price: string;
  sales: string;
  image: string;
  growth: number;
}

const products: Product[] = [
  {
    name: "Charger Cable - Lighting",
    price: "$187",
    sales: "247+ Sales",
    growth: 25,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-01.jpg",
  },
  {
    name: "Yves Saint Eau De Parfum",
    price: "$145",
    sales: "289+ Sales",
    growth: 25,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-16.jpg",
  },
  {
    name: "Apple Airpods 2",
    price: "$458",
    sales: "300+ Sales",
    growth: 25,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-03.jpg",
  },
  {
    name: "Vacuum Cleaner",
    price: "$139",
    sales: "225+ Sales",
    growth: -21,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-04.jpg",
  },
  {
    name: "Samsung Galaxy S21 Fe 5g",
    price: "$898",
    sales: "365+ Sales",
    growth: 25,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-05.jpg",
  },
];

export default function TopSellingProducts() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
          🧊 Top Selling Products
        </h2>

        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="border px-3 py-1 rounded-md text-sm flex items-center gap-1"
        >
          Today <ChevronDown size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {products.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b pb-4 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <img
                src={p.image}
                className="w-14 h-14 rounded-md object-cover"
                alt={p.name}
              />

              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {p.name}
                </h3>
                <p className="text-gray-500">{p.price} • {p.sales}</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 text-xs rounded-full ${
                p.growth >= 0
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {p.growth >= 0 ? `⬆ ${p.growth}%` : `⬇ ${Math.abs(p.growth)}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
