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
  CreditCard,
  Receipt,
  Monitor,
  Users,
  Wallet,
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
    titleKey: "sidebar.pos",
    icon: Monitor,
    link: "/pos",
    role: "all",
  },
  {
    sectionKey: "sidebar.sectionInventory",
    titleKey: "sidebar.products",
    icon: Boxes,
    link: "/dashboard/products",
    role: "all",
  },
  {
    titleKey: "sidebar.createProduct",
    icon: Package,
    link: "/dashboard/products/create",
    role: "all",
  },
  {
    titleKey: "sidebar.expiredProducts",
    icon: Clock3,
    link: "/dashboard/products/expired",
    role: "all",
  },
  {
    titleKey: "sidebar.lowStocks",
    icon: AlertTriangle,
    link: "/dashboard/products/low-stock",
    role: "all",
  },
  {
    titleKey: "sidebar.category",
    icon: Layers,
    link: "/dashboard/category",
    role: "all",
  },
  {
    titleKey: "sidebar.subCategory",
    icon: ListTree,
    link: "/dashboard/sub-category",
    role: "all",
  },
  {
    titleKey: "sidebar.brands",
    icon: Tags,
    link: "/dashboard/brands",
    role: "all",
  },
  {
    titleKey: "sidebar.units",
    icon: ListChecks,
    link: "/dashboard/units",
    role: "all",
  },
  {
    titleKey: "sidebar.variantAttributes",
    icon: ClipboardCheck,
    link: "/dashboard/variants",
    role: "all",
  },
  {
    titleKey: "sidebar.warranties",
    icon: RefreshCcw,
    link: "/dashboard/warranties",
    role: "all",
  },
  {
    titleKey: "sidebar.printBarcode",
    icon: Barcode,
    link: "/dashboard/barcode",
    role: "all",
  },
  {
    titleKey: "sidebar.printQrCode",
    icon: QrCode,
    link: "/dashboard/qrcode",
    role: "all",
  },
  {
    sectionKey: "sidebar.sectionStock",
    titleKey: "sidebar.manageStock",
    icon: Layers3,
    link: "/dashboard/stock",
    role: "all",
  },
  {
    sectionKey: "sidebar.sectionSales",
    titleKey: "sidebar.sales",
    icon: ShoppingCart,
    link: "/dashboard/sales",
    role: "all",
    children: [
      {
        titleKey: "sidebar.customers",
        icon: Users,
        link: "/dashboard/customers",
        role: "all",
      },
      {
        titleKey: "sidebar.dues",
        icon: Wallet,
        link: "/dashboard/sales/dues",
        role: "all",
      },
      {
        titleKey: "sidebar.invoices",
        icon: FileText,
        link: "/dashboard/sales/invoices",
        role: "all",
      },
      {
        titleKey: "sidebar.salesReturn",
        icon: Undo2,
        link: "/dashboard/sales/return",
        role: "all",
      },
    ],
  },
  // Admin only: Payment Requests
  {
    sectionKey: "sidebar.sectionBilling",
    titleKey: "sidebar.paymentRequests",
    icon: Receipt,
    link: "/dashboard/payments",
    role: "admin",
  },
  // User only: Billing & Payment
  {
    sectionKey: "sidebar.sectionBilling",
    titleKey: "sidebar.billing",
    icon: CreditCard,
    link: "/dashboard/billing",
    role: "user",
  },
];
