import {
  Home,
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
  ShoppingCart,
  FileText,
  Undo2,
} from "lucide-react";

export interface MenuItem {
  /** i18n key under dictionaries, e.g. sidebar.dashboard */
  titleKey: string;
  icon: React.ElementType;
  link?: string;
  role?: "admin" | "user" | "all";
  /** i18n key for section label, e.g. sidebar.sectionMain */
  sectionKey?: string;
  children?: MenuItem[];
}

export const sidebarMenus: MenuItem[] = [
  {
    sectionKey: "sidebar.sectionMain",
    titleKey: "sidebar.dashboard",
    icon: Home,
    link: "/dashboard",
    role: "all",
  },
  {
    sectionKey: "sidebar.sectionInventory",
    titleKey: "sidebar.products",
    icon: Boxes,
    link: "/dashboard/products",
    role: "admin",
  },
  {
    titleKey: "sidebar.createProduct",
    icon: Package,
    link: "/dashboard/products/create",
    role: "admin",
  },
  {
    titleKey: "sidebar.expiredProducts",
    icon: Clock3,
    link: "/dashboard/products/expired",
    role: "admin",
  },
  {
    titleKey: "sidebar.lowStocks",
    icon: AlertTriangle,
    link: "/dashboard/products/low-stock",
    role: "admin",
  },
  {
    titleKey: "sidebar.category",
    icon: Layers,
    link: "/dashboard/category",
    role: "admin",
  },
  {
    titleKey: "sidebar.subCategory",
    icon: ListTree,
    link: "/dashboard/sub-category",
    role: "admin",
  },
  {
    titleKey: "sidebar.brands",
    icon: Tags,
    link: "/dashboard/brands",
    role: "admin",
  },
  {
    titleKey: "sidebar.units",
    icon: ListChecks,
    link: "/dashboard/units",
    role: "admin",
  },
  {
    titleKey: "sidebar.variantAttributes",
    icon: ClipboardCheck,
    link: "/dashboard/variants",
    role: "admin",
  },
  {
    titleKey: "sidebar.warranties",
    icon: RefreshCcw,
    link: "/dashboard/warranties",
    role: "admin",
  },
  {
    titleKey: "sidebar.printBarcode",
    icon: Barcode,
    link: "/dashboard/barcode",
    role: "admin",
  },
  {
    titleKey: "sidebar.printQrCode",
    icon: QrCode,
    link: "/dashboard/qrcode",
    role: "admin",
  },
  {
    sectionKey: "sidebar.sectionStock",
    titleKey: "sidebar.manageStock",
    icon: Layers3,
    link: "/dashboard/stock",
    role: "admin",
  },
  {
    sectionKey: "sidebar.sectionSales",
    titleKey: "sidebar.sales",
    icon: ShoppingCart,
    link: "/dashboard/sales",
    role: "admin",
    children: [
      {
        titleKey: "sidebar.invoices",
        icon: FileText,
        link: "/dashboard/sales/invoices",
        role: "admin",
      },
      {
        titleKey: "sidebar.salesReturn",
        icon: Undo2,
        link: "/dashboard/sales/return",
        role: "admin",
      },
    ],
  },
];
