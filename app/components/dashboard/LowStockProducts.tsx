"use client";

const lowStock = [
  {
    name: "Dell XPS 13",
    id: "#665814",
    stock: 8,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-06.jpg",
  },
  {
    name: "Vacuum Cleaner Robot",
    id: "#940004",
    stock: 14,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-07.jpg",
  },
  {
    name: "KitchenAid Stand Mixer",
    id: "#325569",
    stock: 21,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-08.jpg",
  },
  {
    name: "Levi's Trucker Jacket",
    id: "#124588",
    stock: 12,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-09.jpg",
  },
  {
    name: "Lay's Classic",
    id: "#365586",
    stock: 10,
    image: "https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/product-10.jpg",
  },
];

export default function LowStockProducts() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-2">
          ⚠ Low Stock Products
        </h2>

        <button className="text-blue-500 text-sm">View All</button>
      </div>

      <div className="flex flex-col gap-4">
        {lowStock.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b pb-4 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.image}
                className="w-14 h-14 rounded-md object-cover"
                alt={item.name}
              />

              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500 text-sm">ID: {item.id}</p>
              </div>
            </div>

            <p className="text-orange-600 font-semibold">
              InStock <span className="text-black dark:text-white ml-1">{item.stock}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
