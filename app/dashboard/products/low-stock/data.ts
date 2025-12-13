import { LowStockProduct } from "./types";

export const LOW_STOCK_PRODUCTS: LowStockProduct[] = [
  {
    id: 1,
    warehouse: "Central Warehouse",
    store: "Dhaka Store",
    name: "iPhone 14 Pro",
    image:"https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/stock-img-01.png",
    category: "Electronics",
    sku: "IP14P-001",
    qty: 8,
    qtyAlert: 10,
  },
  {
    id: 2,
    warehouse: "Central Warehouse",
    store: "Chittagong Store",
    name: "Beats Pro",
    image:"https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/stock-img-06.png",
    category: "Accessories",
    sku: "BTP-009",
    qty: 5,
    qtyAlert: 12,
  },
  {
    id: 3,
    warehouse: "Backup Warehouse",
    store: "Sylhet Store",
    name: "Gaming Chair",
    image:"https://dreamspos.dreamstechnologies.com/html/template/assets/img/products/expire-product-02.png",
    category: "Furniture",
    sku: "GMC-210",
    qty: 3,
    qtyAlert: 6,
  },
];
