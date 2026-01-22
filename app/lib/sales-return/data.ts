
import { Customer, Product, SalesReturn } from "@/app/types/sales-return";


export const customers: Customer[] = [
  { id: "c1", name: "Carl Evans", avatar: "https://i.pravatar.cc/40?img=12" },
  { id: "c2", name: "Minerva Rameriz", avatar: "https://i.pravatar.cc/40?img=32" },
  { id: "c3", name: "Robert Lamon", avatar: "https://i.pravatar.cc/40?img=22" },
  { id: "c4", name: "Mark Joslyn", avatar: "https://i.pravatar.cc/40?img=15" },
  { id: "c5", name: "Patricia Lewis", avatar: "https://i.pravatar.cc/40?img=47" },
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Lenovo IdeaPad 3",
    code: "HG3FK",
    sku: "PT002",
    image: "https://cdn-icons-png.flaticon.com/512/732/732228.png",
    stock: 120,
    price: 1000,
  },
  {
    id: "p2",
    name: "Apple tablet",
    code: "AP12",
    sku: "AP009",
    image: "https://cdn-icons-png.flaticon.com/512/0/747.png",
    stock: 80,
    price: 1500,
  },
  {
    id: "p3",
    name: "Nike Jordan",
    code: "NK22",
    sku: "NK110",
    image: "https://cdn-icons-png.flaticon.com/512/732/732190.png",
    stock: 60,
    price: 800,
  },
  {
    id: "p4",
    name: "Apple Earpods",
    code: "AE88",
    sku: "AE001",
    image: "https://cdn-icons-png.flaticon.com/512/1067/1067555.png",
    stock: 400,
    price: 300,
  },
];

export const seedSalesReturns: SalesReturn[] = [
  {
    id: "sr1",
    productName: "Lenovo IdeaPad 3",
    productImage: products[0].image,
    date: "2022-11-19",
    customer: customers[0],
    status: "Received",
    total: 1000,
    paid: 1000,
    due: 0,
    paymentStatus: "Paid",
    reference: "32RRR554",
    lines: [
      {
        id: "l1",
        productId: "p1",
        name: "Lenovo IdeaPad 3",
        price: 1000,
        stock: 120,
        qty: 1,
        discount: 0,
        taxPct: 0,
        subtotal: 1000,
      },
    ],
    orderTax: 0,
    discount: 0,
    shipping: 0,
  },
  {
    id: "sr2",
    productName: "Apple tablet",
    productImage: products[1].image,
    date: "2022-11-19",
    customer: customers[1],
    status: "Pending",
    total: 1500,
    paid: 0,
    due: 1500,
    paymentStatus: "Unpaid",
    reference: "555444",
    lines: [
      {
        id: "l2",
        productId: "p2",
        name: "Apple tablet",
        price: 1500,
        stock: 80,
        qty: 1,
        discount: 0,
        taxPct: 0,
        subtotal: 1500,
      },
    ],
    orderTax: 0,
    discount: 0,
    shipping: 0,
  },
];
