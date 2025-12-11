"use client";

import { ChevronDown } from "lucide-react";

const sales = [
  {
    product: "Apple Watch Series 9",
    category: "Electronics",
    price: "$640",
    status: "Processing",
    date: "Today",
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-11.jpg",
  },
  {
    product: "Gold Bracelet",
    category: "Fashion",
    price: "$126",
    status: "Cancelled",
    date: "Today",
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-12.jpg",
  },
  {
    product: "Parachute Down Duvet",
    category: "Health",
    price: "$69",
    status: "Onhold",
    date: "15 Jan 2025",
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-13.jpg",
  },
  {
    product: "YETI Rambler Tumbler",
    category: "Sports",
    price: "$65",
    status: "Processing",
    date: "12 Jan 2025",
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-14.jpg",
  },
  {
    product: "Osmo Genius Starter Kit",
    category: "Lifestyles",
    price: "$87.56",
    status: "Completed",
    date: "11 Jan 2025",
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-15.jpg",
  }
];

const statusColor: any = {
  Processing: "bg-purple-100 text-purple-600",
  Cancelled: "bg-red-100 text-red-600",
  Onhold: "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
};

export default function RecentSales() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
          🧊 Recent Sales
        </h2>

        <button className="border px-3 py-1 rounded-md text-sm flex items-center gap-1">
          Weekly <ChevronDown size={16} />
        </button>
      </div>

      {sales.map((item, i) => (
        <div
          key={i}
          className="flex justify-between items-center border-b pb-4 last:border-b-0 mb-4"
        >
          <div className="flex gap-3">
            <img
              src={item.image}
              alt={item.product}
              className="w-14 h-14 rounded-md object-cover"
            />
            <div>
              <h3 className="font-semibold">{item.product}</h3>
              <p className="text-gray-500 text-sm">
                {item.category} • {item.price}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-gray-500 text-sm">{item.date}</p>
            <span className={`px-3 py-1 text-xs rounded-full mt-1 ${statusColor[item.status]}`}>
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
