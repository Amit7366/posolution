"use client";
import React from "react";

const TopCustomers = () => {
  const customers = [
    {
      name: "Carlos Curran",
      country: "USA",
      orders: 24,
      amount: "$8,964",
      img: "/avatars/1.png",
    },
    {
      name: "Stan Gaunter",
      country: "UAE",
      orders: 22,
      amount: "$16,985",
      img: "/avatars/2.png",
    },
    {
      name: "Richard Wilson",
      country: "Germany",
      orders: 14,
      amount: "$5,366",
      img: "/avatars/3.png",
    },
    {
      name: "Mary Bronson",
      country: "Belgium",
      orders: 8,
      amount: "$4,569",
      img: "/avatars/4.png",
    },
    {
      name: "Annie Tremblay",
      country: "Greenland",
      orders: 14,
      amount: "$3,569",
      img: "/avatars/5.png",
    },
  ];

  return (
    <div className="w-full rounded-xl border bg-white p-5 dark:bg-neutral-900 dark:border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-xl">👤</span>
          <h2 className="font-semibold text-lg">Top Customers</h2>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </button>
      </div>

      {/* List */}
      <div className="space-y-6">
        {customers.map((c, i) => (
          <div
            key={i}
            className="flex items-center justify-between pb-4 border-b last:border-none dark:border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <img
                src={c.img}
                alt={c.name}
                className="w-12 h-12 rounded-xl object-cover border dark:border-neutral-700"
              />
              <div>
                <h4 className="font-medium">{c.name}</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {c.country} • {c.orders} Orders
                </p>
              </div>
            </div>

            <p className="font-semibold">{c.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCustomers;
