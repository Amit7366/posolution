"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PosCartItem = {
  productId: string;
  name: string;
  sku?: string;
  price: number;
  qty: number;
  stock: number;
  image?: string;
  unitLabel?: string;
};

export type PosCustomer = {
  id: string | null;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

type PosCartContextValue = {
  items: PosCartItem[];
  customer: PosCustomer;
  cartDiscount: number;
  vatPercent: number;
  detailsOpen: boolean;
  setDetailsOpen: (v: boolean) => void;
  setCustomer: (c: PosCustomer) => void;
  setCartDiscount: (n: number) => void;
  setVatPercent: (n: number) => void;
  addItem: (item: Omit<PosCartItem, "qty"> & { qty?: number }) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  productCount: number;
  subTotal: number;
  discountTotal: number;
  vatAmount: number;
  grandTotal: number;
};

const STORAGE_KEY = "sohoj-pos-cart";

const UNSELECTED_ID = "__unselected__";

const UNSELECTED: PosCustomer = {
  id: UNSELECTED_ID,
  name: "Select a customer",
};

const WALKING: PosCustomer = {
  id: null,
  name: "Walking Customer",
};

export function isCustomerSelected(c: PosCustomer) {
  return c.id !== UNSELECTED_ID;
}

type PersistedCart = {
  items: PosCartItem[];
  customer: PosCustomer;
  cartDiscount: number;
  vatPercent: number;
};

function isValidItem(v: unknown): v is PosCartItem {
  if (!v || typeof v !== "object") return false;
  const i = v as PosCartItem;
  return (
    typeof i.productId === "string" &&
    typeof i.name === "string" &&
    typeof i.price === "number" &&
    typeof i.qty === "number" &&
    typeof i.stock === "number" &&
    i.qty > 0
  );
}

function isValidCustomer(v: unknown): v is PosCustomer {
  if (!v || typeof v !== "object") return false;
  const c = v as PosCustomer;
  return (
    (c.id === null || typeof c.id === "string") &&
    typeof c.name === "string" &&
    c.name.length > 0
  );
}

function loadPersistedCart(): PersistedCart {
  if (typeof window === "undefined") {
    return { items: [], customer: UNSELECTED, cartDiscount: 0, vatPercent: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { items: [], customer: UNSELECTED, cartDiscount: 0, vatPercent: 0 };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedCart>;
    const items = Array.isArray(parsed.items) ? parsed.items.filter(isValidItem) : [];
    const customer = isValidCustomer(parsed.customer) ? parsed.customer : UNSELECTED;
    const cartDiscount =
      typeof parsed.cartDiscount === "number" && parsed.cartDiscount >= 0
        ? parsed.cartDiscount
        : 0;
    const vatPercent =
      typeof parsed.vatPercent === "number" && parsed.vatPercent >= 0
        ? parsed.vatPercent
        : 0;
    return { items, customer, cartDiscount, vatPercent };
  } catch {
    return { items: [], customer: UNSELECTED, cartDiscount: 0, vatPercent: 0 };
  }
}

const PosCartContext = createContext<PosCartContextValue | null>(null);

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function PosCartProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [items, setItems] = useState<PosCartItem[]>([]);
  const [customer, setCustomer] = useState<PosCustomer>(UNSELECTED);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [vatPercent, setVatPercent] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const saved = loadPersistedCart();
    setItems(saved.items);
    setCustomer(saved.customer);
    setCartDiscount(saved.cartDiscount);
    setVatPercent(saved.vatPercent);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: PersistedCart = {
        items,
        customer,
        cartDiscount,
        vatPercent,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore quota / private mode */
    }
  }, [hydrated, items, customer, cartDiscount, vatPercent]);

  const addItem = useCallback((item: Omit<PosCartItem, "qty"> & { qty?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      const addQty = item.qty ?? 1;
      if (existing) {
        const nextQty = Math.min(existing.stock, existing.qty + addQty);
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, qty: nextQty, stock: item.stock } : i
        );
      }
      const qty = Math.min(item.stock, Math.max(1, addQty));
      return [...prev, { ...item, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const next = Math.max(0, Math.min(i.stock, Math.floor(qty)));
          return { ...i, qty: next };
        })
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCartDiscount(0);
    setVatPercent(0);
    setCustomer(UNSELECTED);
    setDetailsOpen(false);
  }, []);

  const subTotal = useMemo(
    () => roundMoney(items.reduce((s, i) => s + i.qty * i.price, 0)),
    [items]
  );
  const discountTotal = useMemo(
    () => roundMoney(Math.min(subTotal, Math.max(0, cartDiscount))),
    [subTotal, cartDiscount]
  );
  const vatAmount = useMemo(() => {
    const base = roundMoney(subTotal - discountTotal);
    return roundMoney((base * Math.max(0, vatPercent)) / 100);
  }, [subTotal, discountTotal, vatPercent]);
  const grandTotal = useMemo(
    () => roundMoney(subTotal - discountTotal + vatAmount),
    [subTotal, discountTotal, vatAmount]
  );
  const productCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  const value: PosCartContextValue = {
    items,
    customer,
    cartDiscount,
    vatPercent,
    detailsOpen,
    setDetailsOpen,
    setCustomer,
    setCartDiscount,
    setVatPercent,
    addItem,
    setQty,
    removeItem,
    clearCart,
    productCount,
    subTotal,
    discountTotal,
    vatAmount,
    grandTotal,
  };

  return <PosCartContext.Provider value={value}>{children}</PosCartContext.Provider>;
}

export function usePosCart() {
  const ctx = useContext(PosCartContext);
  if (!ctx) throw new Error("usePosCart must be used within PosCartProvider");
  return ctx;
}

export { WALKING as WALKING_CUSTOMER, UNSELECTED as UNSELECTED_CUSTOMER };
