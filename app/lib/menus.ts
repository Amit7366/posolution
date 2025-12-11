import {
  Home,
  Users,
  UserCog,
  Settings,
  Boxes,
  Package,
  Clock3,
  AlertTriangle,
  Layers,
  ListTree,
  Tags,
  ListChecks,
  ClipboardCheck,
  Barcode,
  QrCode,
  Layers3,
  RefreshCcw,
  ArrowLeftRight,
  ShoppingCart,
  FileText,
  Undo2,
  FileSignature,
} from "lucide-react";

export interface MenuItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  role?: "admin" | "user" | "all";
  section?: string;
  children?: MenuItem[];
}

export const sidebarMenus: MenuItem[] = [
  // MAIN
  {
    section: "Main",
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
    role: "all",
  },

  // INVENTORY
  {
    section: "Inventory",
    title: "Products",
    icon: Boxes,
    href: "/dashboard/products",
    role: "admin",
  },
  {
    title: "Create Product",
    icon: Package,
    href: "/dashboard/products/create",
    role: "admin",
  },
  {
    title: "Expired Products",
    icon: Clock3,
    href: "/dashboard/products/expired",
    role: "admin",
  },
  {
    title: "Low Stocks",
    icon: AlertTriangle,
    href: "/dashboard/products/low-stock",
    role: "admin",
  },
  {
    title: "Category",
    icon: Layers,
    href: "/dashboard/category",
    role: "admin",
  },
  {
    title: "Sub Category",
    icon: ListTree,
    href: "/dashboard/sub-category",
    role: "admin",
  },
  {
    title: "Brands",
    icon: Tags,
    href: "/dashboard/brands",
    role: "admin",
  },
  {
    title: "Units",
    icon: ListChecks,
    href: "/dashboard/units",
    role: "admin",
  },
  {
    title: "Variant Attributes",
    icon: ClipboardCheck,
    href: "/dashboard/variants",
    role: "admin",
  },
  {
    title: "Warranties",
    icon: RefreshCcw,
    href: "/dashboard/warranties",
    role: "admin",
  },
  {
    title: "Print Barcode",
    icon: Barcode,
    href: "/dashboard/barcode",
    role: "admin",
  },
  {
    title: "Print QR Code",
    icon: QrCode,
    href: "/dashboard/qrcode",
    role: "admin",
  },

  // STOCK
  {
    section: "Stock",
    title: "Manage Stock",
    icon: Layers3,
    href: "/dashboard/stock",
    role: "admin",
  },
  {
    title: "Stock Adjustment",
    icon: RefreshCcw,
    href: "/dashboard/stock/adjustment",
    role: "admin",
  },
  {
    title: "Stock Transfer",
    icon: ArrowLeftRight,
    href: "/dashboard/stock/transfer",
    role: "admin",
  },

  // SALES
  {
    section: "Sales",
    title: "Sales",
    icon: ShoppingCart,
    href: "/dashboard/sales",
    role: "admin",
    children: [
      {
        title: "Invoices",
        icon: FileText,
        href: "/dashboard/sales/invoices",
        role: "admin",
      },
      {
        title: "Sales Return",
        icon: Undo2,
        href: "/dashboard/sales/return",
        role: "admin",
      },
      {
        title: "Quotation",
        icon: FileSignature,
        href: "/dashboard/sales/quotation",
        role: "admin",
      },
    ],
  },

  // ACCOUNT
  {
    section: "Account",
    title: "Profile",
    icon: Users,
    href: "/dashboard/profile",
    role: "admin",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    role: "admin",
  },
];
