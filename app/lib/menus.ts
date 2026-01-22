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
  link?: string;
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
    link: "/dashboard",
    role: "all",
  },

  // INVENTORY
  {
    section: "Inventory",
    title: "Products",
    icon: Boxes,
    link: "/dashboard/products",
    role: "admin",
  },
  {
    title: "Create Product",
    icon: Package,
    link: "/dashboard/products/create",
    role: "admin",
  },
  {
    title: "Expired Products",
    icon: Clock3,
    link: "/dashboard/products/expired",
    role: "admin",
  },
  {
    title: "Low Stocks",
    icon: AlertTriangle,
    link: "/dashboard/products/low-stock",
    role: "admin",
  },
  {
    title: "Category",
    icon: Layers,
    link: "/dashboard/category",
    role: "admin",
  },
  {
    title: "Sub Category",
    icon: ListTree,
    link: "/dashboard/sub-category",
    role: "admin",
  },
  {
    title: "Brands",
    icon: Tags,
    link: "/dashboard/brands",
    role: "admin",
  },
  {
    title: "Units",
    icon: ListChecks,
    link: "/dashboard/units",
    role: "admin",
  },
  {
    title: "Variant Attributes",
    icon: ClipboardCheck,
    link: "/dashboard/variants",
    role: "admin",
  },
  {
    title: "Warranties",
    icon: RefreshCcw,
    link: "/dashboard/warranties",
    role: "admin",
  },
  {
    title: "Print Barcode",
    icon: Barcode,
    link: "/dashboard/barcode",
    role: "admin",
  },
  {
    title: "Print QR Code",
    icon: QrCode,
    link: "/dashboard/qrcode",
    role: "admin",
  },

  // STOCK
  {
    section: "Stock",
    title: "Manage Stock",
    icon: Layers3,
    link: "/dashboard/stock",
    role: "admin",
  },
  // {
  //   title: "Stock Adjustment",
  //   icon: RefreshCcw,
  //   link: "/dashboard/stock/adjustment",
  //   role: "admin",
  // },
  // {
  //   title: "Stock Transfer",
  //   icon: ArrowLeftRight,
  //   link: "/dashboard/stock/transfer",
  //   role: "admin",
  // },

  // SALES
  {
    section: "Sales",
    title: "Sales",
    icon: ShoppingCart,
    link: "/dashboard/sales",
    role: "admin",
    children: [
      {
        title: "Invoices",
        icon: FileText,
        link: "/dashboard/sales/invoices",
        role: "admin",
      },
      {
        title: "Sales Return",
        icon: Undo2,
        link: "/dashboard/sales/return",
        role: "admin",
      },
      // {
      //   title: "Quotation",
      //   icon: FileSignature,
      //   link: "/dashboard/sales/quotation",
      //   role: "admin",
      // },
    ],
  },

  // // ACCOUNT
  // {
  //   section: "Account",
  //   title: "Profile",
  //   icon: Users,
  //   link: "/dashboard/profile",
  //   role: "admin",
  // },
  // {
  //   title: "Settings",
  //   icon: Settings,
  //   link: "/dashboard/settings",
  //   role: "admin",
  // },
];
