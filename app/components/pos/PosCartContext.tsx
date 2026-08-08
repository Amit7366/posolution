"use client";

import {
  createContext,
  useCallback,
  useContext,
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

const WALKING: PosCustomer = {
  id: null,
  name: "Walking Customer",
};

const PosCartContext = createContext<PosCartContextValue | null>(null);

function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function PosCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PosCartItem[]>([]);
  const [customer, setCustomer] = useState<PosCustomer>(WALKING);
  const [cartDiscount, setCartDiscount] = useState(0);
  const [vatPercent, setVatPercent] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
    setCustomer(WALKING);
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

export { WALKING as WALKING_CUSTOMER };
